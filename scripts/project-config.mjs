import { normalizeBasePath } from "./base-path.mjs";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const PROJECT_CONFIG_FILE = "project.local.json";
const fields = new Set([
    "version",
    "name",
    "short_name",
    "identifier",
    "logo_url",
    "logo_dark_url",
]);
export function validateProjectConfig(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
        throw new Error("Project config must be an object");
    if (Object.keys(value).some((key) => !fields.has(key)))
        throw new Error("Project config contains unsupported fields (public identity only)");
    if (value.version !== 1) throw new Error("Project config version must be 1");
    for (const [key, limit] of [
        ["name", 60],
        ["short_name", 16],
    ]) {
        if (
            typeof value[key] !== "string" ||
            !value[key].trim() ||
            value[key] !== value[key].trim() ||
            value[key].length > limit ||
            !/^[\p{L}\p{N} _().&-]+$/u.test(value[key])
        )
            throw new Error(`Invalid project ${key}`);
    }
    if (
        typeof value.identifier !== "string" ||
        value.identifier.length > 150 ||
        !/^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*){2,}$/.test(value.identifier)
    )
        throw new Error("Project identifier must be a lowercase reverse-DNS identifier");
    for (const key of ["logo_url", "logo_dark_url"]) {
        if (value[key] === undefined) continue;
        if (
            typeof value[key] !== "string" ||
            !/^\/(?!\/)[a-zA-Z0-9_./-]+\.(svg|png|webp|jpg|jpeg)$/.test(value[key]) ||
            value[key].split("/").includes("..")
        )
            throw new Error(`Invalid project ${key}: use a local public image path`);
    }
    return { ...value };
}

export function readProjectConfig(root = process.cwd()) {
    const file = path.join(root, PROJECT_CONFIG_FILE);
    if (!existsSync(file)) return null;
    return validateProjectConfig(JSON.parse(readFileSync(file, "utf8")));
}

const escapeHtml = (value) =>
    value
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
export function brandHtml(html, config) {
    if (!config) return html;
    let result = html.replace(
        /<title>[^<]*<\/title>/,
        () => `<title>${escapeHtml(config.name)}</title>`,
    );
    if (config.logo_url)
        result = result.replace(
            /<link rel="icon"[^>]*\/>/,
            () => `<link rel="icon" href="${escapeHtml(config.logo_url)}" />`,
        );
    return result;
}

export function desktopProjectConfig(base, config) {
    if (!config) return null;
    return {
        productName: config.name,
        identifier: config.identifier,
        app: { windows: base.app.windows.map((window) => ({ ...window, title: config.name })) },
    };
}

export function withProjectTauriArgs(args, base, config) {
    const supported = new Set(["dev", "build", "bundle"]);
    const command = args[0] === "android" || args[0] === "ios" ? args[1] : args[0];
    const override = desktopProjectConfig(base, config);
    if (!override || !supported.has(command)) return args;
    // Explicit CLI overrides come last; keep forwarded Rust arguments after --.
    const separator = args.indexOf("--");
    const prefix = separator < 0 ? args : args.slice(0, separator);
    const suffix = separator < 0 ? [] : args.slice(separator);
    const commandLength = ["android", "ios"].includes(args[0]) ? 2 : 1;
    return [
        ...prefix.slice(0, commandLength),
        "--config",
        JSON.stringify(override),
        ...prefix.slice(commandLength),
        ...suffix,
    ];
}

export function sharingHtml(config, env = {}) {
    const title = config?.name ?? "Blueprint4FastAPI";
    const description =
        env.VITE_SITE_DESCRIPTION?.trim() ||
        (config
            ? `Explore ${title}.`
            : "A FastAPI and React blueprint with authentication, account settings and agent development workflows.");
    const tags = [
        ["name", "description", description],
        ["property", "og:type", "website"],
        ["property", "og:title", title],
        ["property", "og:description", description],
        ["name", "twitter:title", title],
        ["name", "twitter:description", description],
    ];
    const publicUrl = env.VITE_PUBLIC_SITE_URL?.trim();
    let image;
    if (publicUrl) {
        const url = new URL(publicUrl);
        if (
            !["http:", "https:"].includes(url.protocol) ||
            url.username ||
            url.password ||
            url.pathname !== "/" ||
            url.search ||
            url.hash
        )
            throw new Error(
                "VITE_PUBLIC_SITE_URL must be an HTTP(S) origin without credentials, path, query or fragment",
            );
        const base = normalizeBasePath(env.VITE_BASE_PATH);
        tags.push(["property", "og:url", url.origin + base + "/"]);
        const asset = config ? config.logo_url : "/icons/b4a-banner.png";
        if (asset && /\.(png|webp|jpg|jpeg)$/.test(asset)) {
            image = new URL(base + asset, url.origin).href;
            tags.push(
                ["property", "og:image", image],
                ["property", "og:image:alt", title],
                ["name", "twitter:image", image],
                ["name", "twitter:image:alt", title],
            );
        }
    }
    tags.push(["name", "twitter:card", image ? "summary_large_image" : "summary"]);
    return tags
        .map(
            ([attribute, key, value]) =>
                `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`,
        )
        .join("\n");
}
