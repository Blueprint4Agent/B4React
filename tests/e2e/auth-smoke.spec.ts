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
