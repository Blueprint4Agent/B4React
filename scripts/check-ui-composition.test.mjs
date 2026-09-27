import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkUiComposition } from "./check-ui-composition.mjs";

function fixture(files = {}) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "b4-ui-harness-"));
    const defaults = {
        "tsconfig.json": JSON.stringify({
            compilerOptions: { jsx: "preserve", skipLibCheck: true },
            include: ["src"],
        }),
        "src/components/ui/Button.tsx": "export function Button() { return <button />; }",
        "src/components/ui/index.ts": 'export { Button } from "./Button";',
        "src/pages/main/ShowCasePage.tsx":
            'import {Button as Action} from "../../components/ui"; export function ShowCasePage(){return <Action/>;}',
    };
    for (const [name, content] of Object.entries({ ...defaults, ...files })) {
        const file = path.join(root, name);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content);
    }
    try {
        return checkUiComposition(root);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}
test("accepts shared components rendered under an import alias", () =>
    assert.deepEqual(fixture(), []));
test("rejects a public component without a rendered example", () =>
    assert.match(
        fixture({ "src/pages/main/ShowCasePage.tsx": "export const page = <div/>;" }).join(),
        /missing shared UI export: Button/,
    ));
test("rejects an unrelated component with the same name", () =>
    assert.match(
        fixture({
            "src/pages/main/ShowCasePage.tsx":
                "function Button(){return <div/>;} export const page = <Button/>;",
        }).join(),
        /missing shared UI export/,
    ));
test("rejects inline appearance and isolated stylesheets", () => {
    const errors = fixture({
        "src/pages/main/Other.tsx": "export const page = <div style={{padding: 20}}/>;",
        "src/pages/main/other.css": "body {}",
    });
    assert.equal(errors.length, 2);
});
test("rejects copied button classes", () =>
    assert.match(
        fixture({
            "src/pages/main/Other.tsx": 'export const page = <button className="ui-button"/>;',
        }).join(),
        /Use the shared Button/,
    ));
test("permits only the documented geometry expression", () => {
    assert.deepEqual(
        fixture({
            "src/components/layout/ProfileDropdown.tsx":
                "declare const accountPosition: {}; export const popup = <div style={accountPosition}/>;",
        }),
        [],
    );
    assert.match(
        fixture({
            "src/components/layout/ProfileDropdown.tsx":
                'export const popup = <div style={{color: "red"}}/>;',
        }).join(),
        /Move appearance/,
    );
});

test("rejects a shared component omitted from the public barrel", () =>
    assert.match(
        fixture({
            "src/components/ui/Missing.tsx": "export function Missing(){return <span/>;}",
        }).join(),
        /must be exposed through the shared UI barrel/,
    ));
