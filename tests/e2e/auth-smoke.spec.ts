import { expect, test } from "@playwright/test";

const guestConfig = {
    api_base_path: "/api/v1",
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
test("settings remains protected and dialog keyboard focus stays contained", async ({ page }) => {
    // Given: a guest directly requests account settings.
    await page.goto("/settings");
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
