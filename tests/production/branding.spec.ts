import { expect, test } from "../fixtures/browser";
import { readProjectConfig } from "../../scripts/project-config.mjs";

const project = readProjectConfig();
test.use({ languagePreference: null });
for (const locale of ["en", "ko"]) {
    for (const [width, colorScheme] of [
        [390, "dark"],
        [1440, "light"],
    ] as const) {
        test.describe(`public branding in ${locale} ${width} ${colorScheme}`, () => {
            test.use({ locale, colorScheme, viewport: { width, height: 844 } });
            test("renders one identity in browser title, navbar, wordmark and logo", async ({
                page,
            }) => {
                // Given: an independent build with default or project-local branding.
                let configCalls = 0;
                await page.route("**/config", (route) => {
                    configCalls++;
                    return route.fulfill({
                        json: {
                            billing_enabled: true,

                            api_base_path: "/api/v1",
                            app_mode: "development",
                            login_enabled: false,
                            email_enabled: false,
                            oauth_enabled: false,
                            oauth_providers: [],
                        },
                    });
                });
                // When: opening the public landing screen.
                await page.goto("/welcome");
                // Then: both locales share the configured identity without a branding request.
                await expect(page).toHaveTitle(project?.name ?? "Blueprint4FastAPI");
                await expect(page.locator("html")).toHaveAttribute(
                    "lang",
                    project?.default_language ?? locale,
                );
                await expect(page.locator(".public-nav__title")).toHaveText(
                    project?.name ?? "Blueprint4FastAPI",
                );
                await expect(page.locator(".brand-banner__wordmark")).toHaveText(
                    project?.short_name ?? "B4A",
                );
                await expect(page.locator(".brand-mark__asset--light").first()).toHaveAttribute(
                    "src",
                    project?.logo_url ?? "/icons/b4a-mark.svg",
                );
                await expect(page.locator('link[rel="icon"]')).toHaveJSProperty(
                    "href",
                    new URL(project?.logo_url ?? "/icons/b4a-favicon.svg", page.url()).href,
                );
                await expect(page.locator(".brand-mark__asset--dark").first()).toHaveAttribute(
                    "src",
                    project?.logo_dark_url ?? project?.logo_url ?? "/icons/b4a-mark-dark.svg",
                );
                expect(configCalls).toBe(1);
                expect(
                    await page.evaluate(
                        () => document.documentElement.scrollWidth <= window.innerWidth,
                    ),
                ).toBe(true);
                await page.goto("/show-case");
                await expect(
                    page.locator(".showcase-avatar-row .user-avatar").nth(1).locator("img"),
                ).toHaveAttribute("src", project?.logo_url ?? "/icons/b4a-mark.svg");
            });
        });
    }
}

test("production excludes the local editor and filesystem protocol", async ({ page, request }) => {
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
    const scripts: string[] = [];
    page.on("request", (req) => {
        if (req.resourceType() === "script") scripts.push(req.url());
    });
    await page.goto("/show-case");
    await expect(page.locator(".showcase-catalog")).toBeVisible();
    await expect(page.locator(".style-studio")).toHaveCount(0);
    const response = await request.post("/__b4f/style-studio/read", { data: {} });
    expect(response.headers()["content-type"] ?? "").not.toContain("application/json");
    for (const url of scripts)
        expect(await (await request.get(url)).text()).not.toContain("/__b4f/style-studio/");
});

test("sharing metadata is present before application JavaScript runs", async ({ request }) => {
    // Given/When: a crawler fetches the production HTML without running the app.
    const response = await request.get("/");
    expect(response.ok()).toBe(true);
    const html = await response.text();
    // Then: descriptive and social metadata are available in the static head.
    expect(html.indexOf("<base data-b4-app-base")).toBeGreaterThan(-1);
    expect(html.indexOf("<base data-b4-app-base")).toBeLessThan(
        html.indexOf('<script type="module"'),
    );
    expect(html).toMatch(/<meta name="description" content="[^"]+"/);
    expect(html).toMatch(/<meta property="og:title" content="[^"]+"/);
    expect(html).toContain('property="og:type" content="website"');
    expect(html).toMatch(/<meta name="twitter:card" content="summary(?:_large_image)?"/);
});

test("explicit English selection survives a project default and reload", async ({ page }) => {
    // Given: a saved English preference in either a default or configured project.
    await page.addInitScript(() => localStorage.setItem("b4a_language", "en"));
    await page.route("**/config", (route) =>
        route.fulfill({
            json: {
                api_base_path: "/api/v1",
                app_mode: "development",
                login_enabled: true,
                email_enabled: false,
                oauth_enabled: false,
                oauth_providers: [],
            },
        }),
    );
    // When: reopening the public screen.
    await page.goto("/welcome");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.reload();
    // Then: the project default never overwrites the saved selection.
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle(project?.name ?? "Blueprint4FastAPI");
});
