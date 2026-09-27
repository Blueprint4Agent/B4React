import { expect, test } from "@playwright/test";
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
                    api_base_path: "/api/v1",
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
        const editor = page.getByRole("region", { name: "Common styles · local preview" });
        await expect(editor).toBeVisible();
        await page.screenshot({ path: test.info().outputPath("style-studio.png") });
        await editor.getByLabel("Panel background", { exact: true }).fill("#abcdef");
        await editor.getByLabel("Control radius", { exact: true }).fill("1rem");
        await expect(page.locator(".showcase-catalog")).toHaveCSS("--panel", "#abcdef");
        expect(applied).toBe(0);
        await editor.getByRole("button", { name: "Dark preview", exact: true }).click();
        await expect(editor.getByLabel("Panel background", { exact: true })).toHaveValue(
            initial.values.dark["--panel"],
        );
        await editor.getByLabel("Panel background", { exact: true }).fill("#123456");
        await expect(page.locator(".showcase-catalog")).toHaveCSS("--panel", "#123456");
        await editor.getByRole("button", { name: "Discard preview", exact: true }).click();
        await expect(editor.getByLabel("Control radius", { exact: true })).toHaveValue(
            initial.values.shared["--radius-control"],
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
