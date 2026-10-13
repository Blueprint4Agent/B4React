import { expect, test } from "../fixtures/browser";

const config = {
    billing_enabled: true,

    api_base_path: "/api/v1",
    frontend_base_path: "",
    app_mode: "development",
    login_enabled: false,
    email_enabled: false,
    oauth_enabled: false,
    oauth_providers: [],
};
test.beforeEach(async ({ page }) => {
    await page.route("**/config", (route) => route.fulfill({ json: config }));
});

test("defers secondary chunks and retains the shell while settings loads", async ({ page }) => {
    // Given: a production build and a settings chunk whose response is held.
    const scripts: string[] = [];
    page.on("request", (request) => {
        if (request.resourceType() === "script") scripts.push(request.url());
    });
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
        release = resolve;
    });
    await page.route(/\/assets\/SettingsPage-[^/]+\.js$/, async (route) => {
        await held;
        await route.continue();
    });
    await page.goto("/show-case");
    await expect(page.locator(".showcase-catalog")).toBeVisible();
    expect(scripts.some((url) => /\/(SettingsPage|AdminPage|LoginPage|PlansPage)-/.test(url))).toBe(
        false,
    );
    // When: navigating to settings without a full page reload.
    await page.locator(".profile-menu__trigger").click();
    await page.getByRole("link", { name: "Settings", exact: true }).click();
    await expect(page.locator(".page-state")).toBeVisible();
    await expect(page.locator(".app-sidebar")).toBeVisible();
    release();
    // Then: settings renders after its own chunk arrives.
    await expect(page.locator(".settings-layout")).toBeVisible();
    expect(scripts.some((url) => /\/SettingsPage-/.test(url))).toBe(true);
});

test("failed chunk offers an explicit reload that restores the current route", async ({ page }) => {
    // Given: an unavailable deployed settings chunk.
    await page.route(/\/assets\/SettingsPage-[^/]+\.js$/, (route) => route.abort());
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Unable to load this page" })).toBeVisible();
    await expect(page.locator(".app-sidebar")).toBeVisible();
    // When: the chunk becomes available and the user reloads.
    await page.unroute(/\/assets\/SettingsPage-[^/]+\.js$/);
    await page.getByRole("button", { name: "Reload page" }).click();
    // Then: a fresh module load restores settings.
    await expect(page.locator(".settings-layout")).toBeVisible();
    await expect(page).toHaveURL(/\/settings(?:\?|$)/);
});

test("failed chunk can return to the default home", async ({ page }) => {
    // Given: an unavailable secondary route.
    await page.route(/\/assets\/AdminPage-[^/]+\.js$/, (route) => route.abort());
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Unable to load this page" })).toBeVisible();
    // When: choosing the home recovery action.
    await page.getByRole("button", { name: "Home", exact: true }).click();
    // Then: route-local failure does not poison the shell or home page.
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.locator("#home-project-title")).toBeVisible();
});

test("plan selection loads its own production chunk and preserves currency preference", async ({
    page,
}) => {
    const scripts: string[] = [];
    page.on("request", (request) => {
        if (request.resourceType() === "script") scripts.push(request.url());
    });
    await page.goto("/show-case");
    await expect(page.locator(".showcase-catalog")).toBeVisible();
    expect(scripts.some((url) => /\/PlansPage-/.test(url))).toBe(false);
    await page.locator(".profile-menu__trigger").click();
    await page.getByRole("link", { name: "Upgrade plan", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Plus", exact: true })).toBeVisible();
    await expect(page.locator(".app-sidebar")).toHaveCount(0);
    await page.getByRole("button", { name: "Dollar", exact: true }).click();
    await page.reload();
    await expect(page.getByRole("button", { name: "Dollar", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
    );
    await expect(
        page.getByRole("button", { name: "Sign in to continue", exact: true }).first(),
    ).toBeVisible();
    expect(scripts.some((url) => /\/PlansPage-/.test(url))).toBe(true);
});

test("production runtime redirects showcase to the guest home", async ({ page }) => {
    await page.route("**/config", (route) =>
        route.fulfill({ json: { ...config, app_mode: "production", login_enabled: true } }),
    );
    await page.route("**/api/v1/auth/refresh", (route) =>
        route.fulfill({ status: 401, json: { detail: { error: "INVALID_TOKEN" } } }),
    );
    await page.goto("/show-case");
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.locator("#home-project-title")).toBeVisible();
    await expect(page.locator(".showcase-catalog")).toHaveCount(0);
    await expect(
        page
            .locator(".app-sidebar, .app-header")
            .getByRole("link", { name: "GitHub", exact: true }),
    ).toHaveCount(0);
    await expect(
        page.locator(".home-hero__actions").getByRole("link", { name: "GitHub", exact: true }),
    ).toHaveAttribute("href", "https://github.com/Blueprint4Agent/B4FastAPI");
});

test("production home remains available when a secondary route chunk fails", async ({ page }) => {
    await page.route("**/config", (route) =>
        route.fulfill({ json: { ...config, app_mode: "production", login_enabled: true } }),
    );
    await page.route("**/api/v1/auth/refresh", (route) =>
        route.fulfill({
            json: {
                access_token: "home-test",
                refresh_token: "home-refresh",
                token_type: "bearer",
            },
        }),
    );
    await page.route("**/api/v1/auth/me", (route) =>
        route.fulfill({
            json: {
                id: 1,
                name: "Home user",
                email: "home@example.com",
                role: "user",
                is_verified: true,
                created_at: "2026-01-01T00:00:00Z",
                oauth_providers: [],
            },
        }),
    );
    await page.route(/\/assets\/SettingsPage-[^/]+\.js$/, (route) => route.abort());
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Unable to load this page" })).toBeVisible();
    await page.getByRole("button", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.locator("#home-project-title")).toBeVisible();
    await expect(page.locator(".home-account__link")).toHaveCount(5);
});

for (const layout of ["sidebar", "topnav", "focused"]) {
    test(`same production artifact accepts runtime layout ${layout}`, async ({ page }) => {
        // Given: the same build, with a deployment-specific config and stale development preview.
        await page.addInitScript(() => localStorage.setItem("blueprint_layout_preview", "focused"));
        await page.route("**/config", (route) =>
            route.fulfill({
                json: {
                    ...config,
                    app_mode: "production",
                    login_enabled: true,
                    app_layout: layout,
                },
            }),
        );
        // When: the application loads its deployment config.
        await page.goto("/home");
        // Then: server configuration owns the shell, without rebuilding or exposing development controls.
        await expect(page.locator(`.app-shell--${layout}`)).toBeVisible();
        await expect(page.locator("#home-project-title")).toBeVisible();
        await expect(page.locator(".home-section-nav a")).toHaveCount(4);
        await page.goto("/settings?section=appearance");
        await expect(page.locator(`.app-shell--${layout}`)).toBeVisible();
        await expect(page.locator(".layout-option")).toHaveCount(0);
    });
}

test("development can clear a saved preview and follow the deployment default", async ({
    page,
}) => {
    await page.addInitScript(() => localStorage.setItem("blueprint_layout_preview", "sidebar"));
    await page.route("**/config", (route) =>
        route.fulfill({ json: { ...config, app_layout: "topnav" } }),
    );
    await page.goto("/settings?section=appearance");
    await expect(page.locator(".app-shell--sidebar")).toBeVisible();
    await page.getByRole("button", { name: "Use service default" }).click();
    await expect(page.locator(".app-shell--topnav")).toBeVisible();
    await expect(page.getByRole("button", { name: "Use service default" })).toBeDisabled();
    expect(await page.evaluate(() => localStorage.getItem("blueprint_layout_preview"))).toBeNull();
});
