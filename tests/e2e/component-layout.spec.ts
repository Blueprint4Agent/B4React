import { readProjectConfig } from "../../scripts/project-config.mjs";
import { expect, test } from "@playwright/test";

const config = {
    api_base_path: "/api/v1",
    login_enabled: false,
    frontend_base_path: "",
    email_enabled: false,
    oauth_enabled: false,
    oauth_providers: [],
    bootstrap_user: null,
    bootstrap_access_token: null,
};

test.beforeEach(async ({ page }) => {
    // Given: a standalone showcase without a running backend.
    await page.route("**/config", (route) => route.fulfill({ json: config }));
    await page.goto("/show-case");
    await expect(page.locator(".showcase-catalog")).toBeVisible();
});

for (const colorScheme of ["light", "dark"] as const) {
    test(`tooltips anchor to controls and use inverse ${colorScheme} colors`, async ({ page }) => {
        // When: hovering the sidebar logo in system theme.
        await page.emulateMedia({ colorScheme });
        const brand = page.locator(".app-sidebar__brand");
        await brand.hover();
        const tooltip = page.getByRole("tooltip");
        await expect(tooltip).toBeVisible();
        // Then: the tooltip sits next to the actual logo, not the sidebar wrapper.
        const control = (await brand.boundingBox())!;
        const tip = (await tooltip.boundingBox())!;
        expect(Math.abs(tip.x - control.x - control.width - 8)).toBeLessThan(1);
        await expect(tooltip).toHaveCSS(
            "background-color",
            colorScheme === "light" ? "rgb(16, 16, 16)" : "rgb(255, 255, 255)",
        );
        await expect(tooltip).toHaveCSS(
            "color",
            colorScheme === "light" ? "rgb(255, 255, 255)" : "rgb(16, 16, 16)",
        );
        await expect(brand).toHaveAttribute(
            "aria-describedby",
            (await tooltip.getAttribute("id"))!,
        );
        await page.keyboard.press("Escape");
        await expect(tooltip).toHaveCount(0);
        // When: keyboard focus enters the sidebar navigation.
        const toggle = page.locator(".app-sidebar__item").first();
        await toggle.focus();
        await expect(tooltip).toBeVisible();
        const toggleBox = (await toggle.boundingBox())!;
        const sidebarTip = (await tooltip.boundingBox())!;
        expect(
            Math.abs(sidebarTip.y + sidebarTip.height / 2 - toggleBox.y - toggleBox.height / 2),
        ).toBeLessThan(1);
        await toggle.click();
        await expect(toggle).toHaveAttribute("aria-current", "page");
        await expect(tooltip).toHaveCount(0);
    });
}

test("tooltip follows scrolling and flips away from the viewport edge", async ({ page }) => {
    // When: focusing the showcase tooltip, then scrolling its content container.
    const trigger = page.locator('[data-component="Tooltip"] button');
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await page.locator(".app-main").evaluate((main) => {
        main.scrollTop += 32;
    });
    // Then: the tooltip tracks the actual control, including nested scrolling.
    await expect
        .poll(async () => {
            const control = (await trigger.boundingBox())!;
            const tip = (await tooltip.boundingBox())!;
            return Math.abs(tip.y + tip.height + 8 - control.y);
        })
        .toBeLessThan(1);
    await page.locator(".app-main").evaluate((main) => {
        const control = main.querySelector('[data-component="Tooltip"] button')!;
        main.scrollTop += control.getBoundingClientRect().top - 8;
    });
    await expect(tooltip).toHaveAttribute("data-side", "bottom");
    await expect(tooltip).toBeVisible();
    await page.locator(".app-main").evaluate((main) => {
        main.scrollTop += 200;
    });
    await expect(tooltip).toBeHidden();
});

for (const width of [320, 390, 1440]) {
    test(`sidebar, profile popover, and settings fit at ${width}px`, async ({ page }) => {
        // Given: the app uses a persistent rail with no top navigation.
        await page.setViewportSize({ width, height: 900 });
        await expect(page.locator(".app-nav")).toHaveCount(0);
        await expect
            .poll(() =>
                page.locator(".app-main").evaluate((main) => main.scrollWidth - main.clientWidth),
            )
            .toBeLessThanOrEqual(1);
        const profile = page.getByRole("button", { name: "Open profile menu" });
        const profileBox = (await profile.boundingBox())!;
        expect(profileBox.y + profileBox.height).toBeGreaterThan(850);
        // When: the bottom profile popover opens.
        await profile.click();
        const popup = page.getByRole("dialog", { name: "Profile menu" });
        await expect(popup).toBeVisible();
        const box = (await popup.boundingBox())!;
        expect(box.x).toBeGreaterThan(50);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(900);
        await page.keyboard.press("Escape");
        await expect(popup).toHaveCount(0);
        await expect(profile).toBeFocused();
        // Then: navigation persists on settings, with no horizontal overflow.
        await profile.click();
        await popup.getByRole("link", { name: "Settings", exact: true }).click();
        await expect(page.locator(".settings-layout")).toBeVisible();
        await expect(page.locator('.app-sidebar__item[href="/settings"]')).toHaveCount(0);
        await expect
            .poll(() =>
                page.locator(".app-main").evaluate((main) => main.scrollWidth - main.clientWidth),
            )
            .toBeLessThanOrEqual(1);
    });
}

test("pointer focus does not keep tooltips open after re-hover", async ({ page }) => {
    // Given: a button retains focus after a pointer click.
    const trigger = page.locator('[data-component="Tooltip"] button');
    await trigger.click();
    await expect(trigger).toBeFocused();
    await page.mouse.move(1, 1);
    // When: re-hovering the still-focused button and leaving it again.
    await trigger.hover();
    await expect(page.getByRole("tooltip")).toBeVisible();
    await page.mouse.move(1, 1);
    // Then: pointer-acquired focus must not pin the tooltip open.
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await expect(trigger).toBeFocused();
});

test("keyboard tooltips survive pointer leave but dismiss on window blur", async ({ page }) => {
    // Given: a keyboard-focused sidebar control.
    const trigger = page.locator(".app-sidebar__brand");
    await page.keyboard.press("Tab");
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("tooltip")).toBeVisible();
    // When: hovering and then leaving the keyboard-focused control.
    await trigger.hover();
    await page.mouse.move(1, 200);
    // Then: keyboard focus retains its description, but an inactive window does not.
    await expect(page.getByRole("tooltip")).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("menu items keep a single icon gap and consistent touch height", async ({ page }) => {
    // Given: a rendered shared menu list in the showcase.
    const menu = page.locator('[data-component="MenuList"]');
    await menu.scrollIntoViewIfNeeded();
    // Then: each row has predictable geometry, with no compounded icon margin.
    for (const row of await menu.locator(".menu-list__item").all()) {
        const box = (await row.boundingBox())!;
        const icon = (await row.locator(".menu-list__item-icon").boundingBox())!;
        const label = (await row.locator(".menu-list__item-label").boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(32);
        expect(Math.abs(label.x - icon.x - icon.width - 8)).toBeLessThan(1);
        expect(Math.abs(icon.y + icon.height / 2 - box.y - box.height / 2)).toBeLessThan(1);
    }
});

for (const width of [320, 1440]) {
    test(`expanded sidebar shows labels and profile without overflow at ${width}px`, async ({
        page,
    }) => {
        // Given: a compact rail that can expand into a labeled navigation panel.
        await page.setViewportSize({ width, height: 900 });
        const toggle = page.locator(".app-sidebar__toggle");
        await toggle.click();
        // Then: the expanded panel is compact, and reveals real navigation labels.
        await expect(toggle).toHaveAttribute("aria-expanded", "true");
        await expect(page.locator(".app-sidebar__brand-name")).toBeVisible();
        await expect(page.locator(".app-sidebar__item-label").first()).toBeVisible();
        await expect(page.locator(".profile-menu__trigger-name")).toBeVisible();
        await expect
            .poll(async () => (await page.locator(".app-sidebar").boundingBox())!.width)
            .toBe(224);
        await page.locator(".app-sidebar__item").first().hover();
        await expect(page.getByRole("tooltip")).toHaveCount(0);
        await page.getByRole("button", { name: "Open profile menu" }).click();
        const popup = page.getByRole("dialog", { name: "Profile menu" });
        const box = (await popup.boundingBox())!;
        expect(box.x + box.width).toBeLessThanOrEqual(width);
        expect(box.y).toBeGreaterThanOrEqual(0);
        await page.keyboard.press("Escape");
        await expect(popup).toHaveCount(0);
        // When: settings uses its own navigation, returning preserves the app panel state.
        await page.getByRole("button", { name: "Open profile menu" }).click();
        await popup.getByRole("link", { name: "Settings", exact: true }).click();
        await expect(page.locator(".settings-layout")).toBeVisible();
        await expect(page.locator(".app-sidebar")).toHaveCount(1);
        await expect
            .poll(() =>
                page.locator(".app-main").evaluate((main) => main.scrollWidth - main.clientWidth),
            )
            .toBeLessThanOrEqual(1);
        await page.getByRole("link", { name: "Back to app" }).click();
        await expect(toggle).toHaveAttribute("aria-expanded", "true");
        if (width < 640) {
            await page.locator(".app-sidebar-backdrop").click({ position: { x: 220, y: 400 } });
        } else {
            await toggle.click();
        }
        await expect(toggle).toHaveAttribute("aria-expanded", "false");
    });
}

test("compact controls preserve touch targets on coarse pointers", async ({ browser }) => {
    // Given: a touch-enabled narrow viewport.
    const context = await browser.newContext({
        viewport: { width: 320, height: 800 },
        hasTouch: true,
    });
    const page = await context.newPage();
    await page.route("**/config", (route) => route.fulfill({ json: config }));
    await page.goto("/show-case");
    // Then: compact rail controls remain large enough to tap.
    const control = page.locator(".app-sidebar__item").first();
    await expect(control).toBeVisible();
    const box = (await control.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await page.getByRole("button", { name: "Open profile menu" }).tap();
    const popup = page.getByRole("dialog");
    await expect(popup).toBeVisible();
    expect((await popup.boundingBox())!.x + (await popup.boundingBox())!.width).toBeLessThanOrEqual(
        320,
    );
    await context.close();
});

test("navigation hover is cleared before opening the profile popover", async ({ page }) => {
    // Given: the pointer remains over a navigation link during a reload.
    const navigation = page.locator('.app-sidebar__item[href="/show-case"]');
    await navigation.hover();
    await page.reload();
    await expect(page.locator(".showcase-catalog")).toBeVisible();
    // When: the pointer moves to open the profile popover.
    await page.getByRole("button", { name: "Open profile menu" }).click();
    // Then: no tooltip from an old hover is left behind.
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("brand hover reveals expand control and expanded header places close on the right", async ({
    page,
}) => {
    // Given: a collapsed rail showing its brand.
    const toggle = page.locator(".app-sidebar__toggle");
    await expect(toggle.locator(".brand-mark")).toHaveCSS("opacity", "1");
    // When: hovering the brand and expanding.
    await toggle.hover();
    await expect(toggle.locator(".brand-mark")).toHaveCSS("opacity", "0");
    await expect(toggle.locator(".app-sidebar__expand-icon")).toHaveCSS("opacity", "1");
    await toggle.click();
    // Then: brand stays left and a separate close control occupies the right end.
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect
        .poll(async () => (await page.locator(".app-sidebar").boundingBox())!.width)
        .toBe(224);
    const brand = (await page.locator(".app-sidebar__brand").boundingBox())!;
    const close = (await toggle.boundingBox())!;
    expect(close.x).toBeGreaterThan(brand.x + brand.width);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

for (const colorScheme of ["light", "dark"] as const) {
    test(`sidebar expansion keeps the same ${colorScheme} surface and supports reduced motion`, async ({
        page,
    }) => {
        // Given: either appearance with the regular width transition enabled.
        await page.emulateMedia({ colorScheme });
        const sidebar = page.locator(".app-sidebar");
        const background = await sidebar.evaluate((e) => getComputedStyle(e).backgroundColor);
        await expect(sidebar).toHaveCSS("transition-duration", "0.18s");
        // When: expanding and collapsing.
        await page.locator(".app-sidebar__toggle").click();
        await expect(sidebar).toHaveCSS("background-color", background);
        await expect.poll(async () => (await sidebar.boundingBox())!.width).toBe(224);
        await page.locator(".app-sidebar__toggle").click();
        await expect(sidebar).toHaveCSS("background-color", background);
        await expect.poll(async () => (await sidebar.boundingBox())!.width).toBe(48);
        // Then: reduced-motion users get a near-instant transition.
        await page.emulateMedia({ reducedMotion: "reduce" });
        expect(
            await sidebar.evaluate((e) => parseFloat(getComputedStyle(e).transitionDuration)),
        ).toBeLessThan(0.001);
    });
}

for (const width of [320, 1440]) {
    test(`settings appearance previews persist selection at ${width}px`, async ({ page }) => {
        // Given: settings uses the same sidebar as the app.
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/settings");
        await expect(page.locator(".app-sidebar")).toHaveCount(1);
        await page.getByRole("link", { name: "Appearance", exact: true }).click();
        const selector = page.locator(".settings-content-card .theme-preview-selector");
        // When: a preview is selected, the app appearance updates and persists.
        await selector.getByRole("button", { name: "Dark mode", exact: true }).click();
        await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
        await page.reload();
        await page.getByRole("link", { name: "Appearance", exact: true }).click();
        await expect(
            selector.getByRole("button", { name: "Dark mode", exact: true }),
        ).toHaveAttribute("aria-pressed", "true");
        await selector.getByRole("button", { name: "Light mode", exact: true }).click();
        await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
        await selector.getByRole("button", { name: "System", exact: true }).click();
        await expect(page.locator("html")).not.toHaveAttribute("data-theme");
        // Then: all previews fit and return-to-app remains available.
        expect(
            await page.locator(".app-main").evaluate((e) => e.scrollWidth - e.clientWidth),
        ).toBeLessThanOrEqual(1);
        await page.getByRole("link", { name: "Back to app" }).click();
        await expect(page.locator(".app-sidebar")).toBeVisible();
    });
}

test("shared sidebar resizes, persists, and keeps settings chrome", async ({ page }) => {
    // Given: the same expanded sidebar is used in settings and the app.
    await page.goto("/settings?section=appearance");
    await page.locator(".app-sidebar__toggle").click();
    const sidebar = page.locator(".app-sidebar");
    await expect(sidebar.locator(".app-sidebar__brand-name")).toHaveText(
        readProjectConfig()?.short_name ?? "B4A",
    );
    await expect(page.getByRole("link", { name: "Back to app" })).toBeVisible();
    const separator = page.getByRole("separator", { name: "Resize sidebar" });
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBe(224);
    // When: the boundary is dragged, content follows the new width.
    const handle = (await separator.boundingBox())!;
    await page.mouse.move(handle.x + handle.width / 2, 300);
    await page.mouse.down();
    await page.mouse.move(handle.x + handle.width / 2 + 64, 300, { steps: 5 });
    await page.mouse.up();
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBe(288);
    const profile = page.getByRole("button", { name: "Open profile menu" });
    await profile.click();
    await expect(page.locator(".profile-menu__dropdown .theme-toggle-button")).toHaveCount(0);
    expect((await page.getByRole("dialog").boundingBox())!.width).toBeCloseTo(
        (await profile.boundingBox())!.width,
        0,
    );
    await page.keyboard.press("Escape");
    await page.getByRole("link", { name: "Back to app" }).click();
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBe(288);
    await page.reload();
    await page.locator(".app-sidebar__toggle").click();
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBe(288);
    // Then: keyboard resizing respects the same bounds.
    await separator.focus();
    await page.keyboard.press("End");
    await expect(separator).toHaveAttribute("aria-valuenow", "360");
    await page.keyboard.press("Home");
    await expect(separator).toHaveAttribute("aria-valuenow", "200");
});

for (const width of [320, 1440]) {
    test(`API key table and creation dialog stay compact at ${width}px`, async ({ page }) => {
        // Given: representative active, expired and disabled key records.
        await page.route("**/config", (route) =>
            route.fulfill({
                json: {
                    ...config,
                    bootstrap_user: {
                        id: 1,
                        name: "Example",
                        email: "example@example.com",
                        role: "user",
                    },
                },
            }),
        );
        await page.route("**/api/v1/api-keys", (route) =>
            route.fulfill({
                json: {
                    items: [
                        {
                            id: 1,
                            name: "Production webhook",
                            key_prefix: "b4_demo",
                            created_at: "2026-01-01T00:00:00Z",
                            expires_at: null,
                            revoked_at: null,
                            request_count: 1234,
                            last_used_at: "2026-01-02T00:00:00Z",
                        },
                        {
                            id: 2,
                            name: "Expired integration",
                            key_prefix: "b4_old",
                            created_at: "2025-01-01T00:00:00Z",
                            expires_at: "2025-02-01T00:00:00Z",
                            revoked_at: null,
                            request_count: 12,
                            last_used_at: null,
                        },
                        {
                            id: 3,
                            name: "Disabled integration",
                            key_prefix: "b4_off",
                            created_at: "2024-01-01T00:00:00Z",
                            expires_at: null,
                            revoked_at: "2025-01-01T00:00:00Z",
                            request_count: 0,
                            last_used_at: null,
                        },
                    ],
                },
            }),
        );
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/settings?section=developers");
        const table = page.getByRole("table");
        await expect(table.getByText("Production webhook")).toBeVisible();
        await expect(table.getByText("Expired", { exact: true })).toBeVisible();
        await expect(table.getByText("Inactive", { exact: true })).toBeVisible();
        await expect(table.getByRole("button", { name: "Delete Production webhook" })).toHaveCount(
            1,
        );
        // Then: only the table region scrolls horizontally on narrow screens.
        expect(
            await page.locator(".app-main").evaluate((e) => e.scrollWidth - e.clientWidth),
        ).toBeLessThanOrEqual(1);
        // When: opening creation, the compact dialog fits the viewport.
        await page.getByRole("button", { name: "Create API key", exact: true }).click();
        const panel = page.locator(".ui-modal__panel--compact");
        await expect(panel.getByLabel("API key name")).toBeVisible();
        const bounds = (await panel.boundingBox())!;
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    });
}

for (const [platform, userAgent, modifier] of [
    ["Mac", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "Meta"],
    ["Windows", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Control"],
    ["Linux", "Mozilla/5.0 (X11; Linux x86_64)", "Control"],
]) {
    test(`${platform} shortcuts show native keys and respect editable controls`, async ({
        browser,
    }) => {
        // Given: a browser with the platform's user agent.
        const context = await browser.newContext({ userAgent });
        const page = await context.newPage();
        await page.route("**/config", (route) => route.fulfill({ json: config }));
        await page.goto("/show-case");
        const brand = page.locator(".app-sidebar__brand");
        await expect(brand).toHaveAttribute("aria-keyshortcuts", `${modifier}+B`);
        await brand.hover();
        await expect(page.getByRole("tooltip").locator("kbd")).toHaveText(
            platform === "Mac" ? "⌘B" : "Ctrl+B",
        );
        // When: invoking the advertised sidebar and settings chords.
        await page.keyboard.press(`${modifier}+b`);
        await expect(page.locator(".app-sidebar")).toHaveClass(/app-sidebar--expanded/);
        await page.keyboard.press(`${modifier}+,`);
        await expect(page).toHaveURL(/\/settings/);
        await page.getByRole("link", { name: "Back to app", exact: true }).click();
        await page
            .locator(".showcase-catalog input:not([type=checkbox]):not([type=radio])")
            .first()
            .focus();
        await page.keyboard.press(`${modifier}+b`);
        // Then: typing context does not toggle the sidebar.
        await expect(page.locator(".app-sidebar")).toHaveClass(/app-sidebar--expanded/);
        await context.close();
    });
}

for (const width of [390, 1440]) {
    test(`dropdown follows its trigger at ${width}px`, async ({ page }) => {
        // Given: the settings language dropdown at mobile/desktop width.
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/settings?section=general");
        const trigger = page.locator(".ui-dropdown__trigger");
        await trigger.click();
        // Then: the menu shares both horizontal edges and a 4px vertical gap.
        const button = (await trigger.boundingBox())!;
        const menu = (await page.getByRole("menu").boundingBox())!;
        expect(Math.abs(menu.x - button.x)).toBeLessThan(1);
        expect(Math.abs(menu.width - button.width)).toBeLessThan(1);
        expect(Math.abs(menu.y - button.y - button.height - 4)).toBeLessThan(1);
        await page.getByRole("menuitem", { name: "Korean" }).click();
        await expect(trigger).toContainText("한국어");
        await expect(page.getByRole("menu")).toHaveCount(0);
    });
}
