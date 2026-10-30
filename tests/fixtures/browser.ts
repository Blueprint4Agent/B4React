import { test as base, expect } from "@playwright/test";

// Mocked browser suites must never reach a developer's configured backend.
export const test = base.extend<{ languagePreference: "en" | "ko" | null }>({
    languagePreference: ["en", { option: true }],
    context: async ({ context, baseURL, languagePreference }, use) => {
        if (languagePreference)
            await context.addInitScript((language) => {
                if (!localStorage.getItem("b4a_language"))
                    localStorage.setItem("b4a_language", language);
            }, languagePreference);
        await context.route("**/*", async (route) => {
            const url = new URL(route.request().url());
            if (url.origin !== new URL(baseURL!).origin) return route.abort("blockedbyclient");
            return route.continue();
        });
        // Sidebar billing is incidental in non-billing suites; page routes override this.
        await context.route("**/api/v1/billing/subscription", (route) =>
            route.fulfill({
                json: { plan: "free", status: "none", has_subscription: false },
            }),
        );
        await context.route("**/api/v1/inbox/summary", (route) =>
            route.fulfill({ json: { unread_count: 0, latest_id: 0 } }),
        );
        await context.route("**/api/v1/events/stream", (route) =>
            route.fulfill({
                contentType: "text/event-stream",
                body: 'event: ping\ndata: {"type":"ping"}\n\n',
            }),
        );
        await context.route("**/api/v1/auth/csrf", (route) =>
            route.fulfill({ json: { csrf_token: "fixture-csrf" } }),
        );
        await use(context);
    },
});
export { expect };
export type { Page, Locator } from "@playwright/test";
