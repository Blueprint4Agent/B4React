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
                animations: "disabled",
                fullPage: true,
            });
            for (const path of ["/show-case", "/show-case/loading", "/show-case/404"]) {
                await page.goto(path);
                await expect(page).toHaveURL(/\/home$/);
                await expect(page.locator(".showcase-catalog")).toHaveCount(0);
            }
        });
    }
test("production guest home and authentication have no showcase backdrop", async ({ page }) => {
    await setup(page, null);
    await page.goto("/show-case");
    await expect(page).toHaveURL(/\/home$/);
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator(".showcase-catalog")).toHaveCount(0);
});
test("normal users cannot enter manager directory", async ({ page }) => {
    await setup(page, "user");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole("table")).toHaveCount(0);
});
test("unknown runtime mode does not enable developer UI", async ({ page }) => {
    await setup(page, null, "unknown");
    await page.goto("/show-case");
    await expect(page.locator(".showcase-catalog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /retry|try again/i })).toBeVisible();
});

for (const width of [390, 1440])
    for (const colorScheme of ["light", "dark"] as const) {
        test(`production home matches settings ${colorScheme} at ${width}`, async ({
            page,
        }, info) => {
            await page.setViewportSize({ width, height: 1000 });
            await page.emulateMedia({ colorScheme });
            await setup(page, "manager");
            await page.goto("/");
            await expect(page).toHaveURL(/\/home$/);
            await expect(page.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
            await expect(page.locator(".main-page-template__link")).toHaveCount(4);
            await expect(page.locator('.main-page-template__link[href="/admin"]')).toBeVisible();
            await expect(page.locator('a[href="/show-case"]')).toHaveCount(0);
            const geometry = () =>
                page.evaluate(() => {
                    const card = document.querySelector(".settings-content-card")!;
                    const header = document.querySelector(".settings-content-card__header")!;
                    const row = document.querySelector(".settings-row")!;
                    const style = getComputedStyle(row);
                    return {
                        width: card.getBoundingClientRect().width,
                        padding: getComputedStyle(card).padding,
                        gap: getComputedStyle(header).marginBottom,
                        rowPadding: style.padding,
                        border: style.border,
                        radius: style.borderRadius,
                        background: style.backgroundColor,
                    };
                });
            const home = await geometry();
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            ).toBe(true);
            await page.screenshot({
                path: info.outputPath("home.png"),
                animations: "disabled",
                fullPage: true,
            });
            await page
                .locator('.main-page-template__link[href="/settings?section=general"]')
                .click();
            await expect(page).toHaveURL(/\/settings\?section=general$/);
            await expect(page.getByRole("heading", { name: "General", exact: true })).toBeVisible();
            await expect(page.locator(".settings-row").first()).toBeVisible();
            expect(await geometry()).toEqual(home);
            await page.screenshot({
                path: info.outputPath("general-peer.png"),
                animations: "disabled",
                fullPage: true,
            });
            await page.getByRole("link", { name: "Back to app", exact: true }).click();
            await expect(page).toHaveURL(/\/home$/);
            await page
                .locator('.main-page-template__link[href="/settings?section=account"]')
                .click();
            await expect(page).toHaveURL(/\/settings\?section=account$/);
        });
    }

test("Korean production home wraps long account names and hides privileged shortcuts", async ({
    page,
}, info) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.addInitScript(() => localStorage.setItem("b4a_language", "ko"));
    await setup(page, "user");
    await page.route("**/api/v1/auth/me", (route) =>
        route.fulfill({
            json: {
                ...member,
                role: "user",
                name: "아주긴이름을사용하는사용자아주긴이름을사용하는사용자",
            },
        }),
    );
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole("heading", { name: "홈", exact: true })).toBeVisible();
    await expect(page.locator(".main-page-template__link")).toHaveCount(3);
    await expect(page.locator('.main-page-template__link[href="/admin"]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
    );
    await page.screenshot({
        path: info.outputPath("home-ko.png"),
        animations: "disabled",
        fullPage: true,
    });
});

test("signed-out visitors use home and sign in for account access", async ({ page }) => {
    await setup(page, null);
    await page.goto("/home");
    await expect(page).toHaveURL(/\/home$/);
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator('.main-page-template__link[href="/admin"]')).toHaveCount(0);
});

for (const width of [390, 1440]) {
    test(`main template showcase supports grid, actions and extra content at ${width}`, async ({
        page,
    }, info) => {
        await page.setViewportSize({ width, height: 1000 });
        await setup(page, "user", "development");
        await page.goto("/show-case");
        const demo = page.locator('[data-component="MainPageTemplate"]');
        await demo.scrollIntoViewIfNeeded();
        await expect(demo.locator(".main-page-template__menu--grid")).toBeVisible();
        await expect(
            demo.getByRole("heading", { name: "Content area", exact: true }),
        ).toBeVisible();
        await demo.getByRole("button", { name: "Sample action", exact: true }).click();
        await expect(
            page.getByText("Connect this action to your workflow.", { exact: true }),
        ).toBeVisible();
        const cards = await demo.locator(".main-page-template__link").evaluateAll((nodes) =>
            nodes.map((node) => ({
                x: node.getBoundingClientRect().x,
                y: node.getBoundingClientRect().y,
            })),
        );
        if (width === 390) expect(cards[1].y).toBeGreaterThan(cards[0].y);
        else expect(cards[1].x).toBeGreaterThan(cards[0].x);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
            true,
        );
        await demo.screenshot({
            animations: "disabled",
            path: info.outputPath("template-showcase.png"),
        });
    });
}

for (const mode of ["development", "production"]) {
    test(`${mode} uses home as default and only development exposes showcase`, async ({ page }) => {
        await setup(page, "user", mode);
        for (const path of ["/", "/dashboard", "/login"]) {
            await page.goto(path);
            await expect(page).toHaveURL(/\/home$/);
            await expect(page.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
        }
        const showcase = page.locator('.app-sidebar__item[href="/show-case"]');
        if (mode === "development") {
            await expect(showcase).toBeVisible();
            await showcase.click();
            await expect(page.locator(".showcase-catalog")).toBeVisible();
            await page.locator('.app-sidebar__item[href="/home"]').click();
            await expect(page).toHaveURL(/\/home$/);
        } else await expect(showcase).toHaveCount(0);
    });
}
