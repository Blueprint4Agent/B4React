import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createServer } from "node:http";
import {
    readStyles,
    applyStyles,
    createStudioMiddleware,
    styleStudioPlugin,
} from "./style-studio.mjs";

function fixture() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "b4-style-"));
    fs.mkdirSync(path.join(root, "src/styles"), { recursive: true });
    const file = path.join(root, "src/styles/app.css");
    fs.copyFileSync(new URL("../src/styles/app.css", import.meta.url), file);
    return { root, file, close: () => fs.rmSync(root, { recursive: true, force: true }) };
}
test("read is inert; apply changes only selected tokens, backs up, and rejects stale writes", () => {
    const f = fixture();
    try {
        const before = fs.readFileSync(f.file, "utf8");
        const snapshot = readStyles(f.root);
        assert.equal(fs.readFileSync(f.file, "utf8"), before);
        const next = applyStyles(f.root, {
            revision: snapshot.revision,
            changes: [
                { scope: "light", key: "--panel", value: "#abcdef" },
                { scope: "shared", key: "--radius-control", value: "1rem" },
            ],
        });
        assert.equal(next.values.light["--panel"], "#abcdef");
        assert.equal(next.values.shared["--radius-control"], "1rem");
        assert.deepEqual(next.values.dark, snapshot.values.dark);
        assert.equal(fs.readFileSync(path.join(f.root, next.backup), "utf8"), before);
        assert.equal(applyStyles(f.root, { revision: next.revision, changes: [] }).backup, null);
        assert.throws(
            () => applyStyles(f.root, { revision: snapshot.revision, changes: [] }),
            /conflict/,
        );
        fs.appendFileSync(f.file, "\n/* external edit */\n");
        assert.throws(
            () => applyStyles(f.root, { revision: next.revision, changes: [] }),
            /conflict/,
        );
    } finally {
        f.close();
    }
});
test("dark changes update explicit and system-dark values; typography survives formatting", () => {
    const f = fixture();
    try {
        const snapshot = readStyles(f.root);
        const next = applyStyles(f.root, {
            revision: snapshot.revision,
            changes: [
                { scope: "dark", key: "--button-hover-bg", value: "#123456" },
                { scope: "shared", key: "--font-family", value: "Georgia, serif" },
            ],
        });
        assert.equal(next.values.shared["--font-family"], "Georgia, serif");
        assert.equal(
            fs.readFileSync(f.file, "utf8").split("--button-hover-bg: #123456;").length,
            3,
        );
    } finally {
        f.close();
    }
});
test("invalid or unknown fields never write and symlink targets are rejected", () => {
    const f = fixture();
    try {
        const snapshot = readStyles(f.root);
        for (const change of [
            { scope: "light", key: "--panel", value: "url(https://example.com)" },
            { scope: "light", key: "--panel", value: "rgba(999, 0, 0, 1)" },
            { scope: "shared", key: "--radius-control", value: "-1rem" },
            { scope: "dark", key: "--font-family", value: "Georgia, serif" },
            { scope: "shared", key: "--font-family", value: "anything" },
            { scope: "light", key: "../../.env", value: "#123456" },
        ])
            assert.throws(
                () => applyStyles(f.root, { revision: snapshot.revision, changes: [change] }),
                /invalid_input/,
            );
        assert.equal(readStyles(f.root).revision, snapshot.revision);
        assert.equal(fs.existsSync(path.join(f.root, ".style-studio-backups")), false);
        fs.renameSync(f.file, f.file + ".original");
        fs.symlinkSync(f.file + ".original", f.file);
        assert.throws(() => readStyles(f.root), /unsafe_path/);
    } finally {
        f.close();
    }
});
test("middleware checks origin, capability, method and loopback; plugin excludes production", async () => {
    const f = fixture();
    const server = createServer(createStudioMiddleware(f.root, "fixture-token"));
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    try {
        const send = (headers, method = "POST", body = "{}") =>
            fetch(`${origin}/__b4f/style-studio/read`, {
                method,
                headers: { "Content-Type": "application/json", ...headers },
                ...(method === "POST" ? { body } : {}),
            });
        assert.equal((await send({ Origin: origin })).status, 403);
        assert.equal(
            (await send({ Origin: "http://evil.test", "X-Style-Studio-Token": "fixture-token" }))
                .status,
            403,
        );
        const headers = { Origin: origin, "X-Style-Studio-Token": "fixture-token" };
        assert.equal((await send(headers, "GET")).status, 405);
        assert.equal((await send(headers, "POST", "{")).status, 400);
        const good = await send(headers);
        assert.equal(good.status, 200);
        assert.equal((await good.json()).file, "src/styles/app.css");
        assert.equal(
            styleStudioPlugin(true).config({}, { command: "build" }).define.__STYLE_STUDIO__,
            "false",
        );
        assert.equal(
            styleStudioPlugin(false).config({}, { command: "serve" }).define.__STYLE_STUDIO__,
            "false",
        );
        assert.throws(
            () =>
                styleStudioPlugin(true).configureServer({
                    config: { server: { host: "0.0.0.0" } },
                }),
            /loopback/,
        );
    } finally {
        await new Promise((resolve) => server.close(resolve));
        f.close();
    }
});
