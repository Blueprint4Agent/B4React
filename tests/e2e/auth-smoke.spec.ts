import { expect, test } from "@playwright/test";

const guestConfig = {
    api_base_path: "/api/v1",
    app_mode: "development",
    login_enabled: true,
    frontend_base_path: "",
    email_enabled: true,
    oauth_enabled: true,
    oauth_providers: ["google", "github"],
    bootstrap_user: null,
    bootstrap_access_token: null,
};
test.beforeEach(async ({ page }) => {
    // Given: an anonymous session with only configured Google/GitHub providers.
    await page.route("**/config", (route) => route.fulfill({ json: guestConfig }));
    await page.route("**/api/v1/auth/refresh", (route) =>
        route.fulfill({ status: 401, json: { detail: { error: "INVALID_TOKEN" } } }),
    );
    await page.route("**/api/v1/auth/oauth/providers", (route) =>
        route.fulfill({
            json: {
                providers: [
                    { provider: "google", start_path: "/api/v1/auth/oauth/google/start" },
                    { provider: "github", start_path: "/api/v1/auth/oauth/github/start" },
                ],
            },
        }),
    );
});
for (const width of [390, 1440]) {
    test(`guest showcase opens compact login and signup at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 850 });
        // When: entering the app without authentication.
        await page.goto("/");
        await expect(page).toHaveURL(/\/show-case$/);
        await expect(page.locator(".showcase-catalog")).toBeVisible();
        await page.locator(".profile-menu__trigger").click();
        await expect(page.locator(".profile-menu__guest-cta")).toBeVisible();
        await expect(page.locator(".profile-menu__dropdown")).not.toContainText(
            /Help|Pricing|Sign out/,
        );
        await page.getByRole("link", { name: "Log in", exact: true }).click();
        const dialog = page.getByRole("dialog", { name: "Log in or sign up" });
        await expect(dialog).toBeVisible();
        await expect(dialog.locator(".ui-modal__backdrop")).toHaveCSS(
            "background-color",
            "rgba(0, 0, 0, 0)",
        );
        await expect(dialog.locator(".ui-modal__backdrop")).toHaveCSS(
            "backdrop-filter",
            "blur(6px)",
        );
        await expect(dialog.getByRole("button", { name: "Continue with Google" })).toBeVisible();
        await expect(dialog.getByRole("button", { name: "Continue with GitHub" })).toBeVisible();
        await expect(dialog).not.toContainText(/Apple|phone/i);
        await expect(dialog.getByLabel("Password", { exact: true })).toHaveCount(0);
        await dialog.getByRole("button", { name: "Continue", exact: true }).click();
        await expect(dialog).toContainText("Email is required");
        await dialog.getByLabel("Email", { exact: true }).fill("guest@example.com");
        await dialog.getByRole("button", { name: "Continue", exact: true }).click();
        await expect(dialog.getByLabel("Password", { exact: true })).toBeFocused();
        const bounds = (await page.locator(".auth-dialog .ui-modal__panel").boundingBox())!;
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
        // Then: signup remains a dialog and Escape returns to the public showcase.
        await dialog.getByRole("link", { name: "Create an account" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByRole("dialog").getByLabel("Name", { exact: true })).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page).toHaveURL(/\/show-case$/);
        await expect(page.locator(".auth-dialog")).toHaveCount(0);
        await expect(page.locator(".profile-menu__trigger")).toBeFocused();
    });
}
test("dialog keyboard focus stays contained", async ({ page }) => {
    // Given: a guest opens login.
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login$/);
    const dialog = page.getByRole("dialog", { name: "Log in or sign up" });
    await expect(dialog).toBeVisible();
    // When: tabbing backwards from the initial panel focus.
    await page.keyboard.press("Shift+Tab");
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Tab");
    await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeFocused();
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(page).toHaveURL(/\/show-case$/);
});
test("disabled OAuth leaves only the existing email flow", async ({ page }) => {
    await page.route("**/config", (route) =>
        route.fulfill({ json: { ...guestConfig, oauth_enabled: false, oauth_providers: [] } }),
    );
    await page.goto("/login");
    const dialog = page.getByRole("dialog", { name: "Log in or sign up" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: /Continue with/ })).toHaveCount(0);
    await expect(dialog.getByLabel("Email", { exact: true })).toBeVisible();
});

test("password recovery stays in the auth dialog through validation and sent state", async ({
    page,
}) => {
    // Given: the real page flow with a mocked existing recovery endpoint.
    await page.route("**/api/v1/auth/forgot-password", (route) =>
        route.fulfill({ json: { message: "Request accepted" } }),
    );
    await page.goto("/forgot-password");
    let dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: /Send/i }).click();
    await expect(dialog).toContainText("Email is required.");
    await dialog.getByLabel("Email", { exact: true }).fill("guest@example.com");
    await dialog.getByRole("button", { name: /Send/i }).click();
    // Then: completion is contained in the same modal style with compact info feedback.
    await expect(page).toHaveURL(/\/forgot-password\/email-sent$/);
    dialog = page.getByRole("dialog");
    await expect(dialog.locator(".status-card--info")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/show-case$/);
});

test("signup rules and recovery errors use the compact shared feedback", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 850 });
    await page.goto("/signup");
    const panel = page.locator(".auth-dialog .ui-modal__panel");
    await expect(panel).toBeVisible();
    await expect(panel.locator(".validation-card").first()).toHaveCSS("border-top-width", "0px");
    await page.getByRole("dialog").getByLabel("Password", { exact: true }).fill("ValidPass123!");
    await expect(panel.locator(".validation-card--ok")).not.toHaveCount(0);
    // When: a recovery link lacks its required token.
    await page.goto("/reset-password");
    await page.getByRole("dialog").getByRole("button", { name: /Reset/i }).click();
    await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();
    await expect(page.getByRole("dialog").locator(".status-card__icon")).toBeVisible();
});

test("showcase exposes the shared pill buttons and auth frame", async ({ page }) => {
    await page.goto("/show-case");
    await expect(page.locator(".profile-menu__trigger")).toHaveAttribute(
        "aria-label",
        "Log in / Sign up",
    );
    await page.getByRole("button", { name: "Preview authentication dialog" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("alert")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Continue", exact: true })).toHaveClass(
        /ui-button--pill/,
    );
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("remembered accounts can be selected and removed without authenticating", async ({ page }) => {
    await page.addInitScript(() =>
        localStorage.setItem(
            "blueprint_recent_accounts_v1",
            JSON.stringify([
                {
                    email: "saved@example.com",
                    name: "Saved user",
                    provider: "email",
                    lastUsed: Date.now(),
                },
            ]),
        ),
    );
    await page.goto("/login");
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Continue as saved@example.com with Email" }).click();
    const historyBounds = (await dialog.locator(".recent-accounts").boundingBox())!;
    const rememberBounds = (await dialog
        .getByText("Remember accounts on this browser", { exact: true })
        .boundingBox())!;
    expect(historyBounds.y + historyBounds.height).toBeLessThanOrEqual(rememberBounds.y);
    await expect(dialog.getByLabel("Email", { exact: true })).toHaveValue("saved@example.com");
    await expect(dialog.getByLabel("Password", { exact: true })).toBeVisible();
    await dialog
        .getByRole("button", { name: "Remove saved@example.com (Email) from this browser" })
        .click();
    await expect(dialog.getByRole("region", { name: "Recent accounts" })).toHaveCount(0);
    expect(
        await page.evaluate(() => localStorage.getItem("blueprint_recent_accounts_v1")),
    ).toBeNull();
});

test("signed-in users add another account and retain the current session until success", async ({
    page,
}) => {
    const user = {
        id: 1,
        name: "First account",
        email: "first@example.com",
        role: "user",
        is_verified: true,
        oauth_providers: [],
        profile_image_url: null,
        created_at: "2026-01-01T00:00:00Z",
    };
    await page.route("**/api/v1/auth/login", (route) =>
        route.fulfill({
            json: {
                access_token: "fixture-token",
                refresh_token: "fixture-refresh",
                token_type: "bearer",
                user,
            },
        }),
    );
    await page.goto("/login");
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("Email", { exact: true }).fill(user.email);
    await dialog.getByText("Remember accounts on this browser", { exact: true }).click();
    await dialog.getByRole("button", { name: "Continue", exact: true }).click();
    await dialog.getByLabel("Password", { exact: true }).fill("ValidPass123!");
    await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/show-case$/);
    await page.locator(".profile-menu__trigger").click();
    await page.getByRole("button", { name: "Switch account" }).click();
    await expect(page.locator(".profile-menu__account-current")).toContainText(user.email);
    expect(
        await page
            .locator(".profile-menu__accounts")
            .evaluate((element) => element.parentElement === document.body),
    ).toBe(true);
    const parentBounds = (await page.locator(".profile-menu__dropdown").boundingBox())!;
    const accountsBounds = (await page.locator(".profile-menu__accounts").boundingBox())!;
    expect(accountsBounds.x).toBeGreaterThanOrEqual(parentBounds.x + parentBounds.width + 7);
    await expect(page.locator(".profile-menu__account-current .user-avatar")).toHaveCSS(
        "border-radius",
        "50%",
    );

    await page.getByRole("link", { name: "Add account", exact: true }).click();
    await expect(page).toHaveURL(/\/login\?switch=1$/);
    dialog = page.getByRole("dialog", { name: "Log in or sign up" });
    await expect(dialog).toBeVisible();
    // Existing account remains authenticated if the new login is canceled.
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(page.locator(".profile-menu__trigger")).toHaveAttribute("title", "First account");
    const records = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("blueprint_recent_accounts_v1") ?? "[]"),
    );
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ email: user.email, provider: "email" });
    expect(JSON.stringify(records)).not.toContain("fixture-token");
});

for (const section of ["general", "appearance", "profile", "account", "developers"]) {
    test(`guest settings restrict ${section} to local preferences`, async ({ page }) => {
        const accountRequests: string[] = [];
        page.on("request", (request) => {
            if (/api-keys|auth\/me/.test(request.url())) accountRequests.push(request.url());
        });
        await page.goto(`/settings?section=${section}`);
        const allowed = section === "appearance" ? "appearance" : "general";
        await expect(page).toHaveURL(new RegExp(`section=${allowed}$`));
        const nav = page.locator("#app-sidebar-navigation");
        await expect(nav.getByRole("link", { name: "General", exact: true })).toBeVisible();
        await expect(nav.getByRole("link", { name: "Appearance", exact: true })).toBeVisible();
        await expect(nav.getByRole("link", { name: "Account", exact: true })).toHaveCount(0);
        await expect(nav.getByRole("link", { name: "Developers", exact: true })).toHaveCount(0);
        await expect(
            page.getByRole("heading", {
                name: allowed === "appearance" ? "Appearance" : "General",
                exact: true,
            }),
        ).toBeVisible();
        expect(accountRequests).toEqual([]);
    });
}

for (const width of [320, 1440]) {
    test(`catalog filters shared previews without account requests at ${width}px`, async ({
        page,
    }) => {
        // Given: a public catalog whose previews must not mutate backend data.
        await page.setViewportSize({ width, height: 900 });
        const mutations: string[] = [];
        page.on("request", (request) => {
            if (request.method() !== "GET" && /api-keys/.test(request.url()))
                mutations.push(request.url());
        });
        await page.goto("/show-case");
        const search = page.getByRole("searchbox", { name: "Find a component" });
        // When: finding a previously missing shared component by name.
        await search.fill("CopyField");
        await expect(page.locator("[data-component]")).toHaveCount(1);
        await expect(page.locator('[data-component="CopyField"]')).toBeVisible();
        await search.fill("does-not-exist");
        await expect(page.getByText("No matching components.")).toBeVisible();
        await page.getByRole("button", { name: "Reset filters" }).click();
        await page
            .getByRole("navigation", { name: "Component categories" })
            .getByRole("button", { name: "API keys", exact: true })
            .click();
        const preview = page.locator('[data-component="DeveloperApiKeysSection"]');
        await expect(preview).toBeVisible();
        await preview.getByRole("switch").first().click();
        await expect(preview.getByText("Inactive", { exact: true })).toBeVisible();
        // Then: local changes remain local, with no horizontal page overflow.
        expect(mutations).toEqual([]);
        expect(
            await page.locator(".app-main").evaluate((node) => node.scrollWidth - node.clientWidth),
        ).toBeLessThanOrEqual(1);
        await search.fill("");
        await page
            .getByRole("navigation", { name: "Component categories" })
            .getByRole("button", { name: "Buttons", exact: true })
            .click();
        await page.getByRole("button", { name: "Continue with Google", exact: true }).click();
        await expect(page.getByRole("dialog", { name: "Log in or sign up" })).toBeVisible();
        await expect(page).toHaveURL(/\/show-case$/);
    });
}

for (const width of [320, 1440]) {
    test(`loading and 404 states are compact and navigable at ${width}px`, async ({ page }) => {
        // Given: standalone page previews inside the shared shell.
        await page.setViewportSize({ width, height: 800 });
        await page.goto("/show-case/loading");
        await expect(page.locator(".page-state").getByRole("status")).toContainText(
            "Loading session",
        );
        await page.getByRole("button", { name: "Back to components" }).click();
        await expect(page).toHaveURL(/\/show-case$/);
        // When: opening both the explicit preview and an unknown route.
        for (const path of ["/show-case/404", "/missing-example"]) {
            await page.goto(path);
            await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
            const panel = (await page.locator(".page-state__panel").boundingBox())!;
            expect(panel.x).toBeGreaterThanOrEqual(0);
            expect(panel.x + panel.width).toBeLessThanOrEqual(width);
            // Then: the primary recovery action returns to the public catalog.
            await page.getByRole("button", { name: "Back to components" }).click();
            await expect(page).toHaveURL(/\/show-case$/);
        }
    });
}

for (const width of [390, 1440]) {
    test(`disabled login hides account switching for the bootstrap identity at ${width}px`, async ({
        page,
    }) => {
        // Given: disabled login still supplies a bootstrap administrator.
        await page.setViewportSize({ width, height: 850 });
        await page.route("**/config", (route) =>
            route.fulfill({
                json: {
                    ...guestConfig,
                    app_mode: "development",
                    login_enabled: false,
                    bootstrap_access_token: "bootstrap-token",
                    bootstrap_user: {
                        id: 1,
                        email: "demo@example.com",
                        name: "Demo",
                        role: "admin",
                        is_verified: true,
                        created_at: "2026-01-01T00:00:00Z",
                        oauth_providers: [],
                    },
                },
            }),
        );
        // When: opening the profile menu.
        await page.goto("/");
        await page.locator(".profile-menu__trigger").click();
        const menu = page.locator(".profile-menu__dropdown");
        // Then: static identity/settings fit and no account authentication controls appear.
        await expect(menu).toContainText("demo@example.com");
        await expect(menu.getByRole("link", { name: "Settings" })).toBeVisible();
        await expect(menu.getByRole("button", { name: "Switch account" })).toHaveCount(0);
        await expect(page.getByRole("link", { name: "Add account" })).toHaveCount(0);
        await expect(menu).not.toContainText("Sign out");
        const bounds = (await menu.boundingBox())!;
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    });
}

test("legacy Google and GitHub history for the same email renders once", async ({ page }) => {
    // Given: the same account was remembered with both OAuth providers.
    await page.addInitScript(() =>
        localStorage.setItem(
            "blueprint_recent_accounts_v1",
            JSON.stringify([
                {
                    email: "same@example.com",
                    name: "Same account",
                    provider: "google",
                    lastUsed: Date.now() - 1000,
                },
                {
                    email: "same@example.com",
                    name: "Same account",
                    provider: "github",
                    lastUsed: Date.now(),
                },
            ]),
        ),
    );
    // When: opening login.
    await page.goto("/login");
    // Then: the latest method is shown in a single account row.
    const rows = page.locator(".auth-dialog .recent-accounts li");
    await expect(rows).toHaveCount(1);
    await expect(rows).toContainText("GitHub");
});

for (const width of [390, 1440]) {
    test(`modal scroll stays inset and focus stays integrated at ${width}px`, async ({ page }) => {
        // Given: a short recovery modal; replay any inner entry animation at its first frame.
        await page.setViewportSize({ width, height: 850 });
        await page.goto("/forgot-password");
        const body = page.locator(".ui-modal__body");
        await expect(body).toBeVisible();
        const overflow = await body.evaluate((node) => {
            for (const animation of node.getAnimations({ subtree: true })) {
                animation.pause();
                animation.currentTime = 0;
            }
            return node.scrollHeight - node.clientHeight;
        });
        expect(overflow).toBeLessThanOrEqual(1);
        // When: a taller signup form needs scrolling.
        await page.goto("/signup");
        const panel = page.locator(".ui-modal__panel");
        await expect(panel).toBeVisible();
        const input = page.getByRole("dialog").getByLabel("Name", { exact: true });
        await input.focus();
        const geometry = await body.evaluate((node) => {
            const panel = node.closest(".ui-modal__panel")!;
            const input = node.querySelector("input")!;
            const outer = panel.getBoundingClientRect();
            const inner = node.getBoundingClientRect();
            const field = input.getBoundingClientRect();
            return {
                inset: outer.right - inner.right,
                gap: inner.right - field.right,
                overflow: node.scrollHeight - node.clientHeight,
                outlineOffset: parseFloat(getComputedStyle(input).outlineOffset),
                outlineWidth: parseFloat(getComputedStyle(input).outlineWidth),
            };
        });
        // Then: controls clear the scrollbar, the frame clips corners, and focus has no detached ring.
        expect(geometry.inset).toBeGreaterThanOrEqual(10);
        expect(geometry.gap).toBeGreaterThanOrEqual(12);
        expect(geometry.overflow).toBeGreaterThan(0);
        expect(geometry.outlineOffset).toBeLessThanOrEqual(0);
        expect(geometry.outlineWidth).toBeGreaterThanOrEqual(2);
        await expect(panel).toHaveCSS("overflow-y", "hidden");
        const close = page.getByRole("button", { name: "Close", exact: true });
        const before = await close.boundingBox();
        await body.evaluate((node) => {
            node.scrollTop = node.scrollHeight;
        });
        await expect(
            page.getByRole("dialog").getByRole("button", { name: "Create account", exact: true }),
        ).toBeInViewport();
        expect(await close.boundingBox()).toEqual(before);
        await page.screenshot({ path: `test-results/account-modal-${width}.png` });
    });
}

test("showcase previews email code validation without account requests", async ({ page }) => {
    // Given: the actual shared deletion dialog in its isolated catalogue fixture.
    let accountRequests = 0;
    await page.route("**/api/v1/auth/me**", (route) => {
        accountRequests += 1;
        return route.abort();
    });
    await page.goto("/show-case");
    await page.getByRole("button", { name: "Preview account deletion verification" }).click();
    const dialog = page.getByRole("dialog", { name: "Delete account" });
    const confirm = dialog.getByRole("button", { name: "Delete account", exact: true });
    await expect(confirm).toBeDisabled();
    // When: requesting a preview code and entering an incorrect value.
    await dialog.getByRole("button", { name: "Send code" }).click();
    const code = dialog.getByLabel("6-digit verification code");
    await expect(code).toHaveAttribute("autocomplete", "one-time-code");
    await code.fill("000000");
    await confirm.click();
    await expect(dialog.getByRole("alert")).toContainText("invalid");
    await code.fill("123456");
    await confirm.click();
    // Then: only the local preview completes; no auth mutation or SMTP request was issued.
    await expect(
        page.getByText("Preview verification completed. No account was deleted."),
    ).toBeVisible();
    expect(accountRequests).toBe(0);
});
