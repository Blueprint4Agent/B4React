import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const configPath = path.join(root, "tsconfig.json");
const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
if (parsed.errors.length) throw new Error("Invalid tsconfig.json; run make check for diagnostics");
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const errors = [];
const relative = (file) => path.relative(root, file).split(path.sep).join("/");
const under = (file, dir) => file.startsWith(`${dir}/`);

function forbidden(file, component) {
    return under(file, "src/api") || (component && under(file, "src/hooks/api"));
}

function origins(symbol, seen = new Set()) {
    if (!symbol || seen.has(symbol)) return [];
    seen.add(symbol);
    if (symbol.flags & ts.SymbolFlags.Alias) return origins(checker.getAliasedSymbol(symbol), seen);
    return (symbol.declarations ?? []).map((declaration) =>
        relative(declaration.getSourceFile().fileName),
    );
}

for (const source of program.getSourceFiles()) {
    const file = relative(source.fileName);
    const component = under(file, "src/components");
    if (!component && !under(file, "src/pages")) continue;
    const report = (node, message) => {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        errors.push(`${file}:${line + 1}: ${message}`);
    };
    const checkSymbol = (node) => {
        const bad = origins(checker.getSymbolAtLocation(node)).find((origin) =>
            forbidden(origin, component),
        );
        if (bad)
            report(node, `runtime dependency on ${bad}; use page-owned domain hooks and props`);
    };
    const checkModule = (node, specifier, namespace = false) => {
        const name = specifier.text;
        if (["axios", "openapi-fetch"].some((pkg) => name === pkg || name.startsWith(`${pkg}/`))) {
            report(node, "HTTP clients belong in src/api, not pages/components");
        }
        const resolved = ts.resolveModuleName(
            name,
            source.fileName,
            parsed.options,
            ts.sys,
        ).resolvedModule;
        if (resolved && forbidden(relative(resolved.resolvedFileName), component)) {
            report(node, `runtime import of ${name} bypasses the domain hook boundary`);
        } else if (namespace) {
            const symbol = checker.getSymbolAtLocation(specifier);
            if (symbol) {
                for (const exported of checker.getExportsOfModule(symbol)) {
                    if (origins(exported).some((origin) => forbidden(origin, component))) {
                        report(
                            node,
                            `namespace/dynamic import of ${name} exposes forbidden runtime exports`,
                        );
                        break;
                    }
                }
            }
        }
    };
    const visit = (node) => {
        if (ts.isTypeNode(node)) return;
        if (ts.isImportDeclaration(node)) {
            const clause = node.importClause;
            if (clause?.isTypeOnly) return;
            const bindings = clause?.namedBindings;
            const named =
                bindings && ts.isNamedImports(bindings)
                    ? bindings.elements.filter((item) => !item.isTypeOnly)
                    : [];
            const namespace = bindings && ts.isNamespaceImport(bindings);
            if (clause && !clause.name && !namespace && !named.length && bindings?.elements?.length)
                return;
            checkModule(node, node.moduleSpecifier, Boolean(namespace));
            if (clause?.name) checkSymbol(clause.name);
            for (const item of named) checkSymbol(item.name);
        } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && !node.isTypeOnly) {
            const exports =
                node.exportClause && ts.isNamedExports(node.exportClause)
                    ? node.exportClause.elements.filter((item) => !item.isTypeOnly)
                    : null;
            if (exports?.length === 0) return;
            checkModule(node, node.moduleSpecifier, exports === null);
            for (const item of exports ?? []) checkSymbol(item.name);
        } else if (ts.isImportEqualsDeclaration(node) && !node.isTypeOnly) {
            report(node, "use static ES imports so layer dependencies remain explicit");
        } else if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
            const expression = node.expression;
            if (
                expression.kind === ts.SyntaxKind.ImportKeyword ||
                (ts.isIdentifier(expression) && expression.text === "require")
            ) {
                const argument = node.arguments?.[0];
                if (argument && ts.isStringLiteralLike(argument)) checkModule(node, argument, true);
                else report(node, "computed imports cannot be checked; use a literal module path");
            }
        }
        // Inspect references too, so assigning DOM fetch to an alias cannot bypass
        // the rule. A local callback named fetch and type-only references are legal.
        if (
            ts.isIdentifier(node) ||
            (ts.isStringLiteralLike(node) && ts.isElementAccessExpression(node.parent))
        ) {
            const symbol = checker.getSymbolAtLocation(node);
            if (
                symbol &&
                ["fetch", "XMLHttpRequest"].includes(symbol.name) &&
                symbol.declarations?.some((decl) =>
                    /lib\.(dom|webworker)\.d\.ts$/.test(decl.getSourceFile().fileName),
                )
            ) {
                report(node, "browser HTTP belongs in src/api; consume a domain hook");
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
}
if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
} else {
    console.log("Frontend architecture check passed (pages/components runtime boundaries)");
}
