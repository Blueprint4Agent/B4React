/** The hosting server supplies this before any application modules execute. */
export function getBasePath(): string {
    const runtime = document.querySelector<HTMLMetaElement>('meta[name="b4-base-path"]');
    if (runtime) return runtime.content;
    const built = import.meta.env.BASE_URL;
    return built === "./" ? "" : built.replace(/\/$/, "");
}

export function publicPath(path: string): string {
    return `${getBasePath()}/${path.replace(/^\/+/, "")}`;
}

export function storageKey(key: string): string {
    const base = getBasePath();
    return base ? `${key}:${base}` : key;
}
