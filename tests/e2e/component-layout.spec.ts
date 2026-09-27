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
        // When: hovering the navbar logo in system theme.
        await page.emulateMedia({ colorScheme });
        const brand = page.locator(".app-nav__brand");
        await brand.hover();
        const tooltip = page.getByRole("tooltip");
        await expect(tooltip).toBeVisible();
        // Then: the tooltip sits next to the actual logo, not the stretched navbar column.
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
        // When: keyboard focus enters the sidebar toggle.
        const toggle = page.locator(".app-sidebar__toggle");
        await toggle.focus();
        await expect(tooltip).toBeVisible();
        const toggleBox = (await toggle.boundingBox())!;
        const sidebarTip = (await tooltip.boundingBox())!;
        expect(
            Math.abs(sidebarTip.y + sidebarTip.height / 2 - toggleBox.y - toggleBox.height / 2),
        ).toBeLessThan(1);
        await toggle.click();
        await expect(toggle).toHaveAttribute("aria-expanded", "true");
        await expect(tooltip).toHaveCount(0);
        await page.locator(".app-sidebar__item").first().hover();
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
        main.scrollTop += control.getBoundingClientRect().top - 49;
    });
    await expect(tooltip).toHaveAttribute("data-side", "bottom");
    await expect(tooltip).toBeVisible();
    await page.locator(".app-main").evaluate((main) => {
        main.scrollTop += 200;
    });
    await expect(tooltip).toBeHidden();
});

for (const width of [320, 390, 1440]) {
    test(`showcase and expanded sidebar fit at ${width}px`, async ({ page }) => {
        // When: viewing the component catalog at mobile and desktop widths.
        await page.setViewportSize({ width, height: 900 });
        // Then: catalog examples stay inside the scrolling content region.
        await expect
            .poll(() =>
                page.locator(".app-main").evaluate((main) => main.scrollWidth - main.clientWidth),
            )
            .toBeLessThanOrEqual(1);
        await page.locator(".app-sidebar__toggle").click();
        await expect(page.locator(".app-sidebar__toggle")).toHaveAttribute("aria-expanded", "true");
        await expect
            .poll(() =>
                page.locator(".app-main").evaluate((main) => main.scrollWidth - main.clientWidth),
            )
            .toBeLessThanOrEqual(1);
        await expect(page.locator(".app-nav__title")).toBeVisible();
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
    // Given: a keyboard-focused navbar control.
    const trigger = page.locator(".app-nav__brand");
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
