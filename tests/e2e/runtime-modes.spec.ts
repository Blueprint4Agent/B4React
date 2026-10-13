import { expect, test, type Page } from "../fixtures/browser";

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
        test(`production landing preserves shared surfaces and account routes ${colorScheme} at ${width}`, async ({
            page,
        }, info) => {
            await page.setViewportSize({ width, height: 1000 });
            await page.emulateMedia({ colorScheme });
            await setup(page, "manager");
            await page.goto("/");
            await expect(page).toHaveURL(/\/home$/);
            await expect(page.locator("#home-project-title")).toBeVisible();
            await expect(page.locator(".home-account__link")).toHaveCount(6);
            await expect(page.locator('.home-account__link[href="/admin"]')).toBeVisible();
            await expect(page.locator('a[href="/show-case"]')).toHaveCount(0);
            const geometry = () =>
                page.evaluate(() => {
                    const shell = document.querySelector(".home-landing, .settings-content-card")!;
                    const style = getComputedStyle(shell);
                    return { font: style.fontFamily, color: style.color };
                });
            await expect(page.locator('.home-account__link[href="/notifications"]')).toBeVisible();
            await expect(
                page.locator('.home-account__link[href="/settings?section=support"]'),
            ).toBeVisible();
            await expect(page.locator(".home-capability")).toHaveCount(12);
            await expect(page.locator(".home-capabilities")).toContainText(
                "opt-in WebSocket provider template",
            );
            const preview = page.locator('.home-preview__images > img[data-active="true"]');
            await expect(preview).toBeVisible();
            await expect
                .poll(() =>
                    preview.evaluate(
                        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
                    ),
                )
                .toBe(true);
            await page.getByRole("button", { name: "Users", exact: true }).click();
            await expect(preview).toHaveAttribute("src", /users-en.webp$/);
            await expect
                .poll(() =>
                    preview.evaluate(
                        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
                    ),
                )
                .toBe(true);
            await page.getByRole("button", { name: "Showcase", exact: true }).click();
            await expect(preview).toHaveAttribute("src", /components-en.webp$/);
            await expect(page.locator(".home-hero .home-eyebrow")).toHaveText("B4A");
            await expect(
                page.getByRole("button", { name: "Open screen", exact: true }),
            ).toHaveCount(0);
            const heroActions = await page
                .locator(".home-hero .home-hero__actions > a")
                .evaluateAll((buttons) =>
                    buttons.map((button) => ({
                        height: button.getBoundingClientRect().height,
                        radius: getComputedStyle(button).borderRadius,
                    })),
                );
            expect(heroActions).toHaveLength(3);
            expect(heroActions[0]).toEqual(heroActions[1]);
            expect(heroActions[0]).toEqual(heroActions[2]);
            await page.getByRole("button", { name: "Billing", exact: true }).click();
            await expect(preview).toHaveAttribute("src", /billing-en.webp$/);
            await expect
                .poll(() =>
                    preview.evaluate(
                        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
                    ),
                )
                .toBe(true);
            const enlarge = page.getByRole("button", { name: "Enlarge", exact: true });
            await enlarge.click();
            const viewer = page.getByRole("dialog", { name: "B4A · Billing" });
            await expect(viewer).toBeVisible();
            await expect
                .poll(() =>
                    viewer
                        .locator("img")
                        .evaluate(
                            (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
                        ),
                )
                .toBe(true);
            expect(
                await viewer.evaluate((element) => element.scrollWidth <= element.clientWidth),
            ).toBe(true);
            await page.keyboard.press("Escape");
            await expect(viewer).toHaveCount(0);
            await expect(enlarge).toBeFocused();
            await page.getByRole("button", { name: "Open screen", exact: true }).click();
            await expect(page).toHaveURL(/section=billing$/);
            await page.goto("/home");
            await expect(page.locator(".home-account__link")).toHaveCount(6);
            await page.locator('.home-section-nav a[href$="#home-product-preview"]').click();
            await expect
                .poll(() =>
                    page
                        .locator("#home-product-preview")
                        .evaluate((element) => element.getBoundingClientRect().top),
                )
                .toBeLessThan(180);
            await page.getByRole("button", { name: "Server status", exact: true }).click();
            await expect(preview).toHaveAttribute("src", /server-en.webp$/);
            await expect(
                page.getByRole("button", { name: "Open screen", exact: true }),
            ).toHaveCount(0);
            const home = await geometry();
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            ).toBe(true);
            await page.screenshot({
                path: info.outputPath("home.png"),
                animations: "disabled",
                fullPage: true,
            });
            await page.locator(".home-capability").last().scrollIntoViewIfNeeded();
            await page.screenshot({
                path: info.outputPath("home-features.png"),
                animations: "disabled",
            });
            await page.locator('.home-account__link[href="/settings?section=general"]').click();
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
            await page.locator('.home-account__link[href="/settings?section=account"]').click();
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
    await expect(page.locator("#home-project-title")).toBeVisible();
    await expect(page.locator(".home-account__link")).toHaveCount(5);
    await expect(page.locator('.home-account__link[href="/admin"]')).toHaveCount(0);
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
    await expect(page.locator('.home-account__link[href="/admin"]')).toHaveCount(0);
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
            await expect(page.locator("#home-project-title")).toBeVisible();
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

test("public previews do not request administrator data or expose restricted destinations", async ({
    page,
}) => {
    await setup(page, null, "production");
    let adminRequests = 0;
    page.on("request", (request) => {
        if (/\/api\/v1\/(admin|auth\/admin)/.test(request.url())) adminRequests++;
    });
    await page.goto("/home");
    for (const name of ["Users", "Server status", "Showcase"]) {
        await page.getByRole("button", { name, exact: true }).click();
        await expect(page.getByRole("button", { name: "Open screen", exact: true })).toHaveCount(0);
    }
    expect(adminRequests).toBe(0);
    await page.getByRole("button", { name: "Billing", exact: true }).click();
    await page.getByRole("button", { name: "Open screen", exact: true }).click();
    await expect(page).toHaveURL(/\/plans$/);
});

for (const mode of ["development", "production"]) {
    test(`optional support link respects ${mode} mode`, async ({ page }) => {
        await setup(page, null, mode);
        await page.goto("/home");
        await expect(page.locator(".home-overview")).toBeVisible();
        const link = page.getByRole("link", { name: "Buy Me a Coffee" });
        if (mode === "development") {
            await expect(link).toHaveCount(1);
            await expect(
                page.locator(".home-overview").getByRole("link", { name: "Buy Me a Coffee" }),
            ).toHaveCount(0);
            await expect(page.locator(".home-support")).toHaveCount(0);
            for (const element of await link.all()) {
                await expect(element).toHaveAttribute(
                    "href",
                    "https://buymeacoffee.com/b4a-test-fixture",
                );
                await expect(element).toHaveAttribute("target", "_blank");
                await expect(element).toHaveAttribute("rel", "noopener noreferrer");
            }
            const sidebarLink = page
                .locator(".app-sidebar__footer")
                .getByRole("link", { name: "Buy Me a Coffee" });
            await expect(sidebarLink).toBeVisible();
            await sidebarLink.hover();
            await expect(page.getByRole("tooltip", { name: "Buy Me a Coffee" })).toBeVisible();
            await page.getByRole("button", { name: "Expand sidebar", exact: true }).click();
            await expect(sidebarLink.locator(".app-sidebar__item-label")).toHaveText(
                "Buy Me a Coffee",
            );
            await page.goto("/settings?section=general");
            await expect(sidebarLink).toBeVisible();
        } else {
            await expect(link).toHaveCount(0);
        }
    });
}

for (const width of [390, 1440]) {
    for (const colorScheme of ["light", "dark"] as const) {
        test(`layout modes preserve settings composition and navigation ${colorScheme} at ${width}`, async ({
            page,
        }, info) => {
            // Given: development Appearance uses the existing settings family.
            await page.setViewportSize({ width, height: 900 });
            await page.emulateMedia({ colorScheme });
            await setup(page, "user", "development");
            let configRequests = 0;
            page.on("request", (request) => {
                if (new URL(request.url()).pathname === "/config") configRequests++;
            });
            await page.goto("/settings?section=appearance");
            await expect(page.getByRole("group", { name: "Layout", exact: true })).toBeVisible();
            const initialConfigRequests = configRequests;
            for (const [mode, label] of [
                ["sidebar", "Sidebar"],
                ["topnav", "Top navigation"],
                ["focused", "Minimal"],
            ]) {
                // When: choosing each mode without reloading the page.
                await page.getByRole("button", { name: label, exact: true }).click();
                await expect(page.locator(".app-shell")).toHaveAttribute("data-layout", mode);
                await expect(
                    page.getByRole("button", { name: label, exact: true }),
                ).toHaveAttribute("aria-pressed", "true");
                // Then: cards contain their preview and text, page chrome fits and fetches are not repeated.
                for (const option of await page.locator(".layout-option").all()) {
                    expect(
                        await option.evaluate((node) => {
                            const outer = node.getBoundingClientRect();
                            return [
                                ...node.querySelectorAll(
                                    ".layout-preview, .ui-button__label > span",
                                ),
                            ].every((child) => {
                                const inner = child.getBoundingClientRect();
                                return (
                                    inner.top >= outer.top &&
                                    inner.bottom <= outer.bottom &&
                                    inner.left >= outer.left &&
                                    inner.right <= outer.right
                                );
                            });
                        }),
                    ).toBe(true);
                }
                expect(
                    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
                ).toBe(true);
                if (mode !== "sidebar") {
                    await expect(
                        page
                            .locator(".app-header")
                            .getByRole("link", { name: "Appearance", exact: true }),
                    ).toHaveCount(0);
                    await expect(page.locator(".section-navigation")).toBeVisible();
                    const github = page
                        .locator(".app-header")
                        .getByRole("link", { name: "GitHub", exact: true });
                    await github.hover();
                    await expect(
                        page.getByRole("tooltip", { name: "GitHub", exact: true }),
                    ).toBeVisible();
                    await page.mouse.move(width - 5, 850);
                    if (mode === "focused" || width < 961) {
                        const menu = page.locator(".app-header__toggle");
                        await menu.hover();
                        await expect(
                            page.getByRole("tooltip", { name: "Open navigation", exact: true }),
                        ).toBeVisible();
                        await menu.click();
                        await expect(menu).toHaveAttribute("aria-expanded", "true");
                        await expect(page.locator(".app-header__menu")).toBeVisible();
                        await page.keyboard.press("Escape");
                        await expect(page.locator(".app-header__menu")).toHaveCount(0);
                        await expect(menu).toBeFocused();
                    }
                    if (mode === "focused") {
                        expect(
                            await page
                                .locator(".app-header")
                                .evaluate((node) => getComputedStyle(node).backgroundColor),
                        ).toBe("rgba(0, 0, 0, 0)");
                    }
                }
                await page.locator(".profile-menu__trigger").hover();
                await expect(
                    page.getByRole("tooltip", { name: "Open profile menu", exact: true }),
                ).toBeVisible();
                await page.locator(".profile-menu__trigger").click();
                const profile = page.getByRole("dialog", { name: "Profile menu", exact: true });
                await expect(profile).toBeVisible();
                const popup = await profile.boundingBox();
                expect(popup!.x).toBeGreaterThanOrEqual(0);
                expect(popup!.x + popup!.width).toBeLessThanOrEqual(width);
                expect(popup!.y).toBeGreaterThanOrEqual(0);
                expect(popup!.y + popup!.height).toBeLessThanOrEqual(900);
                await page.keyboard.press("Escape");
                await page.mouse.move(width - 5, 850);
                await page.screenshot({
                    path: info.outputPath(`${mode}-appearance.png`),
                    animations: "disabled",
                });
                const menuBox = page.locator(
                    mode === "sidebar" ? ".app-sidebar" : ".section-navigation",
                );
                if (mode !== "sidebar" && width < 961)
                    await page.locator(".section-navigation__toggle").click();
                const before = await menuBox.boundingBox();
                await menuBox.getByRole("link", { name: "General", exact: true }).click();
                await expect(
                    page.getByRole("heading", { name: "General", exact: true }),
                ).toBeVisible();
                // The menu keeps its position; content has no repeated translate animation.
                const after = await menuBox.boundingBox();
                expect(after!.x).toBeCloseTo(before!.x, 0);
                expect(after!.y).toBeCloseTo(before!.y, 0);
                expect(
                    await page
                        .locator(".settings-content-card")
                        .evaluate((node) => getComputedStyle(node).animationName),
                ).toBe("none");
                await page.screenshot({
                    path: info.outputPath(`${mode}-general-peer.png`),
                    animations: "disabled",
                });
                if (mode !== "sidebar" && width < 961)
                    await page.locator(".section-navigation__toggle").click();
                await menuBox.getByRole("link", { name: "Appearance", exact: true }).click();
            }
            expect(configRequests).toBe(initialConfigRequests);
            await page.reload();
            await expect(page.locator(".app-shell")).toHaveAttribute("data-layout", "focused");
        });
    }
}

for (const preview of ["topnav", "focused", "invalid"]) {
    test(`production ignores stored layout preview ${preview}`, async ({ page }) => {
        // Given: a stored development selection from a previous session.
        await page.addInitScript(
            (value) => localStorage.setItem("blueprint_layout_preview", value),
            preview,
        );
        await setup(page, "user", "production");
        // When: opening production Appearance.
        await page.goto("/settings?section=appearance");
        // Then: use the configured default and expose no development selector.
        await expect(page.locator(".app-shell")).toHaveAttribute("data-layout", "sidebar");
        await expect(page.getByRole("group", { name: "Layout", exact: true })).toHaveCount(0);
    });
}

for (const mode of ["topnav", "focused"]) {
    test(`${mode} guest navigation keeps login and public settings reachable`, async ({ page }) => {
        // Given: a narrow, signed-out development service.
        await page.setViewportSize({ width: 390, height: 844 });
        await page.addInitScript(
            (value) => localStorage.setItem("blueprint_layout_preview", value),
            mode,
        );
        await setup(page, null, "development");
        // When: opening the account menu and navigating to settings.
        await page.goto("/home");
        await page.locator(".profile-menu__trigger").click();
        await page
            .getByRole("dialog", { name: "Profile menu" })
            .getByRole("link", { name: "Settings", exact: true })
            .click();
        // Then: private section links are absent and login remains available.
        await page.locator(".section-navigation__toggle").click();
        await expect(
            page.locator(".section-navigation").getByRole("link", { name: "Account", exact: true }),
        ).toHaveCount(0);
        await page.locator(".profile-menu__trigger").click();
        await page
            .getByRole("dialog", { name: "Profile menu" })
            .getByRole("link", { name: "Log in", exact: true })
            .click();
        await expect(page.locator(".auth-dialog")).toBeVisible();
        await expect(page.locator(".app-shell")).toHaveAttribute("data-layout", mode);
    });
}

for (const mode of ["topnav", "focused"]) {
    for (const width of [390, 1440]) {
        test(`${mode} keeps Korean home profile inbox and administrator pages contained at ${width}`, async ({
            page,
        }, info) => {
            // Given: the compact/upper navigation mode with localized, role-filtered pages.
            await page.setViewportSize({ width, height: 900 });
            await page.addInitScript((value) => {
                localStorage.setItem("blueprint_layout_preview", value);
                localStorage.setItem("b4a_language", "ko");
            }, mode);
            await setup(page, "manager", "development");
            await page.route("**/api/v1/inbox?*", (route) =>
                route.fulfill({
                    json: {
                        items: [],
                        total: 0,
                        page: 1,
                        page_size: 20,
                        summary: { unread_count: 0, latest_id: 0 },
                    },
                }),
            );
            // When/Then: each page retains its own composition and the chosen chrome.
            for (const [path, selector] of [
                ["/home", ".home-overview"],
                ["/profile", ".personal-profile"],
                ["/notifications", ".inbox-page"],
                ["/admin", ".admin-content"],
                ["/settings?section=appearance", ".layout-options"],
            ]) {
                await page.goto(path);
                await expect(page.locator(selector)).toBeVisible();
                await expect(page.locator(".app-shell")).toHaveAttribute("data-layout", mode);
                expect(
                    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
                ).toBe(true);
                if (path === "/admin") {
                    await expect(page.locator(".section-navigation")).toBeVisible();
                    await expect(page.locator('.app-header a[href="/admin/server"]')).toHaveCount(
                        0,
                    );
                    await expect(
                        page.locator('.section-navigation a[href="/admin/server"]'),
                    ).toHaveCount(0);
                }
                if (path.includes("appearance") && width < 961) {
                    const section = await page.locator(".section-navigation").boundingBox();
                    const heading = await page.locator(".settings-content-card h1").boundingBox();
                    expect(heading!.y - section!.y - section!.height).toBeLessThan(40);
                }
                await page.screenshot({
                    path: info.outputPath(`${path.split("?")[0].slice(1)}-ko.png`),
                    animations: "disabled",
                });
            }
        });
    }
}

for (const mode of ["sidebar", "topnav", "focused"]) {
    for (const width of [390, 1440]) {
        for (const theme of ["light", "dark"] as const) {
            test(`landing capsule and footer ${mode} ${width} ${theme}`, async ({ page }, info) => {
                // Given: a localized landing in each shell, with both motion preferences covered.
                await page.setViewportSize({ width, height: 960 });
                await page.emulateMedia({
                    colorScheme: theme,
                    reducedMotion: theme === "light" ? "reduce" : "no-preference",
                });
                await page.addInitScript((value) => {
                    localStorage.setItem("blueprint_layout_preview", value);
                    localStorage.setItem("b4a_language", "ko");
                }, mode);
                await setup(page, "manager", "development");
                await page.goto("/home");
                const capsule = page.locator(".home-section-nav");
                await expect(capsule).toBeVisible();
                await expect(capsule.locator("a")).toHaveCount(4);
                if (mode !== "sidebar" && width === 1440) {
                    const navBox = await capsule.boundingBox();
                    const headerBox = await page.locator(".app-header").boundingBox();
                    expect(navBox).not.toBeNull();
                    expect(headerBox).not.toBeNull();
                    expect(navBox!.x + navBox!.width / 2).toBeCloseTo(
                        headerBox!.x + headerBox!.width / 2,
                        0,
                    );
                    // The header's one-pixel bottom border is outside its positioning box.
                    const borderBottom = await page
                        .locator(".app-header")
                        .evaluate((node) => parseFloat(getComputedStyle(node).borderBottomWidth));
                    expect(navBox!.y + navBox!.height / 2).toBeCloseTo(
                        headerBox!.y + (headerBox!.height - borderBottom) / 2,
                        1,
                    );
                    expect(navBox!.y + navBox!.height).toBeLessThanOrEqual(
                        headerBox!.y + headerBox!.height,
                    );
                    expect(await capsule.evaluate((node) => getComputedStyle(node).boxShadow)).toBe(
                        "none",
                    );
                }

                await expect(page.locator(".home-hero .home-hero__actions a")).toHaveCount(3);
                await expect(page.locator(".home-preview__chrome")).toHaveCount(0);
                await expect(
                    page.locator(".home-overview").getByRole("link", { name: "Buy Me a Coffee" }),
                ).toHaveCount(0);
                expect(
                    await page
                        .locator(".app-main")
                        .evaluate((node) => getComputedStyle(node).scrollBehavior),
                ).toBe(theme === "light" ? "auto" : "smooth");
                await expect
                    .poll(() =>
                        page
                            .locator('.home-preview__images > img[data-active="true"]')
                            .evaluate(
                                (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
                            ),
                    )
                    .toBe(true);
                await page.screenshot({
                    path: info.outputPath("landing-top.png"),
                    animations: "disabled",
                });
                // When: navigating to each section through native fragment links.
                for (const id of [
                    "home-capabilities",
                    "home-workflow",
                    "home-use-cases",
                    "home-product-preview",
                ]) {
                    await capsule.locator(`a[href$="#${id}"]`).click();
                    await expect(page).toHaveURL(new RegExp(`#${id}$`));
                    const target = page.locator(`#${id}`);
                    await expect
                        .poll(async () => {
                            const nav = await capsule.boundingBox();
                            const box = await target.boundingBox();
                            return box!.y >= nav!.y + nav!.height && box!.y < 400;
                        })
                        .toBe(true);
                    await expect(capsule).toBeInViewport();
                    if (id === "home-capabilities")
                        await page.screenshot({
                            path: info.outputPath("landing-features.png"),
                            animations: "disabled",
                        });
                }
                // Then: footer links retain permissions; keyboard navigation also reaches a section.
                await page.locator(".home-footer").scrollIntoViewIfNeeded();
                await expect(capsule).toBeInViewport();
                const footerWidth = await page
                    .locator(".home-footer")
                    .evaluate((node) => node.getBoundingClientRect().width);
                const mainWidth = await page
                    .locator(".app-main")
                    .evaluate((node) => node.clientWidth);
                expect(footerWidth).toBeCloseTo(mainWidth, 0);
                await expect(page.locator(".home-footer .home-account__link")).toHaveCount(6);
                await expect(page.locator(".home-workflow__steps > li")).toHaveCount(3);
                await expect(page.locator(".home-use-cases__grid > article")).toHaveCount(4);
                expect(
                    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
                ).toBe(true);
                await page.screenshot({
                    path: info.outputPath("landing-footer.png"),
                    animations: "disabled",
                });
                const featureLink = capsule.locator('a[href$="#home-capabilities"]');
                await featureLink.focus();
                await page.keyboard.press("Enter");
                await expect(page.locator("#home-capabilities")).toBeFocused();
            });
        }
    }
}

test("home preview rotates while hovered and pauses explicitly or for reduced motion", async ({
    page,
}) => {
    // Given: the preview is visible, with normal motion and no pointer/focus interaction.
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.clock.install();
    await setup(page, null, "production");
    await page.goto("/home");
    const image = page.locator('.home-preview__images > img[data-active="true"]');
    await expect(image).toHaveAttribute("src", /components-en.webp$/);
    await expect(page.locator("#home-product-preview")).toBeInViewport();
    await page.mouse.move(0, 0);
    // When/Then: time advances through all four previews and wraps.
    for (const preview of ["users", "server", "billing", "components"]) {
        await page.clock.runFor(6100);
        await expect(image).toHaveAttribute("src", new RegExp(`${preview}-en.webp$`));
    }
    await page.locator(".home-preview__images").hover();
    await expect(page.locator(".home-preview__controls")).toHaveAttribute("data-rotating", "true");
    await page.clock.runFor(6100);
    await expect(image).toHaveAttribute("src", /users-en.webp$/);
    // Explicit pause persists after pointer and keyboard focus leave the preview.
    await page.getByRole("button", { name: "Pause preview rotation" }).click();
    await page.locator('.home-section-nav a[href$="#home-product-preview"]').focus();
    await page.mouse.move(0, 0);
    await page.clock.runFor(7000);
    await expect(image).toHaveAttribute("src", /users-en.webp$/);
    await page.getByRole("button", { name: "Resume preview rotation" }).click();
    await page.locator('.home-section-nav a[href$="#home-product-preview"]').focus();
    await page.mouse.move(0, 0);
    await page.clock.runFor(6100);
    await expect(image).toHaveAttribute("src", /server-en.webp$/);
    // An enlarged screenshot stays stable while being read.
    await page.getByRole("button", { name: "Enlarge", exact: true }).click();
    await page.clock.runFor(7000);
    await expect(page.getByRole("dialog").locator("img")).toHaveAttribute("src", /server-en.webp$/);
    await page.keyboard.press("Escape");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator('.home-section-nav a[href$="#home-product-preview"]').focus();
    await page.mouse.move(0, 0);
    await page.clock.runFor(7000);
    await expect(image).toHaveAttribute("src", /server-en.webp$/);
    await expect(page.getByRole("button", { name: "Pause preview rotation" })).toHaveCount(0);
});
