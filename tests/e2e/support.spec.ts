import { expect, test, type Page } from "../fixtures/browser";
async function setup(page: Page, admin: boolean) {
    const row = {
        id: 1,
        subject: "Plan question",
        status: "open",
        created_at: "2026-10-12T10:00:00Z",
        updated_at: "2026-10-12T10:00:00Z",
        requester_name: "Reader",
        requester_email: "reader@example.com",
        messages: [
            {
                id: 1,
                author_role: "user",
                body: "Please review my plan.",
                created_at: "2026-10-12T10:00:00Z",
            },
        ],
    };
    const state = { rows: admin ? [row] : ([] as (typeof row)[]), fail: false };
    await page.route("**/config", (route) =>
        route.fulfill({
            json: {
                api_base_path: "/api/v1",
                app_mode: "development",
                login_enabled: false,
                frontend_base_path: "",
                email_enabled: false,
                oauth_enabled: false,
                oauth_providers: [],
                billing_enabled: false,
                bootstrap_access_token: "support-test",
                bootstrap_user: {
                    id: admin ? 2 : 1,
                    role: admin ? "admin" : "user",
                    name: "Reader",
                    email: "reader@example.com",
                    is_verified: true,
                    created_at: row.created_at,
                    oauth_providers: [],
                },
            },
        }),
    );
    await page.route("**/api/v1/inquiries**", async (route) => {
        const request = route.request();
        const path = new URL(request.url()).pathname;
        if (request.method() === "GET") {
            if (path.endsWith("/1")) return route.fulfill({ json: row });
            return route.fulfill({
                json: { items: state.rows, total: state.rows.length, page: 1, page_size: 20 },
            });
        }
        if (state.fail)
            return route.fulfill({ status: 503, json: { detail: { message: "Unavailable" } } });
        const body = request.postDataJSON();
        if (path.endsWith("/status")) row.status = body.status;
        else if (path.endsWith("/messages"))
            row.messages.push({
                id: row.messages.length + 1,
                author_role: admin ? "admin" : "user",
                body: body.body,
                created_at: row.created_at,
            });
        else {
            row.subject = body.subject;
            row.messages[0].body = body.body;
            state.rows = [row];
        }
        return route.fulfill({ json: row });
    });
    return state;
}
for (const width of [390, 1440])
    for (const colorScheme of ["light", "dark"] as const)
        for (const admin of [false, true]) {
            test(`support ${admin ? "admin" : "user"} ${width} ${colorScheme}`, async ({
                page,
            }, info) => {
                const state = await setup(page, admin);
                await page.setViewportSize({ width, height: 950 });
                await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
                const geometry = () =>
                    page.locator(".settings-content-card").evaluate((el) => ({
                        width: el.getBoundingClientRect().width,
                        padding: getComputedStyle(el).padding,
                        font: getComputedStyle(el.querySelector("h1")!).fontSize,
                    }));
                await page.goto("/settings?section=general");
                await expect(page.locator(".settings-content-card h1")).toBeVisible();
                const peer = await geometry();
                await page.goto(admin ? "/admin/inquiries" : "/settings?section=support");
                await expect(
                    page.getByRole("heading", {
                        name: admin ? "Support inquiries" : "Support",
                        exact: true,
                    }),
                ).toBeVisible();
                expect(await geometry()).toEqual(peer);
                if (!admin) {
                    await expect(page.getByText("No inquiries yet.")).toBeVisible();
                    await page.getByRole("button", { name: "New inquiry", exact: true }).click();
                    await page.getByLabel("Subject", { exact: true }).fill("Plan question");
                    await page
                        .getByLabel("Message", { exact: true })
                        .fill("Please review my plan.");
                    state.fail = true;
                    await page.getByRole("button", { name: "Send inquiry", exact: true }).click();
                    await expect(
                        page.getByText(
                            "Could not load or update this inquiry. Check its status and try again.",
                        ),
                    ).toBeVisible();
                    await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
                        "Please review my plan.",
                    );
                    await expect(
                        page.getByText("Your inquiry has been sent.", { exact: true }),
                    ).toHaveCount(0);
                    state.fail = false;
                    await page.getByRole("button", { name: "Send inquiry", exact: true }).click();
                    await expect(
                        page.getByText("Your inquiry has been sent.", { exact: true }),
                    ).toBeVisible();
                } else
                    await page.getByRole("button", { name: "Plan question", exact: true }).click();
                await expect(
                    page.getByText("Please review my plan.", { exact: true }),
                ).toBeVisible();
                await page
                    .getByLabel(admin ? "Reply message" : "Additional message", { exact: true })
                    .fill("Confirmed reply");
                await page
                    .getByRole("button", {
                        name: admin ? "Send reply" : "Send additional message",
                        exact: true,
                    })
                    .click();
                await expect(page.getByText("Confirmed reply", { exact: true })).toBeVisible();
                if (admin) {
                    await page.getByRole("button", { name: "Close inquiry", exact: true }).click();
                    await expect(
                        page.getByText(
                            "This inquiry is closed. Start a new inquiry if you need more help.",
                        ),
                    ).toBeVisible();
                    await expect(page.getByLabel("Reply message", { exact: true })).toHaveCount(0);
                }
                await page.screenshot({ path: info.outputPath("support.png"), fullPage: true });
                expect(
                    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
                ).toBe(true);
                await page.reload();
                await expect(page.getByText("Confirmed reply", { exact: true })).toBeVisible();
            });
        }
