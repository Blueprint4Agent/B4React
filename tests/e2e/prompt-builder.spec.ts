import { expect, test, type Page } from "../fixtures/browser";

async function setup(page: Page, layout = "sidebar", language = "en") {
    await page.addInitScript((lang) => localStorage.setItem("b4a_language", lang), language);
    await page.route("**/config", (route) =>
        route.fulfill({
            json: {
                app_mode: "production",
                app_layout: layout,
                api_base_path: "/api/v1",
                frontend_base_path: "",
                login_enabled: true,
                email_enabled: false,
                oauth_enabled: false,
                billing_enabled: false,
                oauth_providers: [],
                bootstrap_user: null,
                bootstrap_access_token: null,
            },
        }),
    );
    await page.route("**/api/v1/auth/refresh", (route) =>
        route.fulfill({
            status: 401,
            json: { detail: { error: "INVALID_TOKEN", message: "No session" } },
        }),
    );
}
async function answer(page: Page, label: string, value: string) {
    await page.getByRole("textbox", { name: label, exact: true }).fill(value);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
}
async function complete(page: Page, mode: "feature" | "project") {
    await page.getByRole("button", { name: "Start with Blueprint?" }).click();
    await page
        .getByRole("button", { name: mode === "feature" ? /Add a feature/ : /Start a project/ })
        .click();
    await answer(page, "Feature name", "Resource library");
    await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeDisabled();
    for (const name of ["Backend", "Frontend", "UI design", "API", "Database"])
        await page.getByRole("button", { name, exact: true }).click();
    await expect(page.getByRole("button", { name: "Backend", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
    );
    await expect(page.getByRole("button", { name: "Frontend", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
    );
    await page.getByRole("button", { name: "Payments", exact: true }).click();
    await page.getByRole("button", { name: "Payments", exact: true }).click();
    await expect(page.getByRole("button", { name: "Payments", exact: true })).toHaveAttribute(
        "aria-pressed",
        "false",
    );
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.locator(".prompt-requirement")).toHaveText("Optional");
    await page.getByRole("button", { name: "Search & filters", exact: true }).click();
    await page
        .locator("label")
        .filter({ has: page.getByRole("checkbox", { name: "User Delete", exact: true }) })
        .click();
    await expect(
        page.getByRole("checkbox", { name: "User Delete", exact: true }),
    ).not.toBeChecked();
    await page.getByRole("checkbox", { name: "Manager Create", exact: true }).focus();
    await page.getByRole("checkbox", { name: "Manager Create", exact: true }).press("Space");
    await expect(page.getByRole("checkbox", { name: "Manager Create", exact: true })).toBeChecked();
    await page
        .getByRole("textbox", { name: "Additional requests (optional)" })
        .fill("Only search my resources");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("button", { name: "Review answers", exact: true }).click();
}

for (const mode of ["feature", "project"] as const) {
    test(`production guest completes ${mode}, edits and downloads the exact prompt`, async ({
        page,
    }, info) => {
        await setup(page);
        const mutations: string[] = [];
        page.on("request", (request) => {
            if (
                ["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) &&
                !request.url().endsWith("/auth/refresh")
            )
                mutations.push(request.url());
        });
        await page.goto("/prompt-builder");
        await complete(page, mode);
        await page.getByRole("button", { name: "Edit Feature name", exact: true }).click();
        await page.getByRole("textbox").fill("A better library");
        await page.getByRole("button", { name: "Save answer" }).click();
        await page.getByRole("button", { name: "Create my prompt" }).click();
        const output = page.getByRole("textbox", { name: "Your complete prompt" });
        const value = await output.inputValue();
        expect(value).toContain("A better library");
        expect(value).toContain("VERIFY_BASE");
        expect(value).toContain("Database: design models");
        expect(value).not.toContain("Payments: reuse billing");
        expect(value).toContain("do not merge or deploy");
        expect(value).not.toContain("promptBuilder.");
        expect(value).toContain("User: Read, Create, Edit (Own)");
        expect(value).toContain("Manager: Read, Create (All)");
        expect(value).toContain("Only search my resources");
        await page.evaluate(() =>
            Object.defineProperty(navigator, "clipboard", {
                configurable: true,
                value: {
                    writeText: async () => {
                        throw new Error("Denied");
                    },
                },
            }),
        );
        await page.getByRole("button", { name: "Copy prompt" }).click();
        await expect(page.getByText("Copy was unavailable.", { exact: false })).toBeVisible();
        await output.focus();
        expect(
            await output.evaluate(
                (element: HTMLTextAreaElement) => element.selectionEnd - element.selectionStart,
            ),
        ).toBe(value.length);
        await page.evaluate(() =>
            Object.defineProperty(navigator, "clipboard", {
                configurable: true,
                value: {
                    writeText: async (text: string) => {
                        (window as unknown as { copied: string }).copied = text;
                    },
                },
            }),
        );
        await page.getByRole("button", { name: "Copy prompt" }).click();
        expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toBe(
            value,
        );
        const downloadPromise = page.waitForEvent("download");
        await page.getByRole("button", { name: "Download Markdown" }).click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBe(`blueprint-${mode}-prompt.md`);
        const stream = await download.createReadStream();
        const chunks: Buffer[] = [];
        for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
        expect(Buffer.concat(chunks).toString("utf8")).toBe(value);
        expect(mutations).toEqual([]);
        await page.screenshot({
            path: info.outputPath("result.png"),
            fullPage: true,
            animations: "disabled",
        });
        await page.getByRole("button", { name: "New prompt", exact: true }).click();
        await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
        await expect(output).toHaveValue(value);
        await page.getByRole("button", { name: "New prompt", exact: true }).click();
        await page.getByRole("dialog").getByRole("button", { name: "New prompt" }).click();
        await expect(page.getByRole("button", { name: "Start with Blueprint?" })).toBeVisible();
    });
}

for (const width of [390, 1440])
    for (const colorScheme of ["light", "dark"] as const) {
        test(`wizard matches General shell and Korean controls ${colorScheme} ${width}`, async ({
            page,
        }, info) => {
            await setup(page, "sidebar", "ko");
            await page.setViewportSize({ width, height: 1000 });
            await page.emulateMedia({ colorScheme });
            await page.goto("/settings?section=general");
            await expect(page.locator(".settings-content-card__header")).toBeVisible();
            const peer = await page.locator(".settings-content-card").evaluate((el) => ({
                width: el.getBoundingClientRect().width,
                padding: getComputedStyle(el).padding,
                background: getComputedStyle(el).backgroundColor,
                radius: getComputedStyle(el).borderRadius,
            }));
            await page.goto("/prompt-builder");
            await expect(
                page.getByRole("button", { name: "블루프린트로 시작할까요?" }),
            ).toBeVisible();
            const actual = await page.locator(".settings-content-card").evaluate((el) => ({
                width: el.getBoundingClientRect().width,
                padding: getComputedStyle(el).padding,
                background: getComputedStyle(el).backgroundColor,
                radius: getComputedStyle(el).borderRadius,
            }));
            expect(actual).toEqual(peer);
            await page.screenshot({
                path: info.outputPath("welcome.png"),
                fullPage: true,
                animations: "disabled",
            });
            await page.getByRole("button", { name: "블루프린트로 시작할까요?" }).click();
            const widths = await page
                .locator(".prompt-path-card")
                .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
            expect(Math.abs(widths[0] - widths[1])).toBeLessThan(1);
            await page.screenshot({
                path: info.outputPath("paths.png"),
                fullPage: true,
                animations: "disabled",
            });
            await page.getByRole("button", { name: /기능 추가/ }).click();
            await expect(page.getByRole("button", { name: "다음", exact: true })).toBeDisabled();
            await page.getByRole("textbox").fill("모바일에서도 긴 이름을 편하게 작성하는 프롬프트");
            await page.getByRole("textbox").press("Tab");
            await expect(page.getByRole("button", { name: "이전", exact: true })).toBeFocused();
            await expect(page.getByRole("button", { name: "이전", exact: true })).toHaveClass(
                /ui-button--pill-secondary/,
            );
            await page.getByRole("button", { name: "다음", exact: true }).click();
            await expect(page.getByRole("heading", { name: "어디까지 만들까요?" })).toBeFocused();
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            ).toBe(true);
            await page.screenshot({
                path: info.outputPath("question.png"),
                fullPage: true,
                animations: "disabled",
            });
            await page.getByRole("button", { name: "프론트엔드", exact: true }).click();
            await page.getByRole("button", { name: "다음", exact: true }).click();
            await expect(page.getByRole("table")).toBeVisible();
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            ).toBe(true);
            await page.screenshot({
                path: info.outputPath("permissions.png"),
                fullPage: true,
                animations: "disabled",
            });
            await page.emulateMedia({ reducedMotion: "reduce" });
            expect(
                await page
                    .locator(".prompt-ambient")
                    .evaluate((el) => getComputedStyle(el, "::before").animationName),
            ).toBe("none");
            expect(
                await page
                    .locator(".prompt-scene")
                    .evaluate((el) => getComputedStyle(el).animationName),
            ).toBe("none");
        });
    }
for (const layout of ["sidebar", "topnav", "focused"])
    test(`production ${layout} navigation includes prompt builder after Home`, async ({ page }) => {
        await setup(page, layout);
        await page.goto("/home");
        if (layout === "focused") await page.locator(".app-header__toggle").click();
        const links = page.locator(
            layout === "sidebar"
                ? "nav#app-sidebar-navigation a"
                : layout === "focused"
                  ? ".app-header__menu-links a"
                  : "nav#app-sidebar-navigation a",
        );
        await expect(links).toHaveCount(2);
        // Inspect actual global destinations, independent of profile shortcuts.
        const destinations = await links.evaluateAll((elements) =>
            elements.map((el) => el.getAttribute("href")),
        );
        expect(destinations.slice(0, 2)).toEqual(["/home", "/prompt-builder"]);
        await links.nth(1).click();
        await expect(page.getByRole("button", { name: "Start with Blueprint?" })).toBeVisible();
    });

test("optional defaults and deployment target stay explicit through review edits", async ({
    page,
}) => {
    await setup(page);
    await page.goto("/prompt-builder");
    await page.getByRole("button", { name: "Start with Blueprint?" }).click();
    await page.getByRole("button", { name: /Add a feature/ }).click();
    await answer(page, "Feature name", "Booking management");
    await page.getByRole("button", { name: "Backend", exact: true }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("button", { name: "Skip", exact: true }).click();
    await page
        .getByRole("button", { name: "Deploy and verify live behavior", exact: true })
        .click();
    await expect(page.getByRole("button", { name: "Review answers", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Skip", exact: true })).toHaveCount(0);
    await page.getByRole("textbox", { name: "Deployment target (required)" }).fill("Staging");
    await page.getByRole("button", { name: "Review answers", exact: true }).click();
    await page.getByRole("button", { name: "Edit Delivery scope", exact: true }).click();
    await page
        .getByRole("button", { name: "Implementation and local checks", exact: true })
        .click();
    await page.getByRole("button", { name: "Save answer", exact: true }).click();
    await page.getByRole("button", { name: "Create my prompt", exact: true }).click();
    const value = await page.getByRole("textbox", { name: "Your complete prompt" }).inputValue();
    expect(value).not.toContain("Staging");
    expect(value).toContain("Guest: No access");
    expect(value).toContain("Clarify only essential missing requirements");
    expect(value).toContain("Do not push, create PRs, merge or deploy");
});
