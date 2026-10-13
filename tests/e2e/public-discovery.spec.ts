import { expect, test } from "../fixtures/browser";

test.describe("public introduction on the normal development server", () => {
    test.use({ javaScriptEnabled: false });
    for (const [path, locale] of [
        ["/about", "en"],
        ["/about/ko", "ko"],
    ]) {
        test(`serves ${locale} at ${path} without a separate preview build`, async ({
            page,
            request,
        }) => {
            // Given/When: use the same development origin as the application.
            const response = await page.goto(path);
            // Then: the actual server serves readable HTML, CSS and a noindex policy.
            expect(response?.status()).toBe(200);
            expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
            await expect(page.locator("html")).toHaveAttribute("lang", locale);
            await expect(page.locator("h1")).toBeVisible();
            await expect(page.locator("#prompt-builder a")).toHaveAttribute(
                "href",
                "/prompt-builder",
            );
            await expect(page.locator("#quick-start")).toContainText("make frontend-dev");
            await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
            const css = await request.get("/src/styles/app.css?direct");
            expect(css.headers()["content-type"]).toContain("text/css");
        });
    }
});
