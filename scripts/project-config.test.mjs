import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
    validateProjectConfig,
    readProjectConfig,
    brandHtml,
    sharingHtml,
    withProjectTauriArgs,
} from "./project-config.mjs";
const config = {
    version: 1,
    name: "Acme & Co",
    short_name: "Acme",
    identifier: "com.acme.app",
    logo_url: "/project-brand/logo.svg",
};
test("defaults are unchanged without local project config", () => {
    const root = mkdtempSync(path.join(tmpdir(), "b4-brand-"));
    try {
        assert.equal(readProjectConfig(root), null);
        writeFileSync(path.join(root, "project.local.json"), JSON.stringify(config));
        assert.deepEqual(readProjectConfig(root), config);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});
test("escapes names in HTML and uses public logo for favicon", () => {
    const html =
        '<title>Blueprint4FastAPI</title><link rel="icon" type="image/svg+xml" href="/icons/b4a-favicon.svg" />';
    assert.equal(brandHtml(html, null), html);
    assert.equal(
        brandHtml(html, config),
        '<title>Acme &amp; Co</title><link rel="icon" href="/project-brand/logo.svg" />',
    );
});
test("rejects unexpected fields, invalid identifiers, unsafe paths and wrong value types", () => {
    for (const change of [
        { password: "never-public" },
        { identifier: "bad" },
        { name: "<script>" },
        { short_name: "" },
        { version: true },
        { logo_url: "https://example.com/logo.svg" },
        { logo_url: "/../logo.svg" },
        { name: 123 },
    ])
        assert.throws(() => validateProjectConfig({ ...config, ...change }));
});
test("desktop override retains window geometry and explicit CLI overrides", () => {
    const base = JSON.parse(readFileSync(new URL("../src-tauri/tauri.conf.json", import.meta.url)));
    for (const command of [["dev"], ["build"], ["android", "build"], ["ios", "dev"], ["bundle"]]) {
        const args = withProjectTauriArgs(
            [...command, "--config", "custom.json", "--", "--features", "test"],
            base,
            config,
        );
        const override = JSON.parse(args[command.length + 1]);
        assert.equal(override.productName, config.name);
        assert.equal(override.identifier, config.identifier);
        assert.deepEqual(override.app.windows[0], { ...base.app.windows[0], title: config.name });
        assert.deepEqual(args.slice(command.length + 2), [
            "--config",
            "custom.json",
            "--",
            "--features",
            "test",
        ]);
    }
    assert.deepEqual(withProjectTauriArgs(["info"], base, config), ["info"]);
    assert.deepEqual(withProjectTauriArgs(["build"], base, null), ["build"]);
});

test("sharing metadata is static, escaped and origin-free by default", () => {
    const tags = sharingHtml(null);
    assert.match(tags, /name="description"/);
    assert.match(tags, /content="Blueprint4FastAPI"/);
    assert.doesNotMatch(tags, /og:url|og:image|twitter:image/);
    const custom = sharingHtml(config, { VITE_SITE_DESCRIPTION: '<hello "world"> & welcome' });
    assert.match(custom, /Acme &amp; Co/);
    assert.match(custom, /&lt;hello &quot;world&quot;&gt; &amp; welcome/);
    assert.doesNotMatch(custom, /Blueprint4FastAPI|b4a-banner/);
});
test("sharing URLs use the configured origin and project image only", () => {
    const env = { VITE_PUBLIC_SITE_URL: "https://preview.example.test/" };
    assert.match(sharingHtml(null, env), /https:\/\/preview.example.test\/icons\/b4a-banner.png/);
    assert.doesNotMatch(sharingHtml(config, env), /og:image|b4a-banner/);
    assert.match(
        sharingHtml({ ...config, logo_url: "/project-brand/logo.png" }, env),
        /https:\/\/preview.example.test\/project-brand\/logo.png/,
    );
    for (const VITE_PUBLIC_SITE_URL of [
        "ftp://example.test",
        "https://user:pass@example.test",
        "https://example.test/path",
        "https://example.test/?query=1",
        "https://example.test/#fragment",
        "bad",
    ])
        assert.throws(() => sharingHtml(null, { VITE_PUBLIC_SITE_URL }));
});
