import { expect, test, type Page } from "../fixtures/browser";
const account = {
    id: 1,
    name: "Billing User",
    email: "billing@example.com",
    role: "user",
    is_verified: true,
    created_at: "2026-01-01T00:00:00Z",
    oauth_providers: [],
};
async function setup(page: Page, language = "en", billingEnabled = true) {
    const stats = { configCalls: 0 };
    await page.addInitScript((lang) => {
        localStorage.setItem("b4a_language", lang);
    }, language);
    await page.route("**/config", (route) =>
        route.fulfill({
            json: {
                billing_enabled: billingEnabled,

                api_base_path: "/api/v1",
                app_mode: "development",
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
    await page.route("**/api/v1/billing/profile", (route) =>
        route.fulfill({
            json: {
                email: account.email,
                name: account.name,
                address: ["Seoul", "KR"],
                default_payment_method: "pm_example",
                portal_enabled: true,
            },
        }),
    );
    await page.route("**/api/v1/billing/invoices", (route) =>
        route.fulfill({ json: { items: [], has_more: false } }),
    );
    await page.route("**/api/v1/billing/plans", (route) =>
        route.fulfill({
            json: {
                enabled: true,
                livemode: false,
                prices: [
                    { plan: "monthly", currency: "krw", amount: 3990 },
                    { plan: "monthly", currency: "usd", amount: 399 },
                    { plan: "annual", currency: "krw", amount: 43092 },
                    { plan: "annual", currency: "usd", amount: 4309 },
                    { plan: "pro_monthly", currency: "krw", amount: 11970 },
                    { plan: "pro_monthly", currency: "usd", amount: 1197 },
                    { plan: "pro_annual", currency: "krw", amount: 129276 },
                    { plan: "pro_annual", currency: "usd", amount: 12928 },
                ],
            },
        }),
    );
    await page.route("**/api/v1/billing/subscription", (route) =>
        route.fulfill({ json: { plan: "free", status: "none", has_subscription: false } }),
    );
    await page.route("**/api/v1/billing/config", (route) => {
        stats.configCalls++;
        return route.fulfill({
            json: { enabled: true, livemode: false, publishable_key: "pk_test_fixture" },
        });
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
            await expect(page.getByRole("heading", { name: "Plus", exact: true })).toBeVisible();
            await expect(page.getByRole("heading", { name: "Pro", exact: true })).toBeVisible();
            await expect(page.locator(".plan-card__price").nth(1)).toContainText("₩3,990");
            await expect(page.getByRole("button", { name: "Won", exact: true })).toHaveAttribute(
                "aria-pressed",
                "true",
            );
            await page.getByRole("button", { name: "Dollar", exact: true }).click();
            await expect(page.getByRole("button", { name: "Dollar", exact: true })).toHaveAttribute(
                "aria-pressed",
                "true",
            );
            await expect(page.locator(".plan-card__price").nth(1)).toContainText("$3.99");
            await expect(page.locator(".plans-header p")).toHaveCount(0);
            await expect(page.locator(".plans-currency .ui-dropdown")).toHaveCount(0);
            const currencyBox = await page.locator(".plans-currency").boundingBox();
            const gridBox = await page.locator(".plans-grid").boundingBox();
            expect(currencyBox!.x + currencyBox!.width).toBeCloseTo(gridBox!.x + gridBox!.width, 0);
            await page.getByRole("button", { name: "Won", exact: true }).focus();
            await page.keyboard.press("Enter");
            await expect(page.locator(".plan-card__price").nth(1)).toContainText("₩3,990");
            await page.getByRole("button", { name: "Dollar", exact: true }).click();
            await expect(
                page.getByRole("button", { name: "Subscribe Pro", exact: true }),
            ).toBeEnabled();
            expect(
                await page.evaluate(
                    () => document.documentElement.scrollWidth <= window.innerWidth,
                ),
            ).toBe(true);
            await expect(
                page.getByRole("button", { name: "Current plan", exact: true }),
            ).toBeDisabled();
            expect(stats.configCalls).toBe(0);
            const plus = page
                .locator(".plan-card")
                .filter({ has: page.getByRole("heading", { name: "Plus", exact: true }) });
            const pro = page
                .locator(".plan-card")
                .filter({ has: page.getByRole("heading", { name: "Pro", exact: true }) });
            await plus.getByRole("button", { name: "Annual", exact: true }).click();
            await expect(plus.locator(".plan-card__billing-note")).toContainText("10%");
            await expect(plus.locator(".plan-card__billing-note")).toContainText("43.09");
            await expect(pro.getByRole("button", { name: "Monthly", exact: true })).toHaveAttribute(
                "aria-pressed",
                "true",
            );
            await pro.getByRole("button", { name: "Annual", exact: true }).click();
            await expect(pro.locator(".plan-card__billing-note")).toContainText("129.28");
            await expect(pro.locator(".plan-card__price del")).toContainText("11.97");
            await page.screenshot({
                path: info.outputPath("plans.png"),
                fullPage: true,
                animations: "disabled",
            });
            await expect(page.getByRole("button", { name: "Add new", exact: true })).toHaveCount(0);
            await page.goto("/settings?section=billing");
            await expect(page.getByRole("heading", { name: "Billing", exact: true })).toBeVisible();
            await expect(page.getByRole("heading", { name: "Visa", exact: true })).toBeVisible();
            await expect(page.getByText("•••• 4242 · Expires 12/2030")).toBeVisible();
            expect(
                await page.evaluate(
                    () => document.documentElement.scrollWidth <= window.innerWidth,
                ),
            ).toBe(true);
            await expect(page.locator(".settings-content-card")).toHaveCSS("opacity", "1");
            await page.screenshot({ path: info.outputPath("billing.png"), fullPage: true });
            await page.locator(".billing-plan-footer").scrollIntoViewIfNeeded();
            await page.screenshot({ path: info.outputPath("billing-methods.png"), fullPage: true });
            const settingsGeometry = () =>
                page.locator(".settings-content-card").evaluate((shell) => {
                    const header = shell.querySelector(".settings-content-card__header")!;
                    const row = shell.querySelector(".settings-row")!;
                    const rect = row.getBoundingClientRect();
                    const style = getComputedStyle(row);
                    return {
                        gap: rect.top - header.getBoundingClientRect().bottom,
                        width: rect.width,
                        padding: style.padding,
                        radius: style.borderRadius,
                        border: style.borderWidth,
                        background: style.background,
                    };
                });
            const billingGeometry = await settingsGeometry();
            await page.goto("/settings?section=general");
            await expect(page.locator(".settings-row").first()).toBeVisible();
            await expect(page.locator(".settings-content-card")).toHaveCSS("opacity", "1");
            expect(await settingsGeometry()).toEqual(billingGeometry);
            await page.screenshot({ path: info.outputPath("general.png"), fullPage: true });
        });
    }
test("registration opens only the hosted setup URL and verifies the return", async ({ page }) => {
    await setup(page);
    await page.route("**/api/v1/billing/setup-sessions/cs_test_example", (route) =>
        route.fulfill({ json: { id: "cs_test_example", status: "complete", registered: true } }),
    );
    await page.goto("/settings?billing_setup=cs_test_example");
    await expect(page.locator(".ui-toast-card")).toHaveText(
        "Your payment method registration is confirmed.",
    );
    await expect(page.locator(".billing-settings")).not.toContainText(
        "Your payment method registration is confirmed.",
    );
    await expect(page).toHaveURL(/section=billing$/);
    await expect(page.locator(".ui-toast-card")).toHaveCount(0, { timeout: 5000 });
    await page.reload();
    await expect(page.getByRole("heading", { name: "Visa", exact: true })).toBeVisible();
    await expect(page.locator(".ui-toast-card")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Visa", exact: true })).toBeVisible();
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
    await expect(page.getByRole("button", { name: "Add new" })).toBeDisabled();
    await expect(page.getByText("Loading billing information…")).toHaveCount(0);
});

test("Korean pricing and settings labels remain readable on mobile", async ({ page }, info) => {
    await setup(page, "ko");
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.goto("/plans");
    await expect(page.getByRole("heading", { name: "Plus", exact: true })).toBeVisible();
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
    await expect(page.getByRole("button", { name: "Won", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
    );
    await page.getByRole("button", { name: "Dollar", exact: true }).click();
    await expect(page.getByRole("button", { name: "Dollar", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
    );
    await expect(page.getByRole("button", { name: "Subscribe Pro", exact: true })).toBeEnabled();
    const close = page.getByRole("button", { name: "Close plan selection" });
    await close.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/show-case$/);
    await expect(page.locator(".app-sidebar")).toBeVisible();
    await page.goto("/plans");
    await page.getByRole("button", { name: "Close plan selection" }).click();
    await expect(page).toHaveURL(/\/settings\?section=billing$/);
});

test("a subscription checkout uses the selected server-priced plan and verifies the return", async ({
    page,
}) => {
    await setup(page);
    let received: Record<string, unknown> | undefined;
    await page.route("**/api/v1/billing/checkout-sessions", async (route) => {
        received = route.request().postDataJSON();
        await route.fulfill({
            json: {
                id: "cs_test_subscription",
                url: "https://checkout.stripe.com/c/pay/subscription",
            },
        });
    });
    await page.route("https://checkout.stripe.com/**", (route) =>
        route.fulfill({ contentType: "text/html", body: "<h1>Stripe checkout</h1>" }),
    );
    await page.goto("/plans");
    await page.getByRole("button", { name: "Subscribe Plus", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Stripe checkout" })).toBeVisible();
    expect(received).toMatchObject({ plan: "monthly", currency: "krw" });
    expect(received?.request_id).toMatch(/^[0-9a-f-]{36}$/);
    await page.route("**/api/v1/billing/checkout-sessions/cs_test_subscription", (route) =>
        route.fulfill({ json: { id: "cs_test_subscription", status: "complete", paid: false } }),
    );
    await page.goto("/settings?billing_checkout=cs_test_subscription");
    await expect(page.getByText("Payment is pending. Refresh shortly.")).toBeVisible();
    await expect(page.getByText("Payment confirmed.")).toHaveCount(0);
    await page.route("**/api/v1/billing/checkout-sessions/cs_test_subscription", (route) =>
        route.fulfill({ json: { id: "cs_test_subscription", status: "complete", paid: true } }),
    );
    await page.route("**/api/v1/billing/subscription", (route) =>
        route.fulfill({
            json: {
                plan: "monthly",
                status: "active",
                has_subscription: true,
                current_period_end: 1900000000,
            },
        }),
    );
    await page.reload();
    await expect(page.locator(".ui-toast-card")).toHaveText("Payment confirmed.");
    await expect(page.locator(".billing-settings")).not.toContainText("Payment confirmed.");
    await expect(page).toHaveURL(/section=billing$/);
    await expect(page.locator(".ui-toast-card")).toHaveCount(0, { timeout: 5000 });
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.locator(".ui-toast-card")).toHaveCount(0);
    await page.reload();
    await expect(page.locator(".billing-plan-summary h2")).toHaveText("Plus");
    await expect(page.locator(".ui-toast-card")).toHaveCount(0);
    await expect(page.locator(".billing-plan-summary h2")).toHaveText("Plus");
    await page.goto("/plans");
    await expect(
        page.locator(".plan-card").nth(1).getByRole("button", { name: "Current plan" }),
    ).toBeDisabled();
    await expect(page.getByRole("button", { name: "Change to Pro" })).toBeDisabled();
});

for (const [query, message] of [
    ["billing_checkout", "Checkout cancelled."],
    ["billing_setup", "Registration was cancelled. You can add a method whenever you are ready."],
]) {
    test(`${query} cancellation uses one transient toast and consumes the return`, async ({
        page,
    }, info) => {
        await setup(page);
        await page.goto(`/settings?${query}=cancelled&currency=usd`);
        const toast = page.locator(".ui-toast-card");
        await expect(toast).toHaveText(message);
        await expect(page.locator(".billing-settings")).not.toContainText(message);
        await expect(page).toHaveURL(/currency=usd&section=billing$/);
        await expect(page.getByRole("heading", { name: "Billing", exact: true })).toBeVisible();
        await page.screenshot({ path: info.outputPath("cancellation-toast.png") });
        await expect(toast).toHaveCount(0, { timeout: 5000 });
        await page.evaluate(() => window.dispatchEvent(new Event("focus")));
        await page.evaluate(() => window.dispatchEvent(new Event("focus")));
        await expect(page.getByRole("heading", { name: "Visa", exact: true })).toBeVisible();
        await expect(toast).toHaveCount(0);
        await page.reload();
        await expect(page.getByRole("heading", { name: "Visa", exact: true })).toBeVisible();
        await expect(toast).toHaveCount(0);
    });
}

for (const width of [390, 1440]) {
    test(`billing loading uses accessible spinners at ${width}px`, async ({ page }, info) => {
        await setup(page);
        await page.setViewportSize({ width, height: 1000 });
        let release!: () => void;
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        await page.route("**/api/v1/billing/subscription", async (route) => {
            await gate;
            await route.fulfill({
                json: { plan: "free", status: "none", has_subscription: false },
            });
        });
        await page.route("**/api/v1/billing/payment-methods?*", async (route) => {
            await gate;
            await route.fulfill({ json: { items: [], has_more: false } });
        });
        await page.goto("/settings?section=billing");
        const spinners = page.getByRole("status", {
            name: "Loading billing information…",
            exact: true,
        });
        await expect(spinners).toHaveCount(4);
        await expect(spinners.first().locator(".ui-spinner__ring")).toBeVisible();
        await expect(page.getByText("Loading billing information…", { exact: true })).toHaveCount(
            0,
        );
        await page.screenshot({ path: info.outputPath("billing-spinners.png"), fullPage: true });
        release();
        await expect(spinners).toHaveCount(0);
        await expect(page.getByRole("heading", { name: "Free", exact: true })).toBeVisible();
    });
}

test("API key loading uses the same accessible spinner", async ({ page }, info) => {
    await setup(page);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
        release = resolve;
    });
    await page.route("**/api/v1/api-keys", async (route) => {
        await gate;
        await route.fulfill({ json: { items: [] } });
    });
    await page.goto("/settings?section=developers");
    const spinner = page.locator(".developer-section__loading .ui-spinner");
    await expect(spinner).toBeVisible();
    await expect(spinner).toHaveAttribute("aria-label", /Loading/);
    await expect(spinner.locator(".ui-spinner__label")).toHaveCount(0);
    await page.screenshot({ path: info.outputPath("api-key-spinner.png") });
    release();
    await expect(spinner).toHaveCount(0);
});

test("plan catalog loading uses spinners instead of temporary unavailable prices", async ({
    page,
}) => {
    await setup(page);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
        release = resolve;
    });
    await page.route("**/api/v1/billing/plans", async (route) => {
        await gate;
        await route.fulfill({ json: { enabled: false, livemode: false, prices: [] } });
    });
    await page.goto("/plans");
    await expect(page.locator(".plan-card__price .ui-spinner")).toHaveCount(3);
    await expect(page.locator(".plan-card__price .ui-spinner__label")).toHaveCount(0);
    release();
    await expect(page.locator(".plan-card__price .ui-spinner")).toHaveCount(0);
});

for (const width of [390, 1440]) {
    test(`paid subscription changes and billing details at ${width}px`, async ({ page }, info) => {
        await setup(page, "ko");
        await page.setViewportSize({ width, height: 1000 });
        let snapshot = {
            plan: "monthly",
            status: "active",
            currency: "krw",
            has_subscription: true,
            can_manage: true,
            change_version: "a".repeat(64),
            current_period_end: 1900000000,
            cancel_at_period_end: false,
            pending_plan: null as string | null,
            pending_effective_at: null as number | null,
        };
        await page.route("**/api/v1/billing/subscription", (route) =>
            route.fulfill({ json: snapshot }),
        );
        await page.route("**/api/v1/billing/subscription/change", (route) => {
            const body = route.request().postDataJSON();
            expect(body.expected_version).toBe(snapshot.change_version);
            snapshot = {
                ...snapshot,
                pending_plan: body.plan === "keep" ? null : body.plan,
                pending_effective_at: body.plan === "keep" ? null : 1900000000,
                cancel_at_period_end: body.plan === "free",
                change_version:
                    snapshot.change_version === "a".repeat(64) ? "b".repeat(64) : "a".repeat(64),
            };
            return route.fulfill({ json: snapshot });
        });
        await page.route("**/api/v1/billing/invoices", (route) =>
            route.fulfill({
                json: {
                    items: [
                        {
                            id: "in_fixture",
                            number: "INV-001",
                            created: 1790000000,
                            status: "paid",
                            amount: 3990,
                            currency: "krw",
                            url: "https://invoice.stripe.com/i/fixture",
                        },
                    ],
                    has_more: false,
                },
            }),
        );
        await page.goto("/plans");
        await expect(page.getByRole("button", { name: "원", exact: true })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        await expect(page.getByRole("button", { name: "달러", exact: true })).toHaveText("$");
        await page.getByRole("button", { name: "달러", exact: true }).click();
        await expect(page.locator(".plan-card__price").nth(1)).toContainText("$3.99");
        await expect(page.getByRole("button", { name: "달러", exact: true })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        await expect(page.getByText("요금제 변경 시 현재 결제 통화를 유지합니다.")).toHaveCount(0);
        await page
            .locator(".plan-card")
            .filter({ has: page.getByRole("heading", { name: "Plus", exact: true }) })
            .getByRole("button", { name: "연간", exact: true })
            .click();
        await page.getByRole("button", { name: "Plus으로 변경", exact: true }).click();
        await expect(page.getByRole("dialog")).toContainText(
            "오늘 추가 결제나 환불은 발생하지 않으며",
        );
        await expect(page.getByRole("dialog")).toContainText("₩43,092");
        await expect(page.getByRole("dialog")).not.toContainText("US$39.99");
        await page.screenshot({ path: info.outputPath("change-dialog.png"), fullPage: true });
        await page.getByRole("button", { name: "변경 확인", exact: true }).click();
        await expect(page.locator(".ui-toast-card")).toHaveText("요금제 변경을 예약했습니다.");
        await expect(
            page.getByRole("button", { name: "Plus으로 변경", exact: true }),
        ).toBeDisabled();
        await expect(page.getByText(/연간 적용 예정/)).toHaveCount(0);
        await page.goto("/settings?section=billing");
        await expect(page.getByText("INV-001")).toBeVisible();
        await expect(page.getByText("결제 완료", { exact: true })).toBeVisible();
        await expect(page.getByText("기본", { exact: true })).toBeVisible();
        await expect(page.getByText("Seoul, KR")).toBeVisible();
        await page.screenshot({ path: info.outputPath("billing-details.png"), fullPage: true });
        await page.getByRole("button", { name: "현재 플랜 유지", exact: true }).click();
        await page.getByRole("button", { name: "변경 확인", exact: true }).click();
        await expect(page.locator(".ui-toast-card")).toHaveText("현재 요금제를 유지합니다.");
        await page.getByRole("button", { name: "구독 취소", exact: true }).click();
        await page.getByRole("button", { name: "변경 확인", exact: true }).click();
        await expect(page.getByText(/Free 적용 예정/)).toBeVisible();
        await expect(page.locator(".billing-plan-summary h2")).toHaveText("Plus");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
            true,
        );
    });
}

for (const width of [390, 1440]) {
    for (const theme of ["light", "dark"] as const) {
        test(`Link-only billing uses settings danger actions ${theme} at ${width}px`, async ({
            page,
        }, info) => {
            await setup(page, "ko");
            await page.setViewportSize({ width, height: 1000 });
            await page.emulateMedia({ colorScheme: theme });
            await page.route("**/api/v1/billing/subscription", (route) =>
                route.fulfill({
                    json: {
                        plan: "monthly",
                        status: "active",
                        currency: "krw",
                        has_subscription: true,
                        can_manage: true,
                        change_version: "a".repeat(64),
                        current_period_end: 1900000000,
                        cancel_at_period_end: false,
                        pending_plan: null,
                        pending_effective_at: null,
                    },
                }),
            );
            await page.route("**/api/v1/billing/payment-methods?*", (route) =>
                route.fulfill({
                    json: {
                        items:
                            new URL(route.request().url()).searchParams.get("method_type") ===
                            "link"
                                ? [{ id: "pm_example", type: "link" }]
                                : [],
                        has_more: false,
                    },
                }),
            );
            await page.goto("/settings?section=billing");
            await expect(page.getByText("Link 지갑", { exact: true })).toBeVisible();
            await expect(page.locator(".billing-method-group")).toHaveCount(1);
            await page.getByRole("button", { name: "결제수단 관리" }).click();
            const remove = page.getByRole("menuitem", { name: "삭제", exact: true });
            await expect(remove).toBeVisible();
            const menuGeometry = await remove.evaluate((element) => {
                const range = document.createRange();
                range.selectNodeContents(element.lastElementChild!);
                const menu = element.parentElement!.getBoundingClientRect();
                return {
                    lines: range.getClientRects().length,
                    left: menu.left,
                    right: menu.right,
                    width: menu.width,
                };
            });
            expect(menuGeometry.lines).toBe(1);
            expect(menuGeometry.width).toBeGreaterThanOrEqual(160);
            expect(menuGeometry.left).toBeGreaterThanOrEqual(0);
            expect(menuGeometry.right).toBeLessThanOrEqual(width);
            await page.screenshot({
                path: info.outputPath("billing-method-menu.png"),
                fullPage: true,
            });
            await page.keyboard.press("Escape");
            const row = page.locator(".settings-account-delete");
            await expect(row.getByRole("button", { name: "구독 취소" })).toHaveClass(
                /modal-button--danger/,
            );
            const mark = page.locator(".billing-stripe-badge img:visible");
            await expect(mark).toHaveCount(1);
            expect(
                await mark.evaluate(
                    (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
                ),
            ).toBe(true);
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            ).toBe(true);
            await page.screenshot({
                path: info.outputPath("billing-provider-style.png"),
                fullPage: true,
            });
            await row.getByRole("button", { name: "구독 취소" }).click();
            await expect(
                page.getByRole("dialog").getByRole("button", { name: "변경 확인" }),
            ).toHaveClass(/modal-button--danger/);
            await page.screenshot({
                path: info.outputPath("billing-cancel-style.png"),
                fullPage: true,
            });
        });
    }
}

for (const width of [390, 1440]) {
    for (const theme of ["light", "dark"] as const) {
        test(`billing isolates concurrent section errors and recovers ${theme} at ${width}px`, async ({
            page,
        }, info) => {
            await setup(page, "ko");
            await page.setViewportSize({ width, height: 1000 });
            await page.emulateMedia({ colorScheme: theme });
            let failing = true;
            for (const path of ["subscription", "profile"]) {
                await page.route(`**/api/v1/billing/${path}`, (route) =>
                    failing
                        ? route.fulfill({ status: 500, json: { detail: "provider failure" } })
                        : route.fallback(),
                );
            }
            await page.goto("/settings?section=billing");
            await expect(page.getByRole("button", { name: "다시 시도" }).first()).toBeEnabled();
            await expect(page.locator(".billing-feedback [role=alert]")).toHaveCount(1);
            await expect(page.getByRole("alert")).toHaveCount(2);
            await expect(page.getByRole("alert").first()).toContainText(
                "결제 정보를 처리하지 못했습니다",
            );
            const alert = page.locator(".billing-feedback [role=alert]");
            const retry = alert.getByRole("button", { name: "다시 시도" });
            await expect(retry).toBeVisible();
            const alertBox = (await alert.boundingBox())!;
            const retryBox = (await retry.boundingBox())!;
            const planBox = (await page.locator(".billing-plan-summary").boundingBox())!;
            expect(alertBox.y + alertBox.height).toBeLessThanOrEqual(planBox.y);
            expect(retryBox.x).toBeGreaterThanOrEqual(alertBox.x);
            expect(retryBox.x + retryBox.width).toBeLessThanOrEqual(alertBox.x + alertBox.width);
            expect(retryBox.y + retryBox.height).toBeLessThanOrEqual(alertBox.y + alertBox.height);
            await page.screenshot({ path: info.outputPath("billing-error.png"), fullPage: true });
            failing = false;
            await page.getByRole("button", { name: "다시 시도" }).first().click();
            await expect(page.getByRole("alert")).toHaveCount(0);
            await expect(page.getByRole("heading", { name: "Visa", exact: true })).toBeVisible();
        });
    }
}

for (const width of [390, 1440]) {
    test(`manual billing profile fallback and saved card management at ${width}px`, async ({
        page,
    }, info) => {
        await setup(page, "ko");
        await page.setViewportSize({ width, height: 1000 });
        await page.route("**/api/v1/billing/config", (route) =>
            route.fulfill({ json: { enabled: true, livemode: false, publishable_key: null } }),
        );
        let profile = {
            email: "billing@example.com",
            name: "Billing User",
            address: ["Seoul", "KR"],
            address_fields: {
                country: "KR",
                city: "Seoul",
                state: "",
                line1: "Street",
                line2: "Unit",
                postal_code: "06943",
            },
            default_payment_method: "pm_other",
            portal_enabled: true,
        };
        let removed = false;
        await page.route("**/api/v1/billing/profile", (route) => {
            if (route.request().method() === "PUT") {
                const body = route.request().postDataJSON();
                expect(body.request_id).toMatch(/^[a-f0-9-]{36}$/);
                profile = {
                    ...profile,
                    ...body,
                    address: [body.address.line1, body.address.country],
                    address_fields: body.address,
                };
            }
            return route.fulfill({ json: profile });
        });
        await page.route("**/api/v1/billing/payment-methods?*", (route) =>
            route.fulfill({
                json: {
                    items:
                        !removed &&
                        new URL(route.request().url()).searchParams.get("method_type") === "card"
                            ? [
                                  {
                                      id: "pm_example",
                                      type: "card",
                                      brand: "mastercard",
                                      last4: "3114",
                                      exp_month: 12,
                                      exp_year: 2030,
                                  },
                              ]
                            : [],
                    has_more: false,
                },
            }),
        );
        await page.route("**/api/v1/billing/payment-methods/pm_example", (route) => {
            const body = route.request().postDataJSON();
            if (body.action === "default") profile.default_payment_method = "pm_example";
            else removed = true;
            return route.fulfill({ json: profile });
        });
        await page.goto("/settings?section=billing");
        await expect(page.getByRole("button", { name: "다시 불러오기" })).toHaveCount(0);
        await expect(page.getByRole("heading", { name: "Mastercard" })).toBeVisible();
        await expect(page.getByText(/•••• 3114/)).toBeVisible();
        const historyHeader = page
            .getByRole("heading", { name: "거래 내역", exact: true })
            .locator("..");
        const viewAll = historyHeader.getByRole("button", { name: "모두 보기", exact: true });
        await expect(viewAll).toHaveClass(/ui-button--text/);
        const titleBox = (await historyHeader.getByRole("heading").boundingBox())!;
        const actionBox = (await viewAll.boundingBox())!;
        expect(actionBox.x - titleBox.x - titleBox.width).toBeLessThanOrEqual(16);
        expect(
            Math.abs(actionBox.y + actionBox.height / 2 - titleBox.y - titleBox.height / 2),
        ).toBeLessThanOrEqual(2);
        await page.getByRole("button", { name: "편집", exact: true }).click();
        const dialog = page.getByRole("dialog");
        await expect(dialog.getByLabel("결제 이메일")).toHaveValue("billing@example.com");
        await expect(dialog.getByLabel("주소란 2")).toHaveValue("Unit");
        await dialog.getByLabel("이름", { exact: true }).fill("New Billing Name");
        await page.screenshot({ path: info.outputPath("profile-dialog.png"), fullPage: true });
        await dialog.getByRole("button", { name: "저장", exact: true }).click();
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(page.getByText("New Billing Name", { exact: true })).toBeVisible();
        await expect(page).toHaveURL(/settings\?section=billing/);
        await page.getByRole("button", { name: "결제수단 관리" }).click();
        await page.getByRole("menuitem", { name: "기본 결제수단으로 설정" }).click();
        await expect(page.getByText("기본", { exact: true })).toBeVisible();
        await page.getByRole("button", { name: "결제수단 관리" }).click();
        await page.getByRole("menuitem", { name: "삭제", exact: true }).click();
        await page.getByRole("dialog").getByRole("button", { name: "삭제", exact: true }).click();
        await expect(page.getByRole("heading", { name: "Mastercard" })).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
            true,
        );
    });
}

for (const registered of [true, false]) {
    test(`embedded card return verifies server status registered=${registered}`, async ({
        page,
    }) => {
        await setup(page, "ko");
        await page.route("**/api/v1/billing/card-setups/seti_example", (route) =>
            route.fulfill({ json: { registered } }),
        );
        await page.goto(
            "/settings?billing_card_setup=seti_example&setup_intent_client_secret=fixture_secret&redirect_status=succeeded&keep=value",
        );
        await expect(page).not.toHaveURL(/setup_intent_client_secret|redirect_status/);
        if (registered) {
            await expect(page.locator(".ui-toast-layer")).toContainText(
                "결제수단 등록을 확인했습니다.",
            );
            await expect(page).not.toHaveURL(/billing_card_setup/);
        } else {
            await expect(page).toHaveURL(/billing_card_setup=seti_example/);
            await expect(
                page.getByText("결제수단 등록을 확인했습니다.", { exact: true }),
            ).toHaveCount(0);
        }
        await expect(page).toHaveURL(/keep=value/);
    });
}

for (const width of [390, 1440]) {
    for (const theme of ["light", "dark"] as const) {
        test(`country list scrolls ${theme} at ${width}px`, async ({ page }, info) => {
            await setup(page, "ko");
            await page.route("**/api/v1/billing/config", (route) =>
                route.fulfill({ json: { enabled: true, livemode: false, publishable_key: null } }),
            );
            await page.setViewportSize({ width, height: 900 });
            await page.emulateMedia({ colorScheme: theme });
            await page.route("**/api/v1/billing/profile", (route) =>
                route.fulfill({
                    json: {
                        email: "billing@example.com",
                        name: "Billing User",
                        address: [],
                        address_fields: {
                            country: "KR",
                            city: "",
                            state: "",
                            line1: "",
                            line2: "",
                            postal_code: "",
                        },
                        default_payment_method: null,
                        portal_enabled: true,
                    },
                }),
            );
            await page.goto("/settings?section=billing");
            await page.getByRole("button", { name: "편집", exact: true }).click();
            const dialog = page.getByRole("dialog");
            await dialog.getByRole("button", { name: "대한민국", exact: true }).click();
            const menu = page.getByRole("menu", { name: "국가 또는 지역", exact: true });
            await expect(menu).toBeVisible();
            await menu.hover();
            await page.mouse.wheel(0, 600);
            await expect.poll(() => menu.evaluate((el) => el.scrollTop)).toBeGreaterThan(100);
            const position = await menu.evaluate((el) => el.scrollTop);
            await page.setViewportSize({ width, height: 790 });
            await expect
                .poll(() => menu.evaluate((el) => el.getBoundingClientRect().bottom))
                .toBeLessThanOrEqual(782);
            await expect
                .poll(() => menu.evaluate((el) => el.scrollTop))
                .toBeGreaterThanOrEqual(position - 1);
            await menu.evaluate((el) => {
                el.scrollTop = el.scrollHeight;
            });
            const last = menu.getByRole("menuitem").last();
            await expect(last).toBeVisible();
            const label = (await last.textContent())!;
            const bounds = (await menu.boundingBox())!;
            expect(bounds.y).toBeGreaterThanOrEqual(8);
            expect(bounds.y + bounds.height).toBeLessThanOrEqual(782);
            await page.screenshot({
                path: info.outputPath("country-menu-bottom.png"),
                fullPage: true,
            });
            await last.click();
            await expect(menu).toHaveCount(0);
            await expect(dialog.getByRole("button", { name: label, exact: true })).toBeFocused();
        });
    }
}

for (const [plan, tier] of [
    ["free", "Free"],
    ["monthly", "Plus"],
    ["annual", "Plus"],
    ["pro_monthly", "Pro"],
    ["pro_annual", "Pro"],
]) {
    test(`sidebar displays server-confirmed ${plan} as ${tier}`, async ({ page }) => {
        await setup(page);
        await page.route("**/api/v1/billing/subscription", (route) =>
            route.fulfill({
                json: {
                    plan,
                    status: plan === "free" ? "none" : "active",
                    has_subscription: plan !== "free",
                },
            }),
        );
        await page.goto("/home");
        await expect(
            page.getByLabel(`Current subscription: ${tier}`, { exact: true }),
        ).toBeVisible();
        const badge = page.locator(".profile-menu__tier");
        await expect(badge).toHaveCSS("width", "16px");
        await expect(badge).toHaveCSS("height", "16px");
        await expect(badge).toHaveCSS("padding", "0px");
        await expect(badge).toHaveCSS("align-items", "center");
        await expect(badge).toHaveCSS("justify-content", "center");
        await page.locator(".profile-menu__trigger").click();
        await expect(page.locator(".profile-menu__tier-label")).toHaveText(tier);
    });
}

test("unknown subscription does not invent a Free profile badge", async ({ page }) => {
    await setup(page);
    await page.route("**/api/v1/billing/subscription", (route) =>
        route.fulfill({ json: { plan: "unknown", status: "active", has_subscription: true } }),
    );
    await page.goto("/home");
    await expect(page.locator(".profile-menu__trigger")).toBeVisible();
    await expect(page.locator(".profile-menu__tier")).toHaveCount(0);
});

for (const pending of [false, true]) {
    test(`upgrade ${pending ? "awaits payment without changing tier" : "applies immediately after payment"}`, async ({
        page,
    }) => {
        await setup(page);
        let snapshot = {
            plan: "monthly",
            status: "active",
            currency: "krw",
            has_subscription: true,
            can_manage: true,
            change_version: "a".repeat(64),
            current_period_end: 1900000000,
            payment_required: false,
            payment_url: null as string | null,
        };
        await page.route("**/api/v1/billing/subscription", (route) =>
            route.fulfill({ json: snapshot }),
        );
        await page.route("**/api/v1/billing/subscription/change", async (route) => {
            expect(route.request().postDataJSON().plan).toBe("pro_monthly");
            snapshot = {
                ...snapshot,
                plan: pending ? "monthly" : "pro_monthly",
                payment_required: pending,
                can_manage: !pending,
                payment_url: pending ? "https://invoice.stripe.com/i/fixture" : null,
            };
            await route.fulfill({ json: snapshot });
        });
        await page.goto("/plans");
        await page.getByRole("button", { name: "Change to Pro", exact: true }).click();
        await expect(page.getByRole("dialog")).toContainText("immediately after payment");
        await page.getByRole("button", { name: "Confirm change", exact: true }).click();
        if (pending) {
            await expect(
                page.getByRole("button", { name: "Complete payment", exact: true }),
            ).toBeVisible();
            await expect(page.locator(".ui-toast-card")).toHaveCount(0);
        } else
            await expect(page.locator(".ui-toast-card")).toHaveText("Your plan has been upgraded.");
        await page.goto("/home");
        await expect(
            page.getByLabel(`Current subscription: ${pending ? "Plus" : "Pro"}`, { exact: true }),
        ).toBeVisible();
        if (pending) {
            snapshot = {
                ...snapshot,
                plan: "pro_monthly",
                can_manage: true,
                payment_required: false,
                payment_url: null,
            };
            await page.reload();
            await expect(
                page.getByLabel("Current subscription: Pro", { exact: true }),
            ).toBeVisible();
        }
    });
}

for (const width of [390, 1440])
    for (const theme of ["light", "dark"] as const) {
        test(`profile tier typography ${theme} at ${width}px`, async ({ page }, info) => {
            await setup(page, "ko");
            await page.setViewportSize({ width, height: 900 });
            await page.emulateMedia({ colorScheme: theme });
            await page.route("**/api/v1/billing/subscription", (route) =>
                route.fulfill({
                    json: { plan: "pro_annual", status: "active", has_subscription: true },
                }),
            );
            await page.goto("/home");
            await expect(page.getByLabel("현재 구독: Pro", { exact: true })).toBeVisible();
            await page.locator(".profile-menu__trigger").click();
            const tier = page.locator(".profile-menu__tier-label");
            await expect(tier).toHaveText("Pro");
            expect(
                Number(await tier.evaluate((el) => getComputedStyle(el).fontWeight)),
            ).toBeGreaterThanOrEqual(700);
            const labelBox = await tier.boundingBox();
            const emailBox = await page.locator(".profile-menu__email").boundingBox();
            expect(labelBox!.y + labelBox!.height).toBeLessThanOrEqual(emailBox!.y + 1);
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            ).toBe(true);
            await page.screenshot({
                path: info.outputPath("profile-tier.png"),
                animations: "disabled",
            });
        });
    }

for (const width of [390, 1440]) {
    test(`disabled billing hides navigation and direct routes without requests at ${width}`, async ({
        page,
    }) => {
        await page.setViewportSize({ width, height: 900 });
        await setup(page, "en", false);
        const requests: string[] = [];
        page.on("request", (request) => {
            if (request.url().includes("/api/v1/billing/")) requests.push(request.url());
        });
        await page.goto("/home");
        await expect(page.locator('a[href*="section=billing"]')).toHaveCount(0);
        await page.locator(".profile-menu__trigger").click();
        await expect(page.locator('a[href="/plans"]')).toHaveCount(0);
        await expect(page.locator(".profile-menu__tier")).toHaveCount(0);
        await page.goto("/settings?section=billing&billing_setup=cs_fixture");
        await expect(page.locator(".settings-general-content")).toBeVisible();
        await expect(page.locator(".billing-settings")).toHaveCount(0);
        await expect(page.locator('a[href*="section=billing"]')).toHaveCount(0);
        await page.goto("/plans");
        await expect(page).toHaveURL(/\/home$/);
        await page.evaluate(() => {
            window.dispatchEvent(new Event("focus"));
            window.dispatchEvent(new Event("online"));
        });
        expect(requests).toEqual([]);
    });
}

for (const width of [390, 1440]) {
    test(`invoice history stays in a paginated dialog at ${width}px`, async ({ page }, info) => {
        await setup(page);
        await page.setViewportSize({ width, height: 900 });
        const invoice = {
            id: "in_one",
            number: "INV-1",
            created: 1790000000,
            status: "paid",
            amount: 3990,
            currency: "krw",
            url: "https://invoice.stripe.com/i/fixture",
        };
        await page.route("**/api/v1/billing/invoices?*", (route) =>
            route.fulfill({ json: { items: [invoice], has_more: false, next_cursor: null } }),
        );
        await page.route("**/api/v1/billing/invoices/in_one", (route) =>
            route.fulfill({
                json: {
                    ...invoice,
                    subtotal: 3990,
                    total: 3990,
                    amount_paid: 3990,
                    amount_due: 0,
                    pdf_url: null,
                    lines: [{ description: "Plus subscription", amount: 3990, quantity: 1 }],
                    lines_has_more: false,
                },
            }),
        );
        await page.goto("/settings?section=billing");
        await page.getByRole("button", { name: "View all" }).click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toContainText("INV-1");
        await dialog.getByRole("button", { name: "Invoice details" }).hover();
        await expect(page.getByRole("tooltip")).toContainText("Invoice details");
        await dialog.getByRole("button", { name: "Invoice details" }).click();
        await expect(dialog).toContainText("Plus subscription");
        await expect(page).toHaveURL(/settings\?section=billing/);
        const box = (await dialog.boundingBox())!;
        expect(box.width).toBeLessThanOrEqual(width);
        await page.screenshot({ path: info.outputPath("invoice-details.png"), fullPage: true });
        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
    });
}

test("expired bootstrap subscription token reloads config instead of repeating unauthorized requests", async ({
    page,
}) => {
    await setup(page);
    let configCalls = 0;
    let denied = 0;
    await page.route("**/config", (route) => {
        configCalls += 1;
        return route.fulfill({
            json: {
                billing_enabled: true,
                api_base_path: "/api/v1",
                app_mode: "development",
                login_enabled: false,
                frontend_base_path: "",
                email_enabled: false,
                oauth_enabled: false,
                oauth_providers: [],
                bootstrap_user: account,
                bootstrap_access_token:
                    configCalls === 1 ? "expired-test-token" : "renewed-test-token",
            },
        });
    });
    await page.route("**/api/v1/billing/subscription", (route) => {
        if (route.request().headers().authorization !== "Bearer renewed-test-token") {
            denied += 1;
            return route.fulfill({
                status: 401,
                json: { detail: { error: "INVALID_TOKEN", message: "Expired" } },
            });
        }
        return route.fulfill({
            json: { plan: "monthly", status: "active", has_subscription: true },
        });
    });
    await page.goto("/home");
    await expect(page.getByLabel("Current subscription: Plus", { exact: true })).toBeVisible();
    expect(configCalls).toBe(2);
    const initialDenied = denied;
    expect(initialDenied).toBeGreaterThan(0);
    for (let i = 0; i < 5; i++) await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.getByLabel("Current subscription: Plus", { exact: true })).toBeVisible();
    expect(denied).toBe(initialDenied);
    expect(configCalls).toBe(2);
});

for (const canRefresh of [true, false]) {
    test(`expired login subscription ${canRefresh ? "renews" : "stops after refresh failure"}`, async ({
        page,
    }) => {
        await setup(page);
        let refreshes = 0;
        let denied = 0;
        await page.route("**/config", (route) =>
            route.fulfill({
                json: {
                    billing_enabled: true,
                    api_base_path: "/api/v1",
                    app_mode: "development",
                    login_enabled: true,
                    frontend_base_path: "",
                    email_enabled: false,
                    oauth_enabled: false,
                    oauth_providers: [],
                },
            }),
        );
        await page.route("**/api/v1/auth/refresh", (route) => {
            refreshes += 1;
            if (refreshes > 1 && !canRefresh)
                return route.fulfill({ status: 401, json: { detail: { error: "INVALID_TOKEN" } } });
            return route.fulfill({
                json: {
                    access_token: refreshes === 1 ? "login-expired" : "login-renewed",
                    token_type: "bearer",
                },
            });
        });
        await page.route("**/api/v1/auth/me", (route) => route.fulfill({ json: account }));
        await page.route("**/api/v1/billing/subscription", (route) => {
            if (route.request().headers().authorization !== "Bearer login-renewed") {
                denied += 1;
                return route.fulfill({ status: 401, json: { detail: { error: "INVALID_TOKEN" } } });
            }
            return route.fulfill({
                json: { plan: "monthly", status: "active", has_subscription: true },
            });
        });
        await page.goto("/home");
        await expect.poll(() => refreshes).toBe(2);
        if (canRefresh)
            await expect(
                page.getByLabel("Current subscription: Plus", { exact: true }),
            ).toBeVisible();
        else
            await expect(page.locator(".profile-menu__trigger")).toHaveAttribute(
                "title",
                "Log in / Sign up",
            );
        const initialDenied = denied;
        for (let i = 0; i < 5; i++)
            await page.evaluate(() => window.dispatchEvent(new Event("focus")));
        expect(denied).toBe(initialDenied);
        expect(refreshes).toBe(2);
    });
}
