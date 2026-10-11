/** Public support links are opt-in and never rendered in production mode. */
export function getCoffeeSupportUrl(
    mode: string | undefined,
    enabled: string | undefined,
    configuredUrl: string | undefined,
): string | null {
    if (mode !== "development" || enabled !== "true" || !configuredUrl?.trim()) return null;
    try {
        const url = new URL(configuredUrl.trim());
        if (
            url.protocol !== "https:" ||
            !["buymeacoffee.com", "www.buymeacoffee.com"].includes(url.hostname) ||
            url.username ||
            url.password ||
            url.port ||
            url.search ||
            url.hash ||
            !/^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)
        )
            return null;
        return url.href;
    } catch {
        return null;
    }
}
