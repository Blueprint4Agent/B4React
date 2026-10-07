import { expect, test } from "@playwright/test";
const config = {
    billing_enabled: true,
    subscriptions_enabled: true,
    api_base_path: "/api/v1",
    frontend_base_path: "",
    app_mode: "development",
    login_enabled: false,
    email_enabled: false,
    oauth_enabled: false,
    oauth_providers: [],
    bootstrap_access_token: "config-test-token",
    bootstrap_user: {
        id: 1,
        name: "Operator",
        email: "operator@example.com",
        role: "admin",
        is_verified: true,
        created_at: "2026-01-01T00:00:00Z",
        oauth_providers: [],
    },
};
for (const route of ["/show-case", "/settings", "/admin"]) {
    test(`shares one configuration request on ${route}`, async ({ page }) => {
        // Given: all mounted consumers use a single configuration response.
        let calls = 0;
        await page.route("**/config", (request) => {
            calls++;
            return request.fulfill({ json: config });
        });
        await page.route("**/api/v1/auth/admin/users?*", (request) =>
            request.fulfill({
                json: {
                    items: [],
                    total: 0,
                    page: 1,
                    page_size: 10,
                    summary: { total_users: 0, active_users: 0, admin_users: 0, manager_users: 0 },
                },
            }),
        );
        // When: loading the route and opening another page through the profile menu.
        await page.goto(route);
        await page.locator(".profile-menu__trigger").click();
        await expect(page.getByRole("link", { name: "Admin panel", exact: true })).toBeVisible();
        expect(calls).toBe(1);
        await page.getByRole("link", { name: "Settings", exact: true }).click();
        await expect(page).toHaveURL(/\/settings$/);
        // Then: auth/sidebar/page consumers and route navigation do not refetch config.
        expect(calls).toBe(1);
    });
}
test("failed initial config retries once and restores bootstrap authentication", async ({
    page,
}) => {
    // Given: the initial shared request fails.
    let calls = 0;
    await page.route("**/config", (request) => {
        calls++;
        return request.fulfill(
            calls === 1 ? { status: 503, json: { message: "unavailable" } } : { json: config },
        );
    });
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Server unavailable" })).toBeVisible();
    expect(calls).toBe(1);
    // When: explicitly retrying the configuration.
    await page.getByRole("button", { name: "Retry connection" }).click();
    await page.locator(".profile-menu__trigger").click();
    // Then: the same successful snapshot restores auth without another config request.
    await expect(page.getByRole("link", { name: "Admin panel", exact: true })).toBeVisible();
    expect(calls).toBe(2);
});
