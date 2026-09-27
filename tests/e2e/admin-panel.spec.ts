import { expect, test, type Page } from "@playwright/test";

const admin = {
    id: 1,
    name: "Operator",
    email: "operator@example.com",
    role: "admin",
    is_verified: true,
    created_at: "2026-01-01T00:00:00Z",
    oauth_providers: [],
};
const users = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    name: `Member ${index + 1}`,
    email: `member${index + 1}@example.com`,
    role: index === 0 ? "admin" : "user",
    is_active: index !== 1,
    is_verified: true,
    created_at: "2026-01-01T00:00:00Z",
    last_login_at: index === 1 ? null : "2026-09-20T12:34:00Z",
    login_providers: ["google", "github"],
}));
async function setup(page: Page, role = "admin") {
    await page.route("**/config", (route) =>
        route.fulfill({
            json: {
                api_base_path: "/api/v1",
                login_enabled: false,
                frontend_base_path: "",
                email_enabled: false,
                oauth_enabled: false,
                oauth_providers: [],
                bootstrap_user: { ...admin, role },
                bootstrap_access_token: "admin-test-token",
            },
        }),
    );
    await page.route("**/api/v1/auth/admin/users?*", (route) => {
        expect(route.request().headers().authorization).toBe("Bearer admin-test-token");
        const params = new URL(route.request().url()).searchParams;
        const search = params.get("search") ?? "";
        const roleFilter = params.get("role");
        const status = params.get("is_active");
        const filtered = users.filter(
            (user) =>
                `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase()) &&
                (!roleFilter || user.role === roleFilter) &&
                (!status || String(user.is_active) === status),
        );
        const pageNumber = Number(params.get("page") ?? 1);
        return route.fulfill({
            json: {
                items: filtered.slice((pageNumber - 1) * 10, pageNumber * 10),
                total: filtered.length,
                page: pageNumber,
                page_size: 10,
                summary: { total_users: 12, active_users: 11, admin_users: 1 },
            },
        });
    });
}
for (const width of [390, 1440]) {
    test(`admin profile opens the settings-style user directory at ${width}px`, async ({
        page,
    }, testInfo) => {
        // Given: a bootstrap administrator with user data.
        await setup(page);
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");
        await page.locator(".profile-menu__trigger").click();
        await page.getByRole("link", { name: "Admin panel", exact: true }).click();
        // When: browsing the directory and paging/searching.
        await expect(page).toHaveURL(/\/admin$/);
        await expect(page.getByRole("heading", { name: "Admin panel" })).toBeVisible();
        await expect(page.getByRole("navigation", { name: "Admin panel" })).toBeVisible();
        await expect(page.getByText("member1@example.com", { exact: true })).toBeVisible();
        await expect(page.getByText("No recorded sign-in", { exact: true })).toBeVisible();
        await page.screenshot({ path: testInfo.outputPath("admin-panel.png"), fullPage: true });
        expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        await page.getByRole("button", { name: "Next page" }).click();
        await expect(page.getByText("member11@example.com", { exact: true })).toBeVisible();
        await page.getByLabel("Search name or email").fill("member3@");
        await page.getByRole("button", { name: "Search", exact: true }).click();
        await expect(page.getByText("member3@example.com", { exact: true })).toBeVisible();
        await expect(page.getByText("member11@example.com", { exact: true })).toHaveCount(0);
        // Then: roles remain display-only and the page never exposes role editing.
        await expect(page.getByRole("combobox")).toHaveCount(0);
        await page.getByLabel("Search name or email").fill("no-match");
        await page.getByRole("button", { name: "Search", exact: true }).click();
        await expect(page.getByText("No matching users.")).toBeVisible();
    });
}

test("non-admin users cannot see the menu or request the admin directory", async ({ page }) => {
    // Given: an ordinary user tries a direct administrator URL.
    await setup(page, "user");
    let requests = 0;
    page.on("request", (request) => {
        if (request.url().includes("/auth/admin/users")) requests++;
    });
    // When: opening the protected route and profile.
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/show-case$/);
    await page.locator(".profile-menu__trigger").click();
    // Then: no panel entry or admin request is available.
    await expect(page.getByRole("link", { name: "Admin panel" })).toHaveCount(0);
    expect(requests).toBe(0);
});

test("directory failures expose retry and clear user rows", async ({ page }) => {
    // Given: an administrator receives a failed directory response.
    await setup(page);
    await page.route("**/api/v1/auth/admin/users?*", (route) =>
        route.fulfill({ status: 500, json: { detail: { error: "ADMIN_USERS_FAILED" } } }),
    );
    await page.goto("/admin");
    await expect(page.locator(".ui-inline-message")).toContainText("Could not load users");
    // When: the endpoint recovers and the user retries.
    await page.unroute("**/api/v1/auth/admin/users?*");
    await setup(page);
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    // Then: users load without leaving the administrator workspace.
    await expect(page.getByText("member1@example.com", { exact: true })).toBeVisible();
});
