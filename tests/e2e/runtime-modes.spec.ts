import { expect, test, type Page } from "@playwright/test";

const member = {
    id: 1,
    name: "Manager",
    email: "manager@example.com",
    role: "manager",
    is_verified: true,
    created_at: "2026-01-01T00:00:00Z",
    oauth_providers: [],
};
async function setup(page: Page, role: string | null, mode = "production") {
    await page.route("**/config", (route) =>
        route.fulfill({
            json: {
                app_mode: mode,
                api_base_path: "/api/v1",
                login_enabled: true,
                frontend_base_path: "",
                email_enabled: false,
                oauth_enabled: false,
                oauth_providers: [],
                bootstrap_user: null,
                bootstrap_access_token: null,
            },
        }),
    );
    await page.route("**/api/v1/auth/refresh", (route) =>
        route.fulfill(
            role
                ? {
                      json: {
                          access_token: "runtime-test",
                          refresh_token: "runtime-refresh",
                          token_type: "bearer",
                      },
                  }
                : {
                      status: 401,
                      json: { detail: { error: "INVALID_TOKEN", message: "No session" } },
                  },
        ),
    );
    await page.route("**/api/v1/auth/me", (route) => route.fulfill({ json: { ...member, role } }));
    await page.route("**/api/v1/auth/admin/users?*", (route) =>
        route.fulfill({
            json: {
                items: [
                    { ...member, is_active: true, last_login_at: null, login_providers: ["email"] },
                ],
                total: 1,
                page: 1,
                page_size: 10,
                summary: { total_users: 1, active_users: 1, admin_users: 0, manager_users: 1 },
            },
        }),
    );
}
for (const width of [390, 1440])
    for (const colorScheme of ["light", "dark"] as const) {
        test(`production manager uses read-only directory ${colorScheme} at ${width}`, async ({
            page,
        }, info) => {
            await page.setViewportSize({ width, height: 1000 });
            await page.emulateMedia({ colorScheme });
            await setup(page, "manager");
            await page.goto("/admin");
            await expect(page.getByRole("table")).toBeVisible();
            await expect(page.getByRole("status").filter({ hasText: /^Manager$/ })).toBeVisible();
            await expect(page.getByRole("link", { name: "GitHub", exact: true })).toHaveCount(0);
            await expect(page.getByRole("link", { name: "User guide", exact: true })).toHaveCount(
                0,
            );
            await expect(page.locator('a[href="/show-case"]')).toHaveCount(0);
            await expect(
                page.getByRole("button", { name: "All roles", exact: true }),
            ).toBeVisible();
            await page.getByRole("button", { name: "All roles", exact: true }).click();
            await page.getByRole("menuitem", { name: "Manager", exact: true }).click();
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            ).toBe(true);
            await page.screenshot({
                path: info.outputPath("production-manager.png"),
                fullPage: true,
            });
            for (const path of ["/show-case", "/show-case/loading", "/show-case/404"]) {
                await page.goto(path);
                await expect(page).toHaveURL(/\/settings\?section=account$/);
                await expect(page.locator(".showcase-catalog")).toHaveCount(0);
            }
        });
    }
test("production guest authentication has no showcase backdrop", async ({ page }) => {
    await setup(page, null);
    await page.goto("/show-case");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator(".showcase-catalog")).toHaveCount(0);
});
test("normal users cannot enter manager directory", async ({ page }) => {
    await setup(page, "user");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/settings\?section=account$/);
    await expect(page.getByRole("table")).toHaveCount(0);
});
test("unknown runtime mode does not enable developer UI", async ({ page }) => {
    await setup(page, null, "unknown");
    await page.goto("/show-case");
    await expect(page.locator(".showcase-catalog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /retry|try again/i })).toBeVisible();
});
