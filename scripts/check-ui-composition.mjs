import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export function checkUiComposition(root) {
    const errors = [];
    const config = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile);
    if (config.error) return ["Cannot read tsconfig.json"];
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
    const program = ts.createProgram(parsed.fileNames, parsed.options);
    const checker = program.getTypeChecker();
    const relative = (file) => path.relative(root, file).split(path.sep).join("/");
    const resolve = (symbol) =>
        symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    const rendered = new Set();
    const index = program.getSourceFile(path.join(root, "src/components/ui/index.ts"));
    if (!index) return ["Shared UI barrel is missing"];
    const exports = checker
        .getExportsOfModule(checker.getSymbolAtLocation(index))
        .filter((symbol) => {
            const target = resolve(symbol);
            return target && (target.flags & ts.SymbolFlags.Value) !== 0;
        });
    const publicSymbols = new Set(exports.map(resolve));
    for (const source of program.getSourceFiles()) {
        const file = relative(source.fileName);
        if (!file.startsWith("src/components/ui/") || source === index) continue;
        const module = checker.getSymbolAtLocation(source);
        if (!module) continue;
        for (const symbol of checker.getExportsOfModule(module)) {
            const target = resolve(symbol);
            if (target && (target.flags & ts.SymbolFlags.Value) !== 0 && !publicSymbols.has(target))
                errors.push(
                    `${file}: export ${symbol.name} must be exposed through the shared UI barrel`,
                );
        }
    }
    for (const source of program.getSourceFiles()) {
        const file = relative(source.fileName);
        if (!/^src\/(components|pages)\//.test(file)) continue;
        const preview =
            file === "src/pages/main/ShowCasePage.tsx" ||
            file.startsWith("src/components/features/showcase/");
        const report = (node, message) =>
            errors.push(
                `${file}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}: ${message}`,
            );
        function visit(node) {
            if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
                const tag = node.tagName.getText(source);
                if (preview) rendered.add(resolve(checker.getSymbolAtLocation(node.tagName)));
                if (tag === "style")
                    report(node, "Use src/styles/app.css instead of a style element");
                for (const attribute of node.attributes.properties) {
                    if (!ts.isJsxAttribute(attribute)) continue;
                    if (attribute.name.text === "style") {
                        const text = attribute.initializer?.getText(source) ?? "";
                        // Explicit geometry-only exceptions used by the app shell and body portal.
                        const geometry =
                            (file === "src/components/layout/AppLayout.tsx" &&
                                /^\{\{\s*"--sidebar-expanded-width":\s*`\$\{sidebarWidth\}px`\s*\}\s*as CSSProperties\}$/.test(
                                    text,
                                )) ||
                            (file === "src/components/layout/ProfileDropdown.tsx" &&
                                text === "{accountPosition}");
                        if (!geometry)
                            report(
                                attribute,
                                "Move appearance to shared app.css; document geometry exceptions in the harness",
                            );
                    }
                    if (
                        attribute.name.text === "className" &&
                        /\bsettings-content-card__header\b/.test(
                            attribute.initializer?.getText(source) ?? "",
                        )
                    ) {
                        // A settings header belongs at the shell level, never inside a
                        // domain content/grid wrapper which adds another spacing layer.
                        let ancestor = ts.isJsxSelfClosingElement(node)
                            ? node.parent
                            : node.parent?.parent;
                        while (
                            ancestor &&
                            !ts.isJsxElement(ancestor) &&
                            !ts.isFunctionLike(ancestor)
                        )
                            ancestor = ancestor.parent;
                        if (ancestor && ts.isJsxElement(ancestor)) {
                            const classes =
                                ancestor.openingElement.attributes.properties
                                    .find(
                                        (item) =>
                                            ts.isJsxAttribute(item) &&
                                            item.name.text === "className",
                                    )
                                    ?.initializer?.getText(source) ?? "";
                            if (!/(?:^|[\s"'])settings-content-card(?:[\s"']|$)/.test(classes))
                                report(
                                    node,
                                    "Settings header must be a shell child or fragment root, not inside a content wrapper; see notes/page-families.md",
                                );
                        }
                    }
                    if (
                        tag === "button" &&
                        attribute.name.text === "className" &&
                        /ui-button/.test(attribute.initializer?.getText(source) ?? "") &&
                        file !== "src/components/ui/buttons/Button.tsx"
                    )
                        report(
                            attribute,
                            "Use the shared Button instead of copying ui-button styling",
                        );
                }
            }
            ts.forEachChild(node, visit);
        }
        visit(source);
    }
    for (const symbol of exports) {
        if (!rendered.has(resolve(symbol)))
            errors.push(`Showcase is missing shared UI export: ${symbol.name}`);
    }
    function checkStyles(directory) {
        if (!fs.existsSync(directory)) return;
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const file = path.join(directory, entry.name);
            if (entry.isDirectory()) checkStyles(file);
            else if (
                /\.(css|scss|sass|less)$/.test(file) &&
                relative(file) !== "src/styles/app.css"
            )
                errors.push(`${relative(file)}: shared styles belong in src/styles/app.css`);
        }
    }
    checkStyles(path.join(root, "src"));
    return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const errors = checkUiComposition(fileURLToPath(new URL("../", import.meta.url)));
    if (errors.length) {
        console.error(errors.join("\n"));
        process.exitCode = 1;
    } else console.log("UI composition check passed (shared styles and showcase coverage)");
}
