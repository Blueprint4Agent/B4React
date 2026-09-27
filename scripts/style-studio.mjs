import fs from "node:fs";
import path from "node:path";
import { createHash, randomBytes } from "node:crypto";

const fields = JSON.parse(
    fs.readFileSync(new URL("../src/dev/styleTokens.json", import.meta.url), "utf8"),
);
const selectors = {
    light: ":root",
    dark: 'html[data-theme="dark"]',
    system: 'html:not([data-theme="light"])',
};
const revision = (css) => createHash("sha256").update(css).digest("hex");
export class StudioError extends Error {
    constructor(code, status = 400) {
        super(code);
        this.status = status;
    }
}
function block(css, selector) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = new RegExp(`(^|\\n)([ \\t]*${escaped}\\s*\\{)([^{}]*)(\\})`).exec(css);
    if (!match) throw new StudioError("unsupported_styles", 422);
    return match;
}
function tokens(css, selector, scope) {
    const body = block(css, selector)[3];
    return Object.fromEntries(
        fields
            .filter((field) => field.scope === scope)
            .map((field) => {
                const matches = [
                    ...body.matchAll(new RegExp(`(^|\\n)\\s*${field.key}:\\s*([^;]+);`, "g")),
                ];
                if (matches.length !== 1) throw new StudioError("unsupported_styles", 422);
                const value = matches[0][2].trim().replace(/\s+/g, " ");
                if (!validValue(field, value)) throw new StudioError("unsupported_styles", 422);
                return [field.key, value];
            }),
    );
}
function validValue(field, value) {
    if (typeof value !== "string") return false;
    if (field.kind === "choice") return field.options.includes(value);
    if (field.kind === "number")
        return (
            /^\d+(?:\.\d{1,3})?$/.test(value) &&
            Number(value) >= field.min &&
            Number(value) <= field.max
        );
    if (field.kind === "color") {
        if (/^#[0-9a-fA-F]{6}$/.test(value)) return true;
        const rgba =
            /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(0(?:\.\d{1,3})?|1(?:\.0{1,3})?)\)$/.exec(
                value,
            );
        return Boolean(rgba && rgba.slice(1, 4).every((channel) => Number(channel) <= 255));
    }
    return (
        /^(?:\d+(?:\.\d{1,3})?)rem$/.test(value) &&
        parseFloat(value) >= field.min &&
        parseFloat(value) <= field.max
    );
}
function checkedFile(root) {
    const base = fs.realpathSync(root);
    let current = base;
    for (const part of ["src", "styles", "app.css"]) {
        current = path.join(current, part);
        if (fs.lstatSync(current).isSymbolicLink()) throw new StudioError("unsafe_path", 403);
    }
    if (!fs.statSync(current).isFile() || fs.statSync(current).size > 2_000_000)
        throw new StudioError("unsupported_styles", 422);
    return current;
}
export function readStyles(root) {
    const file = checkedFile(root);
    const css = fs.readFileSync(file, "utf8");
    return {
        root: fs.realpathSync(root),
        file: "src/styles/app.css",
        revision: revision(css),
        values: {
            shared: tokens(css, selectors.light, "shared"),
            light: tokens(css, selectors.light, "theme"),
            dark: tokens(css, selectors.dark, "theme"),
        },
    };
}
export function applyStyles(root, input) {
    if (
        !input ||
        typeof input !== "object" ||
        Object.keys(input).some((key) => !["revision", "changes"].includes(key)) ||
        !/^[a-f0-9]{64}$/.test(input.revision) ||
        !Array.isArray(input.changes) ||
        input.changes.length > 128
    )
        throw new StudioError("invalid_input");
    const snapshot = readStyles(root);
    if (snapshot.revision !== input.revision) throw new StudioError("conflict", 409);
    const seen = new Set();
    for (const change of input.changes) {
        if (
            !change ||
            typeof change !== "object" ||
            Object.keys(change).sort().join() !== "key,scope,value"
        )
            throw new StudioError("invalid_input");
        const field = fields.find((item) => item.key === change.key);
        if (
            !field ||
            !(field.scope === "shared"
                ? change.scope === "shared"
                : ["light", "dark"].includes(change.scope)) ||
            !validValue(field, change.value)
        )
            throw new StudioError("invalid_input");
        const id = `${change.scope}:${change.key}`;
        if (seen.has(id)) throw new StudioError("invalid_input");
        seen.add(id);
    }
    const file = checkedFile(root);
    const original = fs.readFileSync(file, "utf8");
    let next = original;
    for (const change of input.changes) {
        for (const selector of change.scope === "dark"
            ? [selectors.dark, selectors.system]
            : [selectors.light]) {
            const match = block(next, selector);
            const re = new RegExp(`(^|\\n)([ \\t]*${change.key}:\\s*)([^;]+)(;)`, "g");
            if ([...match[3].matchAll(re)].length !== 1)
                throw new StudioError("unsupported_styles", 422);
            const body = match[3].replace(
                re,
                (_all, prefix, key, _value, end) => `${prefix}${key}${change.value}${end}`,
            );
            next =
                next.slice(0, match.index) +
                match[1] +
                match[2] +
                body +
                match[4] +
                next.slice(match.index + match[0].length);
        }
    }
    if (next === original) return { ...snapshot, backup: null };
    // Serialize synchronous local writes, and reject external edits observed since the read.
    if (revision(fs.readFileSync(checkedFile(root), "utf8")) !== input.revision)
        throw new StudioError("conflict", 409);
    const backupDir = path.join(snapshot.root, ".style-studio-backups");
    if (
        fs.existsSync(backupDir) &&
        (fs.lstatSync(backupDir).isSymbolicLink() || !fs.statSync(backupDir).isDirectory())
    )
        throw new StudioError("unsafe_path", 403);
    fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
    const suffix = `${Date.now()}-${randomBytes(6).toString("hex")}`;
    const backup = path.join(backupDir, `${suffix}.css`);
    fs.writeFileSync(backup, original, { flag: "wx", mode: 0o600 });
    const temporary = path.join(path.dirname(file), `.style-studio-${suffix}.tmp`);
    try {
        fs.writeFileSync(temporary, next, { flag: "wx", mode: fs.statSync(file).mode & 0o777 });
        fs.renameSync(temporary, file);
    } finally {
        if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
    return { ...readStyles(root), backup: path.relative(snapshot.root, backup) };
}
export function createStudioMiddleware(root, capability) {
    return async (req, res, next) => {
        if (!req.url?.startsWith("/__b4f/style-studio/")) return next();
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Content-Type", "application/json");
        try {
            const host = req.headers.host ?? "";
            const url = new URL(`http://${host}`);
            if (
                !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
                !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.socket.remoteAddress) ||
                req.headers.origin !== `http://${host}` ||
                req.headers["x-style-studio-token"] !== capability ||
                req.headers["sec-fetch-site"] === "cross-site"
            )
                throw new StudioError("forbidden", 403);
            if (req.method !== "POST") throw new StudioError("method_not_allowed", 405);
            if (!req.headers["content-type"]?.startsWith("application/json"))
                throw new StudioError("invalid_input");
            let body = "";
            for await (const chunk of req) {
                body += chunk.toString();
                if (body.length > 16_384) throw new StudioError("invalid_input", 413);
            }
            const input = JSON.parse(body);
            const result =
                req.url === "/__b4f/style-studio/read"
                    ? readStyles(root)
                    : req.url === "/__b4f/style-studio/apply"
                      ? applyStyles(root, input)
                      : null;
            if (!result) throw new StudioError("not_found", 404);
            res.end(JSON.stringify(result));
        } catch (error) {
            res.statusCode =
                error instanceof StudioError
                    ? error.status
                    : error instanceof SyntaxError
                      ? 400
                      : 500;
            res.end(
                JSON.stringify({
                    error:
                        error instanceof StudioError
                            ? error.message
                            : error instanceof SyntaxError
                              ? "invalid_input"
                              : "io_error",
                }),
            );
        }
    };
}
export function styleStudioPlugin(enabled) {
    const capability = enabled ? randomBytes(32).toString("hex") : "";
    return {
        name: "local-style-studio",
        config(_config, env) {
            const active = enabled && env.command === "serve" && !env.isPreview;
            return {
                define: {
                    __STYLE_STUDIO__: JSON.stringify(active),
                    __STYLE_STUDIO_TOKEN__: JSON.stringify(active ? capability : ""),
                },
                ...(active ? { server: { host: "127.0.0.1", cors: false } } : {}),
            };
        },
        configureServer(server) {
            if (!enabled) return;
            if (!["localhost", "127.0.0.1", "::1"].includes(server.config.server.host))
                throw new Error("Style studio requires a loopback host");
            server.middlewares.use(createStudioMiddleware(server.config.root, capability));
        },
    };
}
