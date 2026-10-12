import { expect, test } from "../fixtures/browser";

for (const locale of ["en", "ko"]) {
    const path = locale === "en" ? "/about/" : "/about/ko/";
    test.describe(`static ${locale}`, () => {
        test.use({ javaScriptEnabled: false });
        test("introduces the project and installation without JavaScript", async ({ page }) => {
            const requests: string[] = [];
            page.on("request", (request) => requests.push(request.url()));
            await page.goto(path);
            await expect(page.locator("h1")).toBeVisible();
            await expect(page.locator("#quick-start")).toContainText("make backend-dev");
            await expect(page.locator("html")).toHaveAttribute("lang", locale);
            await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
                "href",
                `https://discovery.example.test${path}`,
            );
            await page.locator("a[hreflang]").click();
            await expect(page.locator("html")).toHaveAttribute(
                "lang",
                locale === "en" ? "ko" : "en",
            );
            expect(requests.some((url) => /\/api\/|\/config|\.js(?:\?|$)/.test(url))).toBe(false);
        });
    });
    for (const width of [390, 1440])
        for (const theme of ["light", "dark"] as const) {
            test(`${locale} shares home surfaces at ${width} ${theme}`, async ({ page }, info) => {
                await page.setViewportSize({ width, height: 1000 });
                await page.emulateMedia({ colorScheme: theme });
                await page.goto(path);
                await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
                await expect(page.locator(".home-preview__figure img")).toBeVisible();
                const geometry = async () =>
                    page.evaluate(() => {
                        const hero = getComputedStyle(
                            document.querySelector(".home-hero :is(h1,h2)")!,
                        );
                        const surface = getComputedStyle(
                            document.querySelector(".home-preview__figure")!,
                        );
                        return {
                            font: hero.fontSize,
                            weight: hero.fontWeight,
                            line: hero.lineHeight,
                            border: surface.border,
                            radius: surface.borderRadius,
                            background: surface.backgroundColor,
                        };
                    });
                const publicStyle = await geometry();
                expect(
                    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
                ).toBe(true);
                await page.screenshot({
                    path: info.outputPath("public-introduction.png"),
                    fullPage: true,
                });
                await page.route("**/config", (route) =>
                    route.fulfill({
                        json: {
                            app_mode: "production",
                            login_enabled: true,
                            email_enabled: false,
                            oauth_enabled: false,
                            oauth_providers: [],
                            billing_enabled: false,
                            api_base_path: "/api/v1",
                        },
                    }),
                );
                await page.route("**/api/v1/auth/refresh", (route) =>
                    route.fulfill({
                        status: 401,
                        json: { detail: { error: "INVALID_TOKEN", message: "No session" } },
                    }),
                );
                await page.addInitScript(
                    (language) => localStorage.setItem("i18nextLng", language),
                    locale,
                );
                await page.goto("/home");
                await expect(page.locator(".home-preview__figure")).toBeVisible();
                expect(await geometry()).toEqual(publicStyle);
                const about = page.locator('a[href="/about/"], a[href="/about/ko/"]');
                await expect(about).toBeVisible();
                await about.click();
                await expect(page.locator("body")).toHaveClass("public-discovery");
            });
        }
}

test("sitemap, ownership file and app indexing policy are served as real build artifacts", async ({
    request,
}) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.headers()["content-type"]).toContain("xml");
    expect(await sitemap.text()).not.toMatch(/settings|login|profile/);
    expect(await (await request.get("/robots.txt")).text()).toContain(
        "User-agent: Claude-SearchBot",
    );
    expect(await (await request.get("/b4a-test-public-key.txt")).text()).toBe(
        "b4a-test-public-key",
    );
    expect(await (await request.get("/home")).text()).toContain('content="noindex, follow"');
});
