import { normalizeBasePath } from "./base-path.mjs";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { sharingHtml } from "./project-config.mjs";

const escape = (value) =>
    String(value)
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
const repository = "https://github.com/Blueprint4Agent/B4FastAPI";
const paths = { en: "/about/", ko: "/about/ko/" };
const capabilities = ["identity", "interface", "billing", "storage", "operations", "realtime"];

export function discoveryOptions(project, env = {}) {
    const enabled = env.VITE_PUBLIC_DISCOVERY === "true";
    if (!enabled) return null;
    if (project)
        throw new Error(
            "Public B4A discovery requires the default template identity; custom projects must provide their own public content.",
        );
    if (!env.VITE_PUBLIC_SITE_URL?.trim())
        throw new Error("Public discovery requires VITE_PUBLIC_SITE_URL.");
    sharingHtml(project, env); // Reuse origin validation, including credentials/path rejection.
    const origin = new URL(env.VITE_PUBLIC_SITE_URL.trim()).origin;
    const key = env.VITE_INDEXNOW_KEY?.trim() || "";
    if (key && !/^[a-zA-Z0-9-]{8,128}$/.test(key))
        throw new Error("VITE_INDEXNOW_KEY must be 8-128 ASCII letters, digits or hyphens.");
    return { origin, key, basePath: normalizeBasePath(env.VITE_BASE_PATH) };
}

export function discoveryAssets(options, stylesheets) {
    const basePath = options.basePath || "";
    const publicRoot = options.origin + basePath;
    const assets = {};
    const pages = {};
    const alternates =
        Object.entries(paths)
            .map(
                ([locale, path]) =>
                    `<link rel="alternate" hreflang="${locale}" href="${escape(publicRoot + path)}" />`,
            )
            .join("\n") +
        `\n<link rel="alternate" hreflang="x-default" href="${escape(publicRoot + paths.en)}" />`;
    for (const [locale, pathname] of Object.entries(paths)) {
        const data = JSON.parse(
            readFileSync(new URL(`../src/locales/${locale}.json`, import.meta.url), "utf8"),
        );
        const copy = data.discovery;
        const home = data.home.project;
        const url = publicRoot + pathname;
        const other = locale === "en" ? "ko" : "en";
        const docRoot = `${repository}/blob/main/${locale === "ko" ? "notes/ko/" : ""}`;
        const link = (href, text) => `<a href="${escape(href)}">${escape(text)}</a>`;
        const section = (id, title, body) =>
            `<section id="${id}"><div class="home-section-heading"><h2>${escape(title)}</h2></div>${body}</section>`;
        const body = `<div class="public-discovery__wrapper">
<nav class="public-discovery__nav" aria-label="${escape(copy.nav)}">${link("/home", copy.app)} ${link(repository, copy.repository)} <a href="${paths[other]}" lang="${other}" hreflang="${other}">${escape(copy.language)}</a></nav>
<main class="home-overview">
<section class="home-hero"><p class="home-eyebrow">Blueprint4Agent · B4A</p><h1>${escape(copy.heading)}</h1><p class="home-hero__description">${escape(copy.description)}</p><p class="public-discovery__copy">${escape(copy.identity)}</p><div class="home-hero__actions">${link("#quick-start", copy.start)} ${link("#features", copy.features)} ${link(docRoot + "README.md", copy.docs)}</div><div class="home-stack"><span>FastAPI</span><span>React</span><span>TypeScript</span><span>Docker</span></div></section>
${section("features", copy.features, `<div class="home-capabilities__grid">${capabilities.map((key) => `<article class="home-capability"><span class="home-capability__top" aria-hidden="true">·</span><h3>${escape(home[key + "Title"])}</h3><p>${escape(home[key + "Description"])}</p></article>`).join("\n")}</div>`)}
${section("preview", copy.preview, `<figure class="home-preview__figure"><img src="/home-previews/components-${locale}.webp" width="1360" height="900" alt="${escape(home.componentsAlt)}" loading="lazy" /><figcaption>${escape(copy.previewNote)}</figcaption></figure>`)}
${section(
    "quick-start",
    copy.start,
    `<p class="public-discovery__copy">${escape(copy.prerequisites)}</p><pre><code>git clone --recurse-submodules https://github.com/Blueprint4Agent/B4FastAPI.git
cd B4FastAPI
make init</code></pre><h3>${escape(copy.backend)}</h3><pre><code>make backend-install
make backend-dev</code></pre><h3>${escape(copy.frontend)}</h3><pre><code>make frontend-install
make frontend-dev</code></pre><p class="public-discovery__copy">${escape(copy.open)}</p>`,
)}
${section("workflow", copy.workflow, `<p class="public-discovery__copy">${escape(copy.workflowBody)}</p>`)}
${section("configuration", copy.boundaries, `<p class="public-discovery__copy">${escape(copy.boundariesBody)}</p>`)}
${section("documentation", copy.links, `<ul class="public-discovery__links"><li>${link(docRoot + "DEPLOY.md", copy.deployment)}</li><li>${link(docRoot + (locale === "ko" ? "" : "notes/") + "account-profile.md", copy.auth)}</li><li>${link(docRoot + "contracts/README.md", copy.contracts)}</li></ul>`)}
</main><footer class="home-overview__footer"><span>Blueprint4Agent</span><p>${escape(copy.license)}</p></footer></div>`;
        const html = `<!doctype html><html lang="${locale}"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escape(copy.title)}</title><meta name="description" content="${escape(copy.description)}" /><meta name="robots" content="index, follow" /><link rel="canonical" href="${escape(url)}" />${alternates}<meta property="og:type" content="website" /><meta property="og:title" content="${escape(copy.title)}" /><meta property="og:description" content="${escape(copy.description)}" /><meta property="og:url" content="${escape(url)}" /><meta property="og:image" content="${escape(publicRoot)}/icons/b4a-banner.png" /><meta name="twitter:card" content="summary_large_image" /><link rel="icon" href="/icons/b4a-favicon.svg" />${stylesheets.map((file) => `<link rel="stylesheet" href="/${escape(file)}" />`).join("\n")}</head><body class="public-discovery"><script>const theme = matchMedia('(prefers-color-scheme: dark)'); const applyTheme = () => { document.documentElement.dataset.theme = theme.matches ? 'dark' : 'light'; }; applyTheme(); theme.addEventListener('change', applyTheme);</script>${body}</body></html>`;
        assets[pathname.slice(1) + "index.html"] = html.replace(
            /(href|src)="\/(?!\/)/g,
            `$1="${basePath}/`,
        );
        pages[url] = createHash("sha256")
            .update(body + copy.title + copy.description)
            .digest("hex");
    }
    assets["robots.txt"] =
        `User-agent: GPTBot\nDisallow: /\n\nUser-agent: ClaudeBot\nDisallow: /\n\nUser-agent: OAI-SearchBot\nUser-agent: Claude-SearchBot\nUser-agent: Claude-User\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: ${publicRoot}/sitemap.xml\n`;
    assets["sitemap.xml"] =
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(
            pages,
        )
            .map((url) => `<url><loc>${escape(url)}</loc></url>`)
            .join("")}</urlset>\n`;
    assets["discovery-manifest.json"] =
        JSON.stringify({ version: 1, origin: options.origin, pages }, null, 2) + "\n";
    if (options.key) assets[options.key + ".txt"] = options.key;
    return assets;
}

export function publicDiscoveryPlugin(project, env) {
    const options = discoveryOptions(project, env);
    if (project && !options) return null;
    return {
        name: "public-discovery",
        enforce: "post",
        configureServer(server) {
            server.middlewares.use((request, response, next) => {
                const basePath = normalizeBasePath(env.VITE_BASE_PATH);
                const publicPathname = new URL(request.url ?? "/", "http://localhost").pathname;
                if (basePath && !publicPathname.startsWith(basePath + "/")) return next();
                const pathname = publicPathname.slice(basePath.length);
                if (request.method !== "GET" && request.method !== "HEAD") return next();
                if (pathname === "/about" || pathname === "/about/ko") {
                    response.writeHead(307, { Location: basePath + pathname + "/" });
                    return response.end();
                }
                if (!Object.values(paths).includes(pathname)) return next();
                const assets = discoveryAssets(
                    { origin: "http://localhost:5173", key: "", basePath },
                    ["src/styles/app.css?direct"],
                );
                const html = assets[pathname.slice(1) + "index.html"]
                    .replace('content="index, follow"', 'content="noindex, nofollow"')
                    .replace(/<link rel="(?:canonical|alternate)"[^>]*>/g, "");
                response.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8",
                    "X-Robots-Tag": "noindex, nofollow",
                    "Cache-Control": "no-store",
                });
                response.end(request.method === "HEAD" ? undefined : html);
            });
        },
        transformIndexHtml(html) {
            if (!options) return html;
            return html.replace(
                "</head>",
                '<meta name="robots" content="noindex, follow" />\n</head>',
            );
        },
        generateBundle(_, bundle) {
            if (!options) return;
            const css = Object.values(bundle)
                .filter((file) => file.type === "asset" && file.fileName.endsWith(".css"))
                .map((file) => file.fileName);
            if (!css.length)
                throw new Error("Public discovery requires the shared application stylesheet.");
            for (const [fileName, source] of Object.entries(discoveryAssets(options, css)))
                this.emitFile({ type: "asset", fileName, source });
        },
    };
}
