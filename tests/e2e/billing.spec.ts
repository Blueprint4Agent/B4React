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
                    { plan: "annual", currency: "krw", amount: 39900 },
                    { plan: "annual", currency: "usd", amount: 3999 },
                ],
            },
        }),
    );
    await page.route("**/api/v1/billing/subscription", (route) =>
        route.fulfill({ json: { plan: "free", status: "none", has_subscription: false } }),
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
            await expect(
                page.getByRole("button", { name: "Subscribe Annual", exact: true }),
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
    await expect(page.locator(".ui-toast-card")).toHaveText(
        "Your payment method registration is confirmed.",
    );
    await expect(page.locator(".billing-settings")).not.toContainText(
        "Your payment method registration is confirmed.",
    );
    await expect(page).toHaveURL(/section=billing$/);
    await expect(page.locator(".ui-toast-card")).toHaveCount(0, { timeout: 5000 });
    await page.reload();
    await expect(page.getByText("VISA •••• 4242")).toBeVisible();
    await expect(page.locator(".ui-toast-card")).toHaveCount(0);
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
    await expect(page.getByRole("button", { name: "Subscribe Annual", exact: true })).toBeEnabled();
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
    await page.getByRole("button", { name: "Subscribe Monthly", exact: true }).click();
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
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    await expect(page.locator(".ui-toast-card")).toHaveText("Payment confirmed.");
    await expect(page.locator(".billing-settings")).not.toContainText("Payment confirmed.");
    await expect(page).toHaveURL(/section=billing$/);
    await expect(page.locator(".ui-toast-card")).toHaveCount(0, { timeout: 5000 });
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    await expect(page.locator(".ui-toast-card")).toHaveCount(0);
    await page.reload();
    await expect(page.locator(".billing-plan-summary h2")).toHaveText("Monthly");
    await expect(page.locator(".ui-toast-card")).toHaveCount(0);
    await expect(page.locator(".billing-plan-summary h2")).toHaveText("Monthly");
    await page.goto("/plans");
    await expect(
        page.locator(".plan-card").nth(1).getByRole("button", { name: "Current plan" }),
    ).toBeDisabled();
    await expect(page.getByRole("button", { name: "Change to Annual" })).toBeDisabled();
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
        await page.getByRole("button", { name: "Refresh" }).click();
        await expect(page.getByText("VISA •••• 4242")).toBeVisible();
        await expect(toast).toHaveCount(0);
        await page.reload();
        await expect(page.getByText("VISA •••• 4242")).toBeVisible();
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
        await page.getByRole("button", { name: "연간으로 변경", exact: true }).click();
        await expect(page.getByRole("dialog")).toContainText(
            "오늘 추가 결제나 환불은 발생하지 않으며",
        );
        await page.screenshot({ path: info.outputPath("change-dialog.png"), fullPage: true });
        await page.getByRole("button", { name: "변경 확인", exact: true }).click();
        await expect(page.locator(".ui-toast-card")).toHaveText("요금제 변경을 예약했습니다.");
        await expect(page.getByRole("button", { name: "현재 플랜", exact: true })).toBeDisabled();
        await expect(page.getByText(/연간 적용 예정/)).toBeVisible();
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
        await expect(page.locator(".billing-plan-summary h2")).toHaveText("월간");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
            true,
        );
    });
}

test("billing profile and payment management open only the owner portal", async ({ page }) => {
    await setup(page);
    await page.route("**/api/v1/billing/portal-sessions", (route) => {
        expect(route.request().postDataJSON().flow).toBe("customer_update");
        return route.fulfill({
            json: { id: "bps_fixture", url: "https://billing.stripe.com/p/session/fixture" },
        });
    });
    await page.route("https://billing.stripe.com/**", (route) =>
        route.fulfill({ contentType: "text/html", body: "<h1>Billing portal</h1>" }),
    );
    await page.goto("/settings?section=billing");
    await page.getByRole("button", { name: "Edit", exact: true }).click();
    await expect(page).toHaveURL("https://billing.stripe.com/p/session/fixture");
});

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
            await expect(
                page.getByRole("link", { name: "Link에서 등록 카드 확인 ↗" }),
            ).toBeVisible();
            await expect(page.locator(".billing-method-group")).toHaveCount(1);
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
