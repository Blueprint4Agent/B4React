import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkReactPerformance } from "./check-react-performance.mjs";
const table = "src/components/features/admin/AdminUserTable.tsx";
function fixture(overrides = {}) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "b4-react-performance-"));
    const files = {
        "tsconfig.json": JSON.stringify({
            compilerOptions: { jsx: "preserve", moduleResolution: "node", skipLibCheck: true },
            include: ["src"],
        }),
        "node_modules/react/index.d.ts": "export declare function memo<T>(component: T): T;",
        [table]:
            'import {memo as optimize} from "react"; export const AdminUserTable = optimize(function Table(){return <table/>;});',
        "src/hooks/api/config/useConfigApi.ts": "export const useConfigApi = () => ({});",
        "src/hooks/AppConfigProvider.tsx":
            'import { useConfigApi } from "./api/config/useConfigApi"; export const config = useConfigApi();',
        "src/pages/settings/SettingsPage.tsx": "export const SettingsPage = () => null;",
        "src/App.tsx":
            'import {AdminUserTable as Table} from "./components/features/admin/AdminUserTable"; const rows = []; export const App = () => <Table items={rows}/>;',
        ...overrides,
    };
    for (const [name, content] of Object.entries(files)) {
        const file = path.join(root, name);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content);
    }
    try {
        return checkReactPerformance(root);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}
test("accepts aliased React.memo and stable props", () => assert.deepEqual(fixture(), []));
test("rejects loss of memo and same-name impostor", () => {
    for (const code of [
        "export function AdminUserTable(){return null;}",
        "const memo = (fn) => fn; export const AdminUserTable = memo(() => null);",
    ])
        assert.match(fixture({ [table]: code }).join(), /must retain its React.memo/);
});
test("rejects eager secondary page imports", () =>
    assert.match(
        fixture({
            "src/App.tsx":
                'import {SettingsPage} from "./pages/settings/SettingsPage"; export const App = SettingsPage;',
        }).join(),
        /Secondary pages/,
    ));
test("rejects duplicate config ownership through an alias", () =>
    assert.match(
        fixture({
            "src/hooks/useOther.ts":
                'import {useConfigApi as config} from "./api/config/useConfigApi"; export const useOther = config;',
        }).join(),
        /Consume shared useAppConfig/,
    ));
test("rejects fresh props through a component import alias", () =>
    assert.match(
        fixture({
            "src/App.tsx":
                'import {AdminUserTable as Table} from "./components/features/admin/AdminUserTable"; export const App = () => <Table items={[]}/>;',
        }).join(),
        /fresh object/,
    ));
test("permits type-only configuration imports", () =>
    assert.deepEqual(
        fixture({
            "src/hooks/useOther.ts":
                'import type {useConfigApi} from "./api/config/useConfigApi"; type Config = typeof useConfigApi;',
        }),
        [],
    ));
