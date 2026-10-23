import { captureVisual } from "../fixtures/visual";
import { expect, test, type Page } from "../fixtures/browser";
const snapshot = {
    environment_values: {
        APP_MODE: "development",
        EMAIL_ENABLED: true,
        LOGIN_ENABLED: true,
        OAUTH_ENABLED: true,
        STRIPE_ENABLED: true,

        REDIS_IN_MEMORY: false,
    },
    integration_checks: {
        email: { status: "ok", checked_at: "2026-10-07T09:00:00Z" },
        billing: { status: "ok", checked_at: "2026-10-07T09:00:00Z" },
    },
    startup_checks: {
        email: { status: "ok", checked_at: "2026-10-07T08:00:00Z" },
        billing: { status: "ok", checked_at: "2026-10-07T08:00:00Z" },
        oauth: { status: "configured", checked_at: "2026-10-07T08:00:00Z" },
    },
    status: "degraded",
    checked_at: "2026-10-07T09:00:00Z",
    connections: [
        { id: "server", technology: "fastapi", status: "ok", latency_ms: null },
        {
            id: "object_storage",
            technology: "local",
            status: "ok",
            latency_ms: 1,
            transport: "filesystem",
            port: null,
            probe: "local_io",
            checked_at: "2026-10-07T09:00:00Z",
        },
        { id: "database", technology: "sqlite", status: "ok", latency_ms: 2 },
        {
            id: "cache",
            technology: "redis",
            status: "failed",
            latency_ms: 5,
            host: null,
            port: null,
        },
    ],
    environment: {
        app_mode: "development",
        email_enabled: true,
        login_enabled: true,
        oauth_enabled: true,
        oauth_providers: ["google", "github"],
        billing_configured: true,
        billing_enabled: true,
        billing_mode: "test",

        admin_access: "admin_only",
        developer_enabled: true,
        redis_in_memory: false,
    },
};

const row = {
    id: 1234567890,
    name: "User a1b2c3d4e5f6",
    email: "a1b2c3d4e5f6@demo.invalid",
    role: "user",
    is_active: true,
    is_verified: true,
    login_providers: ["email"],
    created_at: "2026-10-01T00:00:00Z",
    last_login_at: null,
};
async function setupDemo(page: Page, enabled = true) {
    const state = { role: null as string | null };
    await page.route("**/config", (route) =>
        route.fulfill({
            json: {
                api_base_path: "/api/v1",
                app_mode: "production",
                login_enabled: true,
                frontend_base_path: "",
                email_enabled: false,
                oauth_enabled: false,
                oauth_providers: [],
                billing_enabled: false,
                demo_enabled: enabled,
            },
        }),
    );
    await page.route("**/api/v1/auth/refresh", (route) =>
        route.fulfill(
            state.role
                ? { json: { access_token: "demo-test", token_type: "bearer" } }
                : { status: 401, json: { detail: { error: "INVALID_TOKEN" } } },
        ),
    );
    await page.route("**/api/v1/auth/me", (route) =>
        route.fulfill({ json: { ...row, id: 1, role: state.role, oauth_providers: [] } }),
    );
    const directory = (url: string) => {
        const search = new URL(url).searchParams.get("search") ?? "";
        const items = row.email.includes(search) || row.name.includes(search) ? [row] : [];
        return {
            items,
            total: items.length,
            page: 1,
            page_size: 10,
            summary: { total_users: 1, active_users: 1, admin_users: 0, manager_users: 0 },
        };
    };
    await page.route("**/api/v1/admin/demo/users?*", (route) =>
        route.fulfill({ json: directory(route.request().url()) }),
    );
    await page.route("**/api/v1/auth/admin/users?*", (route) =>
        route.fulfill({ json: directory(route.request().url()) }),
    );
    await page.route("**/api/v1/admin/demo/status", (route) => route.fulfill({ json: snapshot }));
    await page.route("**/api/v1/admin/status", (route) => route.fulfill({ json: snapshot }));
    return state;
}
for (const width of [390, 1440])
    for (const colorScheme of ["light", "dark"] as const) {
        test(`public demo reuses administrator family ${width} ${colorScheme}`, async ({
            page,
        }, info) => {
            const state = await setupDemo(page);
            await page.setViewportSize({ width, height: 1000 });
            await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
            const privateRequests: string[] = [];
            page.on("request", (request) => {
                if (/\/api\/v1\/(auth\/admin\/users|admin\/status)/.test(request.url()))
                    privateRequests.push(request.url());
            });
            await page.goto("/home");
            await expect(
                page
                    .locator(".app-sidebar__nav")
                    .getByRole("link", { name: "Admin panel (demo)", exact: true }),
            ).toHaveCount(0);
            await page.locator(".profile-menu__trigger").click();
            const demoEntry = page.getByRole("link", { name: "Admin panel (demo)", exact: true });
            await expect(demoEntry).toBeVisible();
            await expect(demoEntry).toHaveClass("profile-menu__item");
            await captureVisual(page, {
                path: info.outputPath("demo-profile-menu.png"),
                fullPage: true,
            });
            await demoEntry.click();
            await expect(page.getByText(row.email, { exact: true })).toBeVisible();
            await expect(page.getByText(/Read-only demo of real user data/)).toBeVisible();
            const geometry = () =>
                page.locator(".settings-content-card").evaluate((el) => ({
                    width: el.getBoundingClientRect().width,
                    padding: getComputedStyle(el).padding,
                    font: getComputedStyle(el.querySelector("h1")!).fontSize,
                }));
            const directoryGeometry = await geometry();
            await captureVisual(page, { path: info.outputPath("demo-users.png"), fullPage: true });
            await page.getByRole("searchbox").fill("no-match");
            await page.getByRole("button", { name: "Search", exact: true }).click();
            await expect(page.getByText("No matching users.")).toBeVisible();
            await page.getByRole("link", { name: "Server status", exact: true }).click();
            await expect(page.getByText("SQLite", { exact: true })).toBeVisible();
            await expect(page.getByText(/Read-only view of real server health/)).toBeVisible();
            await page.getByRole("button", { name: "Refresh", exact: true }).click();
            const statusGeometry = await geometry();
            await captureVisual(page, { path: info.outputPath("demo-server.png"), fullPage: true });
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            ).toBe(true);
            expect(privateRequests).toEqual([]);
            // Compare actual peer components with an administrator session.
            state.role = "admin";
            await page.goto("/admin");
            await expect(page.getByText(row.email, { exact: true })).toBeVisible();
            expect(await geometry()).toEqual(directoryGeometry);
            await page.locator(".profile-menu__trigger").click();
            await expect(
                page.getByRole("link", { name: "Admin panel", exact: true }),
            ).toHaveAttribute("href", "/admin");
            await expect(
                page.getByRole("link", { name: "Admin panel (demo)", exact: true }),
            ).toHaveCount(0);
            await page.keyboard.press("Escape");
            await page.goto("/admin/server");
            await expect(page.getByText("SQLite", { exact: true })).toBeVisible();
            expect(await geometry()).toEqual(statusGeometry);
        });
    }
test("disabled public demo hides navigation and refuses both direct routes", async ({ page }) => {
    await setupDemo(page, false);
    const requests: string[] = [];
    page.on("request", (request) => {
        if (request.url().includes("/api/v1/admin/demo/")) requests.push(request.url());
    });
    for (const path of ["/demo/admin", "/demo/admin/server", "/demo/admin/inquiries"]) {
        await page.goto(path);
        await expect(page).toHaveURL(/\/home$/);
        await page.locator(".profile-menu__trigger").click();
        await expect(
            page.getByRole("link", { name: "Admin panel (demo)", exact: true }),
        ).toHaveCount(0);
    }
    expect(requests).toEqual([]);
});

test("inquiry demo uses sample data without reading or mutating private inquiries", async ({
    page,
}, info) => {
    await setupDemo(page);
    const requests: string[] = [];
    page.on("request", (request) => {
        if (request.url().includes("/api/v1/inquiries")) requests.push(request.url());
    });
    await page.goto("/demo/admin");
    await page.getByRole("link", { name: "Support inquiries", exact: true }).click();
    await expect(page.getByText(/Read-only inquiry demo with sample data/)).toBeVisible();
    await page.getByRole("button", { name: "Changing my subscription", exact: true }).click();
    await expect(
        page.getByText("Can I change my plan before the next payment?", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/Choose a plan in billing settings/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Send reply", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Close inquiry", exact: true })).toHaveCount(0);
    await page.reload();
    await expect(page.getByText(/Choose a plan in billing settings/)).toBeVisible();
    await captureVisual(page, { path: info.outputPath("demo-inquiries.png"), fullPage: true });
    expect(requests).toEqual([]);
});
