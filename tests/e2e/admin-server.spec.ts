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
            host: "cache.internal",
            port: 6379,
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
async function setup(page: Page, role = "admin") {
    await page.route("**/config", (route) =>
        route.fulfill({
            json: {
                billing_enabled: true,

                api_base_path: "/api/v1",
                app_mode: "development",
                login_enabled: false,
                frontend_base_path: "",
                email_enabled: false,
                oauth_enabled: false,
                oauth_providers: [],
                bootstrap_user: {
                    id: 1,
                    name: "Operator",
                    email: "operator@example.com",
                    role,
                    is_verified: true,
                    created_at: "2026-01-01T00:00:00Z",
                    oauth_providers: [],
                },
                bootstrap_access_token: "admin-test-token",
            },
        }),
    );
    await page.route("**/api/v1/admin/status", (route) => route.fulfill({ json: snapshot }));
}
for (const width of [390, 1440])
    for (const colorScheme of ["light", "dark"] as const) {
        test(`server status matches settings family ${width} ${colorScheme}`, async ({
            page,
        }, testInfo) => {
            await setup(page);
            await page.setViewportSize({ width, height: 1000 });
            await page.emulateMedia({ colorScheme });
            const geometry = async () =>
                page.locator(".settings-content-card").evaluate((element) => {
                    const style = getComputedStyle(element);
                    const heading = getComputedStyle(element.querySelector("h1")!);
                    return {
                        width: element.getBoundingClientRect().width,
                        padding: style.padding,
                        font: heading.fontSize,
                    };
                });
            await page.goto("/home");
            await expect(page.locator(".settings-content-card h1")).toBeVisible();
            const home = await geometry();
            await page.goto("/settings?section=general");
            await expect(page.locator(".settings-content-card h1")).toBeVisible();
            const settings = await geometry();
            await page.goto("/admin/server");
            await expect(page.getByRole("heading", { name: "Server status" })).toBeVisible();
            await expect(page.getByText("SQLite", { exact: true })).toBeVisible();
            expect(await geometry()).toEqual(home);
            expect(await geometry()).toEqual(settings);
            await expect(
                page.locator(".server-status-connections .server-status-dot--ok"),
            ).toHaveCount(3);
            await expect(
                page.locator(".server-status-connections .server-status-dot--failed"),
            ).toHaveCount(1);
            await expect(page.locator(".server-oauth-providers li")).toHaveCount(2);
            await expect(
                page.locator(".server-environment-list .server-oauth-providers"),
            ).toBeVisible();
            const valueStarts = await page
                .locator(".server-environment-list dd")
                .evaluateAll((elements) =>
                    elements.map((element) => element.getBoundingClientRect().left),
                );
            expect(new Set(valueStarts).size).toBe(1);
            const latency = await page.locator(".server-status-latency").first().boundingBox();
            const applied = await page
                .locator(".server-environment-list dd > span")
                .first()
                .boundingBox();
            expect(Math.abs(latency!.x - applied!.x)).toBeLessThanOrEqual(1);
            const connectionBadge = await page
                .locator(".server-status-result > .ui-status-badge")
                .first()
                .boundingBox();
            const featureBadge = await page
                .locator(".server-integration-check .ui-status-badge")
                .first()
                .boundingBox();
            expect(Math.abs(connectionBadge!.x - featureBadge!.x)).toBeLessThanOrEqual(1);
            expect(connectionBadge!.width).toBe(featureBadge!.width);
            const panelWidth = await page
                .locator(".server-environment-panel")
                .evaluate((element) => element.getBoundingClientRect().width);
            const connectionsWidth = await page
                .locator(".server-status-connections")
                .evaluate((element) => element.getBoundingClientRect().width);
            expect(panelWidth).toBe(connectionsWidth);
            await expect(
                page.locator(".server-environment-value .ui-code-badge").first(),
            ).toHaveText("development");
            await expect(
                page.locator(".server-connection-address.ui-code-badge").last(),
            ).toHaveText("cache.internal:6379");
            await expect(page.getByText("Configuration checked", { exact: true })).toHaveCount(0);
            await expect(page.getByText("cache.internal:6379", { exact: true })).toBeVisible();
            await expect(page.locator(".server-status-title")).toContainText("Last checked");
            const github = page.locator(
                ".server-oauth-providers .oauth-provider-button__logo--github:visible",
            );
            await expect(github).toHaveCSS("filter", "invert(1)");
            await expect(
                page.getByRole("button", { name: "Refresh", exact: true }),
            ).not.toHaveClass(/ui-button--text/);
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            ).toBe(true);
            await page.screenshot({
                path: testInfo.outputPath("server-status.png"),
                fullPage: true,
            });
            await page.route("**/api/v1/admin/status", (route) =>
                route.fulfill({ status: 503, json: { detail: { error: "ADMIN_STATUS_FAILED" } } }),
            );
            await page.getByRole("button", { name: "Refresh", exact: true }).click();
            await expect(
                page.locator(".server-status-connections .server-status-dot--stale"),
            ).toHaveCount(4);
            await expect(page.locator(".server-status-meta")).toContainText("Stale");
            await page.unroute("**/api/v1/admin/status");
            await page.route("**/api/v1/admin/status", (route) =>
                route.fulfill({ json: snapshot }),
            );
            await page.getByRole("button", { name: "Refresh", exact: true }).click();
            await expect(
                page.locator(".server-status-connections .server-status-dot--ok"),
            ).toHaveCount(3);
        });
    }
for (const role of ["user", "manager"])
    test(`${role} cannot fetch server status`, async ({ page }) => {
        await setup(page, role);
        let requests = 0;
        page.on("request", (request) => {
            if (request.url().endsWith("/admin/status")) requests++;
        });
        await page.goto("/admin/server");
        await expect(page).toHaveURL(/\/home$/);
        expect(requests).toBe(0);
    });

test("initial status loading uses a spinner without visible checking copy", async ({ page }) => {
    await setup(page);
    let release: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
        release = resolve;
    });
    await page.route("**/api/v1/admin/status", async (route) => {
        await pending;
        await route.fulfill({ json: snapshot });
    });
    await page.goto("/admin/server");
    await expect(page.locator(".server-status-overview .ui-spinner__ring")).toBeVisible();
    await expect(page.getByText("Checking…", { exact: true })).toHaveCount(0);
    release?.();
    await expect(page.getByText("SQLite", { exact: true })).toBeVisible();
});

test("CodeBadge is searchable in the showcase", async ({ page }) => {
    await setup(page);
    await page.goto("/show-case");
    await page.getByRole("searchbox").fill("CodeBadge");
    const example = page.locator('[data-component="CodeBadge"]');
    await expect(example.locator("code")).toHaveCount(4);
    await expect(example.getByText("APP_MODE", { exact: true })).toBeVisible();
    await expect(example.getByText("localhost:5432", { exact: true })).toBeVisible();
});

for (const [technology, name] of [
    ["local", "Local"],
    ["s3", "Amazon S3"],
    ["r2", "Cloudflare R2"],
    ["supabase", "Supabase"],
]) {
    test(`storage provider ${technology} uses existing row and safe metadata`, async ({ page }) => {
        await setup(page);
        await page.route("**/api/v1/admin/status", (route) =>
            route.fulfill({
                json: {
                    ...snapshot,
                    connections: [
                        {
                            id: "object_storage",
                            technology,
                            status: "ok",
                            latency_ms: 2,
                            transport: technology === "local" ? "filesystem" : "https",
                            port: technology === "local" ? null : 443,
                            probe: technology === "local" ? "local_io" : "bucket_access",
                            checked_at: snapshot.checked_at,
                        },
                    ],
                },
            }),
        );
        await page.goto("/admin/server");
        const row = page.locator(".server-status-connection");
        await expect(row.getByRole("heading", { name, exact: true })).toBeVisible();
        await expect(row.locator(".ui-code-badge")).toHaveText(
            technology === "local" ? "Local file" : "HTTPS · Port 443",
        );
        await expect(row).not.toContainText("Last checked");
        await expect(row).not.toContainText("Temporary file");
        if (technology === "local")
            await expect(row.locator(".server-stack-icon svg")).toBeVisible();
        else {
            const logo = row.locator(".server-stack-icon img");
            await expect(logo).toHaveAttribute("src", `/stack-brands/${technology}.svg`);
            await expect
                .poll(() => logo.evaluate((img: HTMLImageElement) => img.naturalWidth))
                .toBeGreaterThan(0);
        }
    });
}
