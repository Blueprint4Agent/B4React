/** Canonical public mount path; reject URLs, traversal and ambiguous encodings. */
export function normalizeBasePath(value = "") {
    if (value === "" || value === "/") return "";
    if (typeof value !== "string" || !/^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\/?$/.test(value))
        throw new Error(
            "VITE_BASE_PATH must be an absolute path of letters, digits, underscores or hyphens",
        );
    return value.replace(/\/$/, "");
}
