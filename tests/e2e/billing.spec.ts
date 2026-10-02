import { expect, test, type Page } from "@playwright/test";
const account = {
    id: 1,
    name: "Billing User",
    email: "billing@example.com",
    role: "user",
    is_verified: true,
    created_at: "2026-01-01T00:00:00Z",
    oauth_providers: [],
};
async function setup(page: Page, language = "en") {
    const stats = { configCalls: 0 };
    await page.addInitScript((lang) => {
        localStorage.setItem("b4a_language", lang);
    }, language);
    await page.route("**/config", (route) =>
        route.fulfill({
            json: {
                api_base_path: "/api/v1",
                login_enabled: false,
                frontend_base_path: "",
                email_enabled: false,
                oauth_enabled: false,
                oauth_providers: [],
                bootstrap_user: account,
                bootstrap_access_token: "billing-test-token",
            },
        }),
    );
    await page.route("**/api/v1/billing/config", (route) => {
        stats.configCalls++;
        return route.fulfill({ json: { enabled: true, livemode: false } });
    });
    await page.route("**/api/v1/billing/payment-methods?*", (route) =>
        route.fulfill({
            json: {
                items:
                    new URL(route.request().url()).searchParams.get("method_type") === "card"
                        ? [
                              {
                                  id: "pm_example",
                                  type: "card",
                                  brand: "visa",
                                  last4: "4242",
                                  exp_month: 12,
                                  exp_year: 2030,
                              },
                          ]
                        : [],
                has_more: false,
                next_cursor: null,
            },
        }),
    );
    return stats;
}
for (const width of [390, 1440])
    for (const theme of ["light", "dark"] as const) {
        test(`billing and three example plans fit ${theme} at ${width}px`, async ({
            page,
        }, info) => {
            const stats = await setup(page);
            await page.emulateMedia({ colorScheme: theme });
            await page.setViewportSize({ width, height: 1000 });
            await page.goto("/");
            await page.locator(".profile-menu__trigger").click();
            await page.getByRole("link", { name: "Upgrade plan", exact: true }).click();
            await expect(page).toHaveURL(/\/plans$/);
            await expect(page.locator(".app-sidebar")).toHaveCount(0);
            await expect(page.getByRole("button", { name: "Back to billing" })).toHaveCount(0);
            await expect(page.getByRole("button", { name: "Close plan selection" })).toBeVisible();
            expect(
                await page
                    .locator(".plans-screen")
                    .evaluate((element) => element.scrollWidth <= element.clientWidth),
            ).toBe(true);
            await expect(page.getByRole("heading", { name: "Free", exact: true })).toBeVisible();
            await expect(
                page.getByRole("button", { name: "Current plan", exact: true }),
            ).toBeDisabled();
            await expect(
                page.getByRole("button", { name: "Select Free", exact: true }),
            ).toHaveCount(0);
            await expect(page.getByRole("heading", { name: "Monthly", exact: true })).toBeVisible();
            await expect(page.getByRole("heading", { name: "Annual", exact: true })).toBeVisible();
            await expect(page.locator(".plan-card__price").nth(1)).toContainText("₩3,990");
            await page.getByRole("button", { name: "KRW ₩", exact: true }).click();
            await page.getByRole("menuitem", { name: "USD $", exact: true }).click();
            await expect(page.locator(".plan-card__price").nth(1)).toContainText("US$3.99");
            await page.getByRole("button", { name: "Select Annual", exact: true }).click();
            await expect(page.getByRole("button", { name: "Annual selected" })).toHaveAttribute(
                "aria-pressed",
                "true",
            );
            expect(
                await page.evaluate(
                    () => document.documentElement.scrollWidth <= window.innerWidth,
                ),
            ).toBe(true);
            await expect(
                page.getByRole("button", { name: "Current plan", exact: true }),
            ).toBeDisabled();
            expect(stats.configCalls).toBe(0);
            await page.screenshot({ path: info.outputPath("plans.png"), fullPage: true });
            await expect(
                page.getByRole("button", { name: "Add payment method", exact: true }),
            ).toHaveCount(0);
            await page.goto("/settings?section=billing");
            await expect(page.getByRole("heading", { name: "Billing", exact: true })).toBeVisible();
            await expect(page.getByText("VISA •••• 4242")).toBeVisible();
            await expect(page.getByText("Expires 12/2030")).toBeVisible();
            expect(
                await page.evaluate(
                    () => document.documentElement.scrollWidth <= window.innerWidth,
                ),
            ).toBe(true);
            await expect(page.locator(".settings-content-card")).toHaveCSS("opacity", "1");
            await page.screenshot({ path: info.outputPath("billing.png"), fullPage: true });
            await page.locator(".billing-plan-footer").scrollIntoViewIfNeeded();
            await page.screenshot({ path: info.outputPath("billing-methods.png"), fullPage: true });
        });
    }
test("registration opens only the hosted setup URL and verifies the return", async ({ page }) => {
    await setup(page);
    let calls = 0;
    await page.route("**/api/v1/billing/setup-sessions", (route) => {
        calls++;
        expect(route.request().headers().authorization).toBe("Bearer billing-test-token");
        expect(route.request().postDataJSON().request_id).toMatch(/^[a-f0-9-]{36}$/);
        return route.fulfill({
            status: 201,
            json: { id: "cs_test_example", url: "https://checkout.stripe.com/c/pay/example" },
        });
    });
    await page.route("https://checkout.stripe.com/**", (route) =>
        route.fulfill({ contentType: "text/html", body: "<h1>Hosted registration fixture</h1>" }),
    );
    await page.goto("/settings?section=billing");
    await page.getByRole("button", { name: "Add payment method" }).click();
    await expect(page).toHaveURL("https://checkout.stripe.com/c/pay/example");
    expect(calls).toBe(1);
    await page.route("**/api/v1/billing/setup-sessions/cs_test_example", (route) =>
        route.fulfill({ json: { id: "cs_test_example", status: "complete", registered: true } }),
    );
    await page.goto("/settings?billing_setup=cs_test_example");
    await expect(page.getByText("Your payment method registration is confirmed.")).toBeVisible();
    await expect(page.getByText("VISA •••• 4242")).toBeVisible();
});
test("disabled billing never spins forever or creates a setup session", async ({ page }) => {
    await setup(page);
    await page.route("**/api/v1/billing/config", (route) =>
        route.fulfill({ json: { enabled: false, livemode: false } }),
    );
    await page.goto("/settings?section=billing");
    await expect(
        page.getByText("Payment registration is not available yet. Please check back later."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Add payment method" })).toBeDisabled();
    await expect(page.getByText("Loading billing information…")).toHaveCount(0);
});

test("Korean pricing and settings labels remain readable on mobile", async ({ page }, info) => {
    await setup(page, "ko");
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.goto("/plans");
    await expect(page.getByRole("heading", { name: "월간", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "현재 플랜", exact: true })).toBeDisabled();
    await expect(page.locator(".plan-card__price").nth(1)).toContainText("₩3,990");
    await expect(page.getByRole("button", { name: "결제수단 등록", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "플랜 선택 닫기" }).click();
    await expect(page.getByRole("heading", { name: "결제", exact: true })).toBeVisible();
    await expect(page.locator(".settings-content-card")).toHaveCSS("opacity", "1");
    await page.locator(".billing-plan-footer").scrollIntoViewIfNeeded();
    expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: info.outputPath("billing-ko.png"), fullPage: true });
});

test("standalone plans close to their originating page and direct visits have a safe fallback", async ({
    page,
}) => {
    await setup(page);
    await page.goto("/show-case");
    await page.locator(".profile-menu__trigger").click();
    await page.getByRole("link", { name: "Upgrade plan", exact: true }).click();
    await expect(page.locator(".app-sidebar")).toHaveCount(0);
    await page.getByRole("button", { name: "KRW ₩", exact: true }).click();
    await page.getByRole("menuitem", { name: "USD $", exact: true }).click();
    await page.getByRole("button", { name: "Select Annual", exact: true }).click();
    const close = page.getByRole("button", { name: "Close plan selection" });
    await close.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/show-case$/);
    await expect(page.locator(".app-sidebar")).toBeVisible();
    await page.goto("/plans");
    await page.getByRole("button", { name: "Close plan selection" }).click();
    await expect(page).toHaveURL(/\/settings\?section=billing$/);
});
