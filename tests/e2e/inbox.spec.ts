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
        latest_id: Math.max(0, ...rows.map((row) => row.id)),
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
    await page.route("**/api/v1/inbox/read-selected", (route) => {
        const ids = route.request().postDataJSON().notification_ids;
        rows.filter((row) => ids.includes(row.id)).forEach((row) => {
            row.read_at = "2026-10-12T11:00:00Z";
        });
        return route.fulfill({ json: summary() });
    });
    await page.route("**/api/v1/inbox/selected", (route) => {
        const ids = route.request().postDataJSON().notification_ids;
        for (let i = rows.length - 1; i >= 0; i--) if (ids.includes(rows[i].id)) rows.splice(i, 1);
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
            const sidebarLinks = await page
                .locator("#app-sidebar-navigation a")
                .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
            await page.locator(".profile-menu__trigger").click();
            const menuOrder = await page
                .locator(".profile-menu__dropdown a")
                .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
            expect(menuOrder.indexOf("/notifications")).toBe(menuOrder.indexOf("/profile") + 1);
            await expect(page.locator(".profile-menu__count")).toHaveText("22");
            await page.screenshot({ path: info.outputPath("inbox-badge.png") });
            await page
                .getByRole("link", { name: "Notifications, Unread: 22", exact: true })
                .click();
            await expect(page.getByText("Update 22", { exact: true })).toBeVisible();
            expect(await geometry()).toEqual(peer);
            await expect
                .poll(() =>
                    page
                        .locator("#app-sidebar-navigation a")
                        .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
                )
                .toEqual(sidebarLinks);
            const alignment = await page
                .locator(".inbox-detail-trigger")
                .first()
                .evaluate((button) => {
                    const icon = button.querySelector("svg")!.getBoundingClientRect();
                    const text = button
                        .querySelector(".ui-button__label > span")!
                        .getBoundingClientRect();
                    return Math.abs(icon.y + icon.height / 2 - text.y - text.height / 2);
                });
            expect(alignment).toBeLessThan(0.6);
            await page.screenshot({ path: info.outputPath("inbox.png"), fullPage: true });
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            ).toBe(true);
            state.fail = true;
            await page.getByRole("button", { name: "View details", exact: true }).first().click();
            const dialog = page.getByRole("dialog");
            await expect(
                dialog.getByText("Your support request has an update.", { exact: true }),
            ).toBeVisible();
            await expect(dialog.getByRole("button", { name: "Delete", exact: true })).toHaveCount(
                0,
            );
            await expect(
                dialog.getByRole("button", { name: "Open related page", exact: true }),
            ).toHaveCount(0);
            await expect(
                dialog.getByText("Could not update notifications. Please try again."),
            ).toBeVisible();
            expect(state.rows[0].read_at).toBeNull();
            state.fail = false;
            await dialog.getByRole("button", { name: "Mark read", exact: true }).click();
            await expect(page.getByText("Unread: 21", { exact: true })).toBeVisible();
            await dialog
                .locator("footer")
                .getByRole("button", { name: "Close", exact: true })
                .click();
            await page.locator(".inbox-table tbody tr").first().locator("label.checkbox").click();
            await expect(
                page.getByRole("checkbox", { name: "Select all on this page", exact: true }),
            ).toHaveJSProperty("indeterminate", true);
            await page.locator(".inbox-table thead label.checkbox").click();
            await expect(page.getByText("20 selected", { exact: true })).toBeVisible();
            await page.getByRole("button", { name: "Delete selected", exact: true }).click();
            await page
                .getByRole("dialog")
                .getByRole("button", { name: "Cancel", exact: true })
                .click();
            expect(state.rows).toHaveLength(22);
            await page.getByRole("button", { name: "Mark selected read", exact: true }).click();
            await expect(page.getByText("Unread: 2", { exact: true })).toBeVisible();
            await page.locator(".inbox-table thead label.checkbox").click();
            await page.getByRole("button", { name: "Delete selected", exact: true }).click();
            await page
                .getByRole("dialog")
                .getByRole("button", { name: "Delete", exact: true })
                .click();
            await expect(page.getByText("Update 22", { exact: true })).toHaveCount(0);
            expect(state.rows).toHaveLength(2);
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

test("filter refresh preserves the table until the response arrives", async ({ page }) => {
    await setup(page);
    await page.goto("/notifications");
    await expect(page.getByText("Update 22", { exact: true })).toBeVisible();
    let release!: () => void;
    const response = new Promise<void>((resolve) => {
        release = resolve;
    });
    await page.route("**/api/v1/inbox?*", async (route) => {
        await response;
        await route.fallback();
    });
    const request = page.waitForRequest((req) => req.url().includes("unread_only=true"));
    await page.getByText("Unread only", { exact: true }).click();
    await request;
    await expect(page.getByText("Update 22", { exact: true })).toBeVisible();
    await expect(page.locator(".inbox-state")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "View details" }).first()).toBeDisabled();
    release();
    await expect(page.getByRole("button", { name: "View details" }).first()).toBeEnabled();
});
