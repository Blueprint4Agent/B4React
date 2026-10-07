import { expect, test } from "@playwright/test";

const config = {
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

test("failed chunk can return to the eager showcase", async ({ page }) => {
    // Given: an unavailable secondary route.
    await page.route(/\/assets\/AdminPage-[^/]+\.js$/, (route) => route.abort());
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Unable to load this page" })).toBeVisible();
    // When: choosing the home recovery action.
    await page.getByRole("button", { name: "Back to components" }).click();
    // Then: route-local failure does not poison the shell or home page.
    await expect(page).toHaveURL(/\/show-case$/);
    await expect(page.locator(".showcase-catalog")).toBeVisible();
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
    await expect(page.getByRole("heading", { name: "Monthly", exact: true })).toBeVisible();
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

test("production runtime blocks showcase and renders only guest authentication", async ({
    page,
}) => {
    await page.route("**/config", (route) =>
        route.fulfill({ json: { ...config, app_mode: "production", login_enabled: true } }),
    );
    await page.route("**/api/v1/auth/refresh", (route) =>
        route.fulfill({ status: 401, json: { detail: { error: "INVALID_TOKEN" } } }),
    );
    await page.goto("/show-case");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator(".showcase-catalog")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "GitHub", exact: true })).toHaveCount(0);
});
