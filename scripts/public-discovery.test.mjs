import { test } from "node:test";
import assert from "node:assert/strict";
import { discoveryAssets, discoveryOptions } from "./public-discovery.mjs";

const env = {
    VITE_PUBLIC_DISCOVERY: "true",
    VITE_PUBLIC_SITE_URL: "https://example.test/",
    VITE_INDEXNOW_KEY: "public-key-123",
};
test("discovery is opt-in and rejects missing origins and customer identities", () => {
    assert.equal(discoveryOptions(null, {}), null);
    assert.equal(discoveryOptions({ name: "Acme" }, {}), null);
    assert.throws(() => discoveryOptions({ name: "Acme" }, env), /default template identity/);
    assert.throws(() => discoveryOptions(null, { VITE_PUBLIC_DISCOVERY: "true" }), /requires/);
    for (const VITE_PUBLIC_SITE_URL of [
        "ftp://example.test",
        "https://user:pass@example.test",
        "https://example.test/path",
        "https://example.test/?q=1",
    ])
        assert.throws(() => discoveryOptions(null, { ...env, VITE_PUBLIC_SITE_URL }));
    assert.throws(() => discoveryOptions(null, { ...env, VITE_INDEXNOW_KEY: "../key" }));
});
test("static pages contain localized content, reciprocal language URLs and only public sitemap entries", () => {
    const assets = discoveryAssets(discoveryOptions(null, env), ["assets/app.css"]);
    for (const [path, lang] of [
        ["about/index.html", "en"],
        ["about/ko/index.html", "ko"],
    ]) {
        const html = assets[path];
        assert.match(html, new RegExp(`<html lang="${lang}">`));
        assert.match(html, /git clone --recurse-submodules/);
        assert.match(html, /<h1>/);
        assert.match(html, /hreflang="en" href="https:\/\/example.test\/about\/"/);
        assert.match(html, /hreflang="ko" href="https:\/\/example.test\/about\/ko\/"/);
        assert.match(html, /rel="canonical"/);
        assert.doesNotMatch(html, /type="module"|<script src|noindex|undefined|\{\{/);
    }
    assert.equal((assets["sitemap.xml"].match(/<loc>/g) || []).length, 2);
    assert.doesNotMatch(assets["sitemap.xml"], /login|settings|profile|demo|localhost|lastmod/);
    assert.match(assets["robots.txt"], /User-agent: GPTBot\nDisallow: \/\n/);
    assert.match(assets["robots.txt"], /User-agent: ClaudeBot\nDisallow: \/\n/);
    assert.match(assets["robots.txt"], /PerplexityBot\nAllow: \//);
    assert.equal(assets["public-key-123.txt"], "public-key-123");
    const manifest = JSON.parse(assets["discovery-manifest.json"]);
    assert.deepEqual(Object.keys(manifest.pages), [
        "https://example.test/about/",
        "https://example.test/about/ko/",
    ]);
    // Rebundled CSS alone should not trigger content notifications.
    assert.equal(
        discoveryAssets(discoveryOptions(null, env), ["assets/rebuilt.css"])[
            "discovery-manifest.json"
        ],
        assets["discovery-manifest.json"],
    );
});

test("prefixed public documents retain canonical URLs, assets and app navigation", () => {
    const options = discoveryOptions(null, { ...env, VITE_BASE_PATH: "/demos/alpha" });
    const assets = discoveryAssets(options, ["assets/app.css"]);
    const html = assets["about/index.html"];
    assert.match(html, /href="\/demos\/alpha\/home"/);
    assert.match(html, /href="\/demos\/alpha\/assets\/app.css"/);
    assert.match(html, /https:\/\/example.test\/demos\/alpha\/about\//);
    assert.doesNotMatch(html, /(?:href|src)="\/(?:icons|home|about|assets)/);
    assert.match(assets["sitemap.xml"], /https:\/\/example.test\/demos\/alpha\/about\//);
});

test("development discovery recognizes and preserves the configured prefix", async () => {
    const { publicDiscoveryPlugin } = await import("./public-discovery.mjs");
    let middleware;
    publicDiscoveryPlugin(null, { VITE_BASE_PATH: "/qa/nested" }).configureServer({
        middlewares: {
            use(callback) {
                middleware = callback;
            },
        },
    });
    let status, headers, body;
    const response = {
        writeHead(code, values) {
            status = code;
            headers = values;
        },
        end(value) {
            body = value;
        },
    };
    middleware({ url: "/qa/nested/about", method: "GET" }, response, () =>
        assert.fail("unexpected fallback"),
    );
    assert.equal(status, 307);
    assert.equal(headers.Location, "/qa/nested/about/");
    middleware({ url: "/qa/nested/about/", method: "GET" }, response, () =>
        assert.fail("unexpected fallback"),
    );
    assert.equal(status, 200);
    assert.match(body, /href="\/qa\/nested\/home"/);
});
