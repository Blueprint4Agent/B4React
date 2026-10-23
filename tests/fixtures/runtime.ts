import type { Page } from "./browser";
export const member = {
    id: 1,
    name: "Manager",
    email: "manager@example.com",
    role: "manager",
    is_verified: true,
    created_at: "2026-01-01T00:00:00Z",
    oauth_providers: [],
};
export async function setup(page: Page, role: string | null, mode = "production") {
    await page.route("**/config", (route) =>
        route.fulfill({
            json: {
                app_mode: mode,
                billing_enabled: true,

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
