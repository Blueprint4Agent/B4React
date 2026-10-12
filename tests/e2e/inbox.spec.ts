import { expect, test, type Page } from "../fixtures/browser";
async function setup(page: Page) {
    const rows = Array.from({ length: 22 }, (_, i) => ({
        id: i + 1,
        kind: "test",
        title: `Update ${i + 1}`,
        body: "Your support request has an update.",
        action_path: null,
        created_at: "2026-10-12T10:00:00Z",
        read_at: null as string | null,
    })).reverse();
    const state = { fail: false, rows };
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
                bootstrap_access_token: "inbox-test",
                bootstrap_user: {
                    id: 1,
                    role: "user",
                    name: "Reader",
                    email: "reader@example.com",
                    is_verified: true,
                    created_at: "2026-01-01T00:00:00Z",
                    oauth_providers: [],
                },
            },
        }),
    );
    const summary = () => ({
        unread_count: rows.filter((row) => !row.read_at).length,
        latest_id: Math.max(...rows.map((row) => row.id)),
    });
    await page.route("**/api/v1/inbox/summary", (route) => route.fulfill({ json: summary() }));
    await page.route("**/api/v1/inbox?*", (route) => {
        const params = new URL(route.request().url()).searchParams;
        const p = Number(params.get("page"));
        const filtered =
            params.get("unread_only") === "true" ? rows.filter((row) => !row.read_at) : rows;
        return route.fulfill({
            json: {
                items: filtered.slice((p - 1) * 20, p * 20),
                total: filtered.length,
                page: p,
                page_size: 20,
                summary: summary(),
            },
        });
    });
    await page.route("**/api/v1/inbox/*/read", (route) => {
        if (state.fail)
            return route.fulfill({ status: 503, json: { detail: { message: "Unavailable" } } });
        const id = Number(new URL(route.request().url()).pathname.split("/").at(-2));
        const row = rows.find((row) => row.id === id)!;
        row.read_at = "2026-10-12T11:00:00Z";
        return route.fulfill({ json: row });
    });
    await page.route("**/api/v1/inbox/read-all", (route) => {
        const { through_id } = route.request().postDataJSON();
        rows.filter((row) => row.id <= through_id).forEach((row) => {
            row.read_at = "2026-10-12T11:00:00Z";
        });
        return route.fulfill({ json: summary() });
    });
    return state;
}
for (const width of [390, 1440])
    for (const colorScheme of ["light", "dark"] as const)
        test(`inbox reads persist and match settings ${width} ${colorScheme}`, async ({
            page,
        }, info) => {
            const state = await setup(page);
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
            await page.locator(".profile-menu__trigger").click();
            await page.getByRole("link", { name: "Notifications (22)", exact: true }).click();
            await expect(page.getByText("Update 22", { exact: true })).toBeVisible();
            expect(await geometry()).toEqual(peer);
            await page.screenshot({ path: info.outputPath("inbox.png"), fullPage: true });
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            ).toBe(true);
            state.fail = true;
            await page.getByRole("button", { name: "Mark read", exact: true }).first().click();
            await expect(
                page.getByText("Could not update notifications. Please try again."),
            ).toBeVisible();
            expect(state.rows[0].read_at).toBeNull();
            state.fail = false;
            await page.getByRole("button", { name: "Mark read", exact: true }).first().click();
            await expect(page.getByText("Unread: 21", { exact: true })).toBeVisible();
            await page.getByText("Unread only", { exact: true }).click();
            await expect(
                page.getByRole("checkbox", { name: "Unread only", exact: true }),
            ).toBeChecked();
            await expect(page.getByText("Update 22", { exact: true })).toHaveCount(0);
            await page.getByRole("button", { name: "Mark all read", exact: true }).click();
            await expect(page.getByText("No notifications to show.")).toBeVisible();
            const centered = await page.locator(".inbox-state").evaluate((el) => {
                const box = el.getBoundingClientRect();
                const child = el.firstElementChild!.getBoundingClientRect();
                return {
                    x: Math.abs(box.x + box.width / 2 - child.x - child.width / 2),
                    y: Math.abs(box.y + box.height / 2 - child.y - child.height / 2),
                };
            });
            expect(centered.x).toBeLessThan(1);
            expect(centered.y).toBeLessThan(1);
            await page.screenshot({ path: info.outputPath("inbox-empty.png"), fullPage: true });
            await page.reload();
            await expect(page.getByText("Unread: 0", { exact: true })).toBeVisible();
        });
test("SSE invalidation refreshes a durable new notification", async ({ page }) => {
    const state = await setup(page);
    let connections = 0;
    await page.route("**/api/v1/events/stream", async (route) => {
        connections++;
        if (connections === 2)
            state.rows.unshift({ ...state.rows[0], id: 23, title: "New event", read_at: null });
        return route.fulfill({
            contentType: "text/event-stream",
            body: 'event: inbox.changed\ndata: {"type":"inbox.changed"}\n\n',
        });
    });
    await page.goto("/notifications");
    await expect(page.getByText("New event", { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Unread: 23", { exact: true })).toBeVisible();
});
