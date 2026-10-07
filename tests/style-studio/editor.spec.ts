import { expect, test } from "../fixtures/browser";
import { readStyles } from "../../scripts/style-studio.mjs";
for (const width of [390, 1440]) {
    test(`draft, theme, reset, conflict and explicit apply at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        const initial = readStyles(process.cwd());
        let snapshot = structuredClone(initial);
        let applied = 0;
        let conflict = false;
        await page.route("**/config", (route) =>
            route.fulfill({
                json: {
                    billing_enabled: true,

                    api_base_path: "/api/v1",
                    app_mode: "development",
                    login_enabled: false,
                    email_enabled: false,
                    oauth_enabled: false,
                    oauth_providers: [],
                },
            }),
        );
        // Browser tests never write developer source. Real atomic writes have filesystem fixtures.
        await page.route("**/__b4f/style-studio/read", (route) =>
            route.fulfill({ json: snapshot }),
        );
        await page.route("**/__b4f/style-studio/apply", (route) => {
            applied++;
            if (conflict) return route.fulfill({ status: 409, json: { error: "conflict" } });
            const body = route.request().postDataJSON();
            for (const change of body.changes)
                snapshot.values[change.scope][change.key] = change.value;
            snapshot.revision = "a".repeat(64);
            return route.fulfill({ json: snapshot });
        });
        await page.goto("/show-case");
        if (width < 1100) await page.getByRole("button", { name: "Styles", exact: true }).click();
        const editor = page.getByRole("region", { name: "Style settings" });
        await expect(editor).toBeVisible();
        const collapse = editor.getByRole("button", { name: "Hide style settings" });
        await expect(collapse).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await collapse.hover();
        await expect(page.getByRole("tooltip", { name: "Hide style settings" })).toBeVisible();
        await page.mouse.move(0, 0);
        const colorField = editor.locator(".color-picker__field").first();
        const inputBox = (await colorField.locator("input").boundingBox())!;
        const swatchBox = (await colorField.locator("button").boundingBox())!;
        expect(
            Math.abs(inputBox.y + inputBox.height / 2 - swatchBox.y - swatchBox.height / 2),
        ).toBeLessThan(1);
        expect(swatchBox.x).toBeGreaterThan(inputBox.x);
        await page.screenshot({ path: test.info().outputPath("style-studio.png") });
        await editor.getByLabel("Panel background", { exact: true }).fill("#abcdef");
        await editor
            .locator("summary")
            .filter({ hasText: /^Shape$/ })
            .click();
        await editor.getByLabel("Control radius", { exact: true }).fill("0");
        await expect(
            editor.getByRole("button", { name: "Decrease Control radius", exact: true }),
        ).toBeDisabled();
        await editor.getByRole("button", { name: "Increase Control radius", exact: true }).click();
        await expect(editor.getByLabel("Control radius", { exact: true })).toHaveValue("0.125");
        await editor.getByLabel("Control radius", { exact: true }).fill("1");
        await expect(page.locator(".showcase-preview")).toHaveCSS("--panel", "#abcdef");
        expect(applied).toBe(0);
        const card = page.locator(".showcase-catalog__section-card").first();
        await expect(card).toHaveCSS("--panel", "#abcdef");
        expect(
            await editor.evaluate((element) =>
                getComputedStyle(element).getPropertyValue("--panel").trim(),
            ),
        ).not.toBe("#abcdef");
        const top = (await editor.boundingBox())!.y;
        await page.locator(".app-main").evaluate((element) => {
            element.scrollTop += 600;
        });
        expect((await editor.boundingBox())!.y).toBe(top);
        await editor
            .getByRole("button", { name: "Edit Panel background color", exact: true })
            .click();
        const palette = page.getByRole("dialog", { name: "Panel background palette" });
        await expect(palette).toBeVisible();
        await expect(palette).not.toHaveAttribute("aria-modal", "true");
        await expect(page.locator(".ui-modal__backdrop")).toHaveCount(0);
        expect(await page.locator('input[type="color"]').count()).toBe(0);
        await palette.getByRole("slider", { name: /Opacity/ }).press("Home");
        await palette.getByRole("slider", { name: /Opacity/ }).press("ArrowRight");
        await expect(editor.getByLabel("Panel background", { exact: true })).toHaveValue(
            /rgba\(.+, 0.01\)/,
        );
        await palette.getByRole("slider", { name: /Opacity/ }).press("Escape");
        if (width >= 1100)
            await expect(page.locator(".app-main")).toHaveCSS(
                "transition-property",
                "padding-right",
            );
        await editor.getByRole("button", { name: "Hide style settings" }).click();
        await expect(page.locator(".style-studio--closing")).toHaveCount(1);
        await expect(editor).toHaveCount(0);
        await expect(card).toHaveCSS("--panel", /rgba/);
        await page.getByRole("button", { name: /^Styles/ }).click();
        await editor.getByRole("button", { name: "Dark mode", exact: true }).click();
        await expect(editor.getByLabel("Panel background", { exact: true })).toHaveValue(
            initial.values.dark["--panel"],
        );
        await editor.getByLabel("Panel background", { exact: true }).fill("#123456");
        await expect(page.locator(".showcase-preview")).toHaveCSS("--panel", "#123456");
        await editor.getByRole("button", { name: "Reset preview", exact: true }).click();
        await expect(editor.getByLabel("Control radius", { exact: true })).toHaveValue(
            initial.values.shared["--radius-control"].replace(/rem$/, ""),
        );
        await editor.getByLabel("Panel background", { exact: true }).fill("#123456");
        conflict = true;
        await editor.getByRole("button", { name: "Apply to file", exact: true }).click();
        await expect(editor.getByRole("alert")).toContainText("changed outside");
        await expect(editor.getByLabel("Panel background", { exact: true })).toHaveValue("#123456");
        conflict = false;
        await editor.getByRole("button", { name: "Apply to file", exact: true }).click();
        await expect(editor.getByRole("status")).toContainText("Saved");
        expect(applied).toBe(2);
        expect(snapshot.values.dark["--panel"]).toBe("#123456");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
            true,
        );
    });
}

test("theme selector updates the whole app, persists and follows system changes", async ({
    page,
}) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.addInitScript(() => {
        if (!localStorage.getItem("blueprint4fastapi_theme"))
            localStorage.setItem("blueprint4fastapi_theme", "dark");
    });
    const snapshot = readStyles(process.cwd());
    await page.route("**/config", (route) =>
        route.fulfill({
            json: {
                billing_enabled: true,

                api_base_path: "/api/v1",
                app_mode: "development",
                login_enabled: false,
                email_enabled: false,
                oauth_enabled: false,
                oauth_providers: [],
            },
        }),
    );
    await page.route("**/__b4f/style-studio/read", (route) => route.fulfill({ json: snapshot }));
    await page.goto("/show-case");
    const editor = page.getByRole("region", { name: "Style settings" });
    const preview = page.locator(".showcase-preview");
    await expect(preview).toHaveAttribute("data-style-preview", "dark");
    const editorBackground = await editor.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
    );
    await editor.getByRole("button", { name: "Light mode", exact: true }).click();
    await expect(preview).toHaveAttribute("data-style-preview", "light");
    await expect(preview).toHaveCSS("--error-text", snapshot.preview.light["--error-text"]);
    await expect(preview).toHaveCSS("--tooltip-bg", snapshot.preview.light["--tooltip-bg"]);
    await expect(preview).toHaveCSS("color-scheme", "light");
    const previewBackground = await preview.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
    );
    await expect(page.locator(".app-main")).toHaveCSS("background-color", previewBackground);
    await expect(
        preview.locator('.brand-mark[data-brand-tone="auto"] .brand-mark__asset--light').first(),
    ).toBeVisible();
    await expect(
        preview.locator('.brand-mark[data-brand-tone="auto"] .brand-mark__asset--dark').first(),
    ).toBeHidden();
    await expect(editor.getByText("Connected file", { exact: true })).toHaveCount(0);
    await expect(
        editor.getByRole("button", { name: "Reload file (discard draft)", exact: true }),
    ).toBeVisible();
    await editor
        .locator("summary")
        .filter({ hasText: /^Typography$/ })
        .click();
    const fontField = editor.locator(".style-studio__dropdown").first();
    const labelBox = (await fontField.locator(".ui-dropdown__field-label").boundingBox())!;
    const triggerBox = (await fontField.locator(".ui-dropdown__trigger").boundingBox())!;
    expect(labelBox.y + labelBox.height).toBeLessThanOrEqual(triggerBox.y);
    expect(Math.abs(labelBox.x - triggerBox.x)).toBeLessThan(1);
    await editor.getByRole("button", { name: /^Base font family:/ }).click();
    await editor.getByRole("menuitem", { name: "System", exact: true }).click();
    await expect(editor.locator("select")).toHaveCount(0);
    expect(await editor.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(
        editorBackground,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await page.evaluate(() => localStorage.getItem("blueprint4fastapi_theme"))).toBe(
        "light",
    );
    await expect(
        preview.getByRole("button", { name: "Light mode", exact: true }).first(),
    ).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await editor.getByRole("button", { name: "System", exact: true }).click();
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(preview).toHaveAttribute("data-style-preview", "dark");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(preview).toHaveAttribute("data-style-preview", "light");
    await editor.getByRole("button", { name: "Edit Panel background color", exact: true }).click();
    const palette = page.getByRole("dialog", { name: "Panel background palette" });
    await expect(palette).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(palette).toHaveCount(0);
    await expect(editor).toBeVisible();
});
