import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    beginOAuthAccountIntent,
    clearRecentAccounts,
    completeOAuthAccountIntent,
    readRecentAccounts,
    RECENT_ACCOUNTS_KEY,
    rememberAccount,
    updateRememberedProfile,
    removeRecentAccount,
} from "../../../utils/recentAccounts";
import { getAccessToken, setAccessToken } from "../../../store/session";

describe("recent account history", () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        history.replaceState(null, "", "/dashboard");
    });
    it("deduplicates accounts, keeps five most recent and excludes secrets", () => {
        // Given/When: six successful remembered identities then an updated account.
        for (let index = 0; index < 6; index++)
            rememberAccount({ email: `user${index}@example.com`, name: "User", provider: "email" });
        rememberAccount({ email: "USER5@example.com", name: "Updated", provider: "email" });
        // Then: records are bounded and contain only display metadata.
        const records = readRecentAccounts();
        expect(records).toHaveLength(5);
        expect(records[0].name).toBe("Updated");
        expect(Object.keys(records[0]).sort()).toEqual(["email", "lastUsed", "name", "provider"]);
    });
    it("keeps one identity across Google, GitHub and email using the latest login method", () => {
        // Given/When: the same account signs in through different linked providers.
        rememberAccount({ email: "same@example.com", name: "Google", provider: "google" });
        rememberAccount({ email: "SAME@example.com", name: "GitHub", provider: "github" });
        // Then: a single record retains the latest successful login method.
        expect(readRecentAccounts()).toHaveLength(1);
        expect(readRecentAccounts()[0]).toMatchObject({ name: "GitHub", provider: "github" });
        rememberAccount({ email: "same@example.com", name: "Email", provider: "email" });
        expect(readRecentAccounts()).toHaveLength(1);
        expect(readRecentAccounts()[0].provider).toBe("email");
        removeRecentAccount({ email: "same@example.com", provider: "google" });
        expect(readRecentAccounts()).toEqual([]);
    });
    it("migrates provider-specific history to one row per email, preserving distinct accounts", () => {
        // Given: browser history saved before email-based deduplication.
        const now = Date.now();
        localStorage.setItem(
            RECENT_ACCOUNTS_KEY,
            JSON.stringify([
                { email: "same@example.com", name: "Old", provider: "google", lastUsed: now - 100 },
                { email: "SAME@example.com", name: "New", provider: "github", lastUsed: now },
                {
                    email: "other@example.com",
                    name: "Other",
                    provider: "google",
                    lastUsed: now - 50,
                },
            ]),
        );
        // When/Then: reading normalizes storage and keeps the latest method for each account.
        const records = readRecentAccounts();
        expect(records).toHaveLength(2);
        expect(records[0]).toMatchObject({ name: "New", provider: "github" });
        expect(JSON.parse(localStorage.getItem(RECENT_ACCOUNTS_KEY)!)).toEqual(records);
    });
    it("rejects corrupt/expired metadata and removes expired data from storage", () => {
        localStorage.setItem(RECENT_ACCOUNTS_KEY, "not-json");
        expect(readRecentAccounts()).toEqual([]);
        localStorage.setItem(
            RECENT_ACCOUNTS_KEY,
            JSON.stringify([
                {
                    email: "old@example.com",
                    name: "Old",
                    provider: "email",
                    lastUsed: Date.now() - 91 * 86400000,
                },
                { email: "bad", provider: "unknown" },
            ]),
        );
        expect(readRecentAccounts()).toEqual([]);
        expect(localStorage.getItem(RECENT_ACCOUNTS_KEY)).toBeNull();
    });
    it("removes individual entries and legacy remembered email, then clears all", () => {
        rememberAccount({ email: "one@example.com", name: "One", provider: "email" });
        rememberAccount({ email: "two@example.com", name: "Two", provider: "github" });
        localStorage.setItem("template_remember_email", "one@example.com");
        removeRecentAccount({ email: "one@example.com", provider: "email" });
        expect(readRecentAccounts()).toHaveLength(1);
        expect(localStorage.getItem("template_remember_email")).toBeNull();
        clearRecentAccounts();
        expect(readRecentAccounts()).toEqual([]);
    });
    it("records an opted-in authenticated OAuth return and clears stale access tokens", () => {
        setAccessToken("old-account-token");
        beginOAuthAccountIntent("google", true);
        expect(getAccessToken()).toBeNull();
        expect(readRecentAccounts()).toEqual([]);
        completeOAuthAccountIntent({
            email: "oauth@example.com",
            name: "OAuth",
            oauth_providers: ["google"],
        });
        expect(readRecentAccounts()[0]).toMatchObject({
            email: "oauth@example.com",
            provider: "google",
        });
        expect(localStorage.getItem(RECENT_ACCOUNTS_KEY)).not.toContain("token");
        expect(sessionStorage.getItem("blueprint_oauth_account_intent")).toBeNull();
    });
    it("does not remember declined, canceled or unrelated OAuth identities", () => {
        beginOAuthAccountIntent("google", false);
        completeOAuthAccountIntent({ email: "oauth@example.com", oauth_providers: ["google"] });
        beginOAuthAccountIntent("google", true);
        history.replaceState(null, "", "/login?error=access_denied");
        completeOAuthAccountIntent({ email: "oauth@example.com", oauth_providers: ["google"] });
        history.replaceState(null, "", "/dashboard");
        beginOAuthAccountIntent("github", true);
        completeOAuthAccountIntent({ email: "oauth@example.com", oauth_providers: ["google"] });
        expect(readRecentAccounts()).toEqual([]);
    });
    it("updates saved profile images without resurrecting removed accounts", async () => {
        rememberAccount({ email: "photo@example.com", name: "Before", provider: "email" });
        await updateRememberedProfile({
            email: "photo@example.com",
            name: "After",
            profile_image_url: "https://example.com/avatar.png",
        });
        expect(readRecentAccounts()[0]).toMatchObject({
            name: "After",
            imageUrl: "https://example.com/avatar.png",
        });
        clearRecentAccounts();
        await updateRememberedProfile({
            email: "photo@example.com",
            name: "After",
            profile_image_url: "https://example.com/avatar.png",
        });
        expect(readRecentAccounts()).toEqual([]);
    });
    it("does not break authentication when browser storage is blocked", () => {
        const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new Error("blocked");
        });
        expect(() =>
            rememberAccount({ email: "test@example.com", name: "Test", provider: "email" }),
        ).not.toThrow();
        spy.mockRestore();
    });
});
