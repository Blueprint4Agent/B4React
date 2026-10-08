import { clearAccessToken } from "../store/session";
export type AccountProvider = "email" | "google" | "github";
export type RecentAccount = {
    email: string;
    name: string;
    provider: AccountProvider;
    lastUsed: number;
    imageUrl?: string;
};
export const RECENT_ACCOUNTS_KEY = "blueprint_recent_accounts_v1";
const INTENT_KEY = "blueprint_oauth_account_intent";
const MAX_AGE = 90 * 24 * 60 * 60 * 1000;
export const RECENT_ACCOUNTS_EVENT = "blueprint-recent-accounts";
const isProvider = (value: unknown): value is AccountProvider =>
    value === "email" || value === "google" || value === "github";
export function accountId(account: Pick<RecentAccount, "email" | "provider">): string {
    return account.email.trim().toLowerCase();
}
export function readRecentAccounts(): RecentAccount[] {
    try {
        const value: unknown = JSON.parse(localStorage.getItem(RECENT_ACCOUNTS_KEY) ?? "[]");
        if (!Array.isArray(value)) return [];
        const now = Date.now();
        const seen = new Set<string>();
        const accounts = value
            .filter(
                (item): item is RecentAccount =>
                    Boolean(item) &&
                    typeof item === "object" &&
                    typeof item.email === "string" &&
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email) &&
                    item.email.length <= 254 &&
                    typeof item.name === "string" &&
                    item.name.length <= 100 &&
                    isProvider(item.provider) &&
                    typeof item.lastUsed === "number" &&
                    Number.isFinite(item.lastUsed) &&
                    item.lastUsed <= now &&
                    now - item.lastUsed < MAX_AGE,
            )
            .sort((a, b) => b.lastUsed - a.lastUsed)
            .filter((item) => {
                const id = accountId(item);
                if (seen.has(id)) return false;
                seen.add(id);
                return true;
            })
            .slice(0, 5)
            .map(({ email, name, provider, lastUsed, imageUrl }) => ({
                email,
                name,
                provider,
                lastUsed,
                ...(safeAvatar(imageUrl) ? { imageUrl: safeAvatar(imageUrl)! } : {}),
            }));
        const normalized = JSON.stringify(accounts);
        if (normalized !== JSON.stringify(value)) {
            if (accounts.length) localStorage.setItem(RECENT_ACCOUNTS_KEY, normalized);
            else localStorage.removeItem(RECENT_ACCOUNTS_KEY);
        }
        return accounts;
    } catch {
        return [];
    }
}
function writeAccounts(accounts: RecentAccount[]): void {
    try {
        if (accounts.length) localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(accounts));
        else localStorage.removeItem(RECENT_ACCOUNTS_KEY);
    } catch {
        /* Authentication must work with storage disabled. */
    }
    window.dispatchEvent(new Event(RECENT_ACCOUNTS_EVENT));
}
export function rememberAccount(account: Pick<RecentAccount, "email" | "name" | "provider">): void {
    const record = {
        email: account.email.trim().slice(0, 254),
        name: account.name.trim().slice(0, 100),
        provider: account.provider,
        lastUsed: Date.now(),
    };
    writeAccounts(
        [
            record,
            ...readRecentAccounts().filter((item) => accountId(item) !== accountId(record)),
        ].slice(0, 5),
    );
}
export function removeRecentAccount(account: Pick<RecentAccount, "email" | "provider">): void {
    writeAccounts(readRecentAccounts().filter((item) => accountId(item) !== accountId(account)));
    try {
        if (
            localStorage.getItem("template_remember_email")?.toLowerCase() ===
            account.email.toLowerCase()
        )
            localStorage.removeItem("template_remember_email");
    } catch {
        /* Storage is optional. */
    }
}
export function clearRecentAccounts(): void {
    writeAccounts([]);
    try {
        localStorage.removeItem("template_remember_email");
    } catch {
        /* Storage is optional. */
    }
}
export function beginOAuthAccountIntent(provider: "google" | "github", remember: boolean): void {
    clearAccessToken();
    try {
        sessionStorage.setItem(
            INTENT_KEY,
            JSON.stringify({ provider, remember, started: Date.now() }),
        );
    } catch {
        /* OAuth still works without history. */
    }
}
export function completeOAuthAccountIntent(user: {
    email: string;
    name?: string | null;
    oauth_providers?: string[];
}): void {
    try {
        const value = JSON.parse(sessionStorage.getItem(INTENT_KEY) ?? "null");
        sessionStorage.removeItem(INTENT_KEY);
        if (
            new URLSearchParams(window.location.search).has("error") ||
            ["/login", "/signup"].includes(window.location.pathname)
        )
            return;
        if (
            !value ||
            !user.oauth_providers?.includes(value.provider) ||
            !["google", "github"].includes(value.provider) ||
            typeof value.remember !== "boolean" ||
            typeof value.started !== "number" ||
            value.started > Date.now() ||
            Date.now() - value.started > 10 * 60 * 1000
        )
            return;
        if (value.remember) {
            rememberAccount({ email: user.email, name: user.name ?? "", provider: value.provider });
            localStorage.setItem("template_remember_email_enabled", "true");
            localStorage.setItem("template_remember_email", user.email);
        } else {
            removeRecentAccount({ email: user.email, provider: value.provider });
            localStorage.setItem("template_remember_email_enabled", "false");
            localStorage.removeItem("template_remember_email");
        }
    } catch {
        /* Invalid or unavailable storage never blocks a restored session. */
    }
}

function safeAvatar(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    if (value.startsWith("/api/v1/auth/me/photo")) return undefined;
    if (
        /^data:image\/(png|jpeg|webp|gif);base64,[a-zA-Z0-9+/=]+$/.test(value) &&
        value.length <= 100000
    )
        return value;
    if (value.length <= 4096 && (/^https?:\/\//.test(value) || /^\/(?!\/)/.test(value)))
        return value;
    return undefined;
}
const profileRevisions = new Map<string, number>();
async function accountThumbnail(value: string | null | undefined): Promise<string | undefined> {
    const safe = safeAvatar(value);
    if (safe || (!value?.startsWith("data:image/") && !value?.startsWith("blob:"))) return safe;
    return new Promise((resolve) => {
        const image = new Image();
        const timer = window.setTimeout(() => resolve(undefined), 3000);
        image.onload = () => {
            clearTimeout(timer);
            try {
                const canvas = document.createElement("canvas");
                canvas.width = 64;
                canvas.height = 64;
                const context = canvas.getContext("2d");
                if (!context) {
                    resolve(undefined);
                    return;
                }
                const side = Math.min(image.naturalWidth, image.naturalHeight);
                context.drawImage(
                    image,
                    (image.naturalWidth - side) / 2,
                    (image.naturalHeight - side) / 2,
                    side,
                    side,
                    0,
                    0,
                    64,
                    64,
                );
                resolve(safeAvatar(canvas.toDataURL("image/webp", 0.8)));
            } catch {
                resolve(undefined);
            }
        };
        image.onerror = () => {
            clearTimeout(timer);
            resolve(undefined);
        };
        image.src = value;
    });
}
export async function updateRememberedProfile(user: {
    email: string;
    name?: string | null;
    profile_image_url?: string | null;
}): Promise<void> {
    const email = user.email.toLowerCase();
    if (!readRecentAccounts().some((item) => item.email.toLowerCase() === email)) return;
    const revision = (profileRevisions.get(email) ?? 0) + 1;
    profileRevisions.set(email, revision);
    const imageUrl = await accountThumbnail(user.profile_image_url);
    if (profileRevisions.get(email) !== revision) return;
    const records = readRecentAccounts();
    const next = records.map((item) =>
        item.email.toLowerCase() === email
            ? { ...item, name: (user.name ?? "").slice(0, 100), imageUrl }
            : item,
    );
    if (JSON.stringify(records) !== JSON.stringify(next)) writeAccounts(next);
}
