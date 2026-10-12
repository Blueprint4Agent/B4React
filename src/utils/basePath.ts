/** Vite validates and embeds the mount path at build time. */
export function getBasePath(): string {
    return import.meta.env.BASE_URL.replace(/\/$/, "");
}

export function publicPath(path: string): string {
    return `${getBasePath()}/${path.replace(/^\/+/, "")}`;
}

export function storageKey(key: string): string {
    const base = getBasePath();
    return base ? `${key}:${base}` : key;
}
