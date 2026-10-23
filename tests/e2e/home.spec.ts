import { captureVisual } from "../fixtures/visual";
import { expect, test } from "../fixtures/browser";
import { readProjectConfig } from "../../scripts/project-config.mjs";
import { member, setup } from "../fixtures/runtime";
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
            if (width !== 1440 || colorScheme !== "light") {
                const home = await geometry();
                expect(
                    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
                ).toBe(true);
                await captureVisual(page, { path: info.outputPath("home.png"), fullPage: true });
                await page.goto("/settings?section=general");
                await expect(page.locator(".settings-content-card h1")).toBeVisible();
                expect(await geometry()).toEqual(home);
                return;
            }
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
            await expect(page.locator(".home-hero .home-eyebrow")).toHaveText(
                readProjectConfig()?.name ?? "B4A",
            );
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
            const viewer = page.getByRole("dialog", {
                name: `${readProjectConfig()?.short_name ?? "B4A"} · Billing`,
            });
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
            await captureVisual(page, {
                path: info.outputPath("home.png"),
                animations: "disabled",
                fullPage: true,
            });
            await page.locator(".home-capability").last().scrollIntoViewIfNeeded();
            await captureVisual(page, {
                path: info.outputPath("home-features.png"),
                animations: "disabled",
            });
            await page.locator('.home-account__link[href="/settings?section=general"]').click();
            await expect(page).toHaveURL(/\/settings\?section=general$/);
            await expect(page.getByRole("heading", { name: "General", exact: true })).toBeVisible();
            await expect(page.locator(".settings-row").first()).toBeVisible();
            expect(await geometry()).toEqual(home);
            await captureVisual(page, {
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
    await captureVisual(page, {
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
                await captureVisual(page, {
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
                        await captureVisual(page, {
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
                await captureVisual(page, {
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
