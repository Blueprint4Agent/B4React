import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const protectedTable = "src/components/features/admin/AdminUserTable.tsx";
const eagerPages = new Set([
    "ShowCasePage",
    "LoadingPage",
    "ShowCaseNotFoundPage",
    "ServerUnavailablePage",
]);

export function checkReactPerformance(root) {
    const config = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile);
    if (config.error) throw new Error("Cannot read tsconfig.json");
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
    const program = ts.createProgram(parsed.fileNames, parsed.options);
    const checker = program.getTypeChecker();
    const errors = [];
    const relative = (file) => path.relative(root, file).split(path.sep).join("/");
    function resolveSymbol(node) {
        let symbol = checker.getSymbolAtLocation(node);
        if (symbol?.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
        return symbol;
    }
    function origins(node) {
        return (resolveSymbol(node)?.declarations ?? []).map((declaration) =>
            relative(declaration.getSourceFile().fileName),
        );
    }
    function reactMemo(node) {
        const symbol = resolveSymbol(ts.isPropertyAccessExpression(node) ? node.name : node);
        return (
            symbol?.name === "memo" &&
            symbol.declarations?.some((declaration) =>
                /node_modules\/(?:@types\/)?react\//.test(
                    relative(declaration.getSourceFile().fileName),
                ),
            )
        );
    }
    let foundTable = false;
    for (const source of program.getSourceFiles()) {
        const file = relative(source.fileName);
        if (
            !file.startsWith("src/") ||
            file.startsWith("src/tests/") ||
            file.startsWith("src/api/generated/")
        )
            continue;
        const report = (node, message) => {
            const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
            errors.push(`${file}:${line + 1}: ${message}`);
        };
        if (file === protectedTable) {
            const module = checker.getSymbolAtLocation(source);
            const exported =
                module &&
                checker
                    .getExportsOfModule(module)
                    .find((symbol) => symbol.name === "AdminUserTable");
            foundTable = Boolean(
                exported?.declarations?.some(
                    (node) =>
                        ts.isVariableDeclaration(node) &&
                        node.initializer &&
                        ts.isCallExpression(node.initializer) &&
                        reactMemo(node.initializer.expression),
                ),
            );
            if (!foundTable)
                report(
                    source,
                    "AdminUserTable must retain its React.memo boundary; update measured evidence before changing this guard",
                );
        }
        const visit = (node) => {
            if (ts.isTypeNode(node)) return;
            if (ts.isImportDeclaration(node)) {
                if (node.importClause?.isTypeOnly) return;
                const bindings = node.importClause?.namedBindings;
                if (
                    bindings &&
                    ts.isNamedImports(bindings) &&
                    !node.importClause.name &&
                    bindings.elements.every((item) => item.isTypeOnly)
                )
                    return;
                const resolved = ts.resolveModuleName(
                    node.moduleSpecifier.text,
                    source.fileName,
                    parsed.options,
                    ts.sys,
                ).resolvedModule;
                const target = resolved && relative(resolved.resolvedFileName);
                if (
                    file === "src/App.tsx" &&
                    target?.startsWith("src/pages/") &&
                    !eagerPages.has(path.basename(target, ".tsx"))
                )
                    report(
                        node,
                        "Secondary pages must use module-level React.lazy, not eager imports",
                    );
            }
            if (ts.isIdentifier(node)) {
                const origin = origins(node);
                if (
                    origin.includes("src/hooks/api/config/useConfigApi.ts") &&
                    ![
                        "src/hooks/AppConfigProvider.tsx",
                        "src/hooks/api/config/useConfigApi.ts",
                    ].includes(file)
                )
                    report(
                        node,
                        "Consume shared useAppConfig; AppConfigProvider owns configuration requests",
                    );
                if (
                    origin.includes("src/api/config/configApi.ts") &&
                    ![
                        "src/api/config/configApi.ts",
                        "src/hooks/api/config/useConfigApi.ts",
                    ].includes(file)
                )
                    report(
                        node,
                        "Configuration API access belongs in useConfigApi and AppConfigProvider",
                    );
            }
            if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
                if (origins(node.tagName).includes(protectedTable)) {
                    for (const prop of node.attributes.properties) {
                        if (ts.isJsxSpreadAttribute(prop)) {
                            report(
                                prop,
                                "Pass explicit stable props to the protected memo boundary",
                            );
                            continue;
                        }
                        const value = prop.initializer;
                        const expression =
                            value && ts.isJsxExpression(value) ? value.expression : undefined;
                        if (
                            expression &&
                            (ts.isArrowFunction(expression) ||
                                ts.isFunctionExpression(expression) ||
                                ts.isObjectLiteralExpression(expression) ||
                                ts.isArrayLiteralExpression(expression) ||
                                ts.isNewExpression(expression) ||
                                ts.isJsxElement(expression) ||
                                ts.isJsxSelfClosingElement(expression) ||
                                ts.isJsxFragment(expression))
                        )
                            report(
                                prop,
                                "Avoid fresh object/array/function/element props at the protected memo boundary",
                            );
                    }
                }
            }
            ts.forEachChild(node, visit);
        };
        visit(source);
    }
    if (!program.getSourceFiles().some((source) => relative(source.fileName) === protectedTable))
        errors.push(`Missing protected memo boundary: ${protectedTable}`);
    return [...new Set(errors)];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const errors = checkReactPerformance(fileURLToPath(new URL("../", import.meta.url)));
    if (errors.length) {
        console.error(errors.join("\n"));
        process.exitCode = 1;
    } else
        console.log(
            "React performance boundaries passed (config ownership, lazy routes, stable memo boundary)",
        );
}
