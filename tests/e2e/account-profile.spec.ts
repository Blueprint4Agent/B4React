import { expect, test, type Page } from "../fixtures/browser";

async function setup(page: Page, emailEnabled = true) {
    let user = {
        id: 7,
        name: "Profile User",
        email: "profile@example.com",
        role: "user",
        is_verified: true,
        created_at: "2026-01-15T12:00:00Z",
        has_password: true,
        oauth_providers: ["google"],
        bio: "Building useful things, one day at a time.",
        location: "KR:11",
        profile_image_url: null,
    };
    const stats = { writes: 0, reads: 0, failSave: false };
    await page.addInitScript(() => {
        sessionStorage.setItem("template_access_token", "profile-token");
        localStorage.setItem("b4a_language", "en");
    });
    await page.route("**/config", (route) =>
        route.fulfill({
            json: {
                app_mode: "development",
                api_base_path: "/api/v1",
                frontend_base_path: "",
                login_enabled: true,
                email_enabled: emailEnabled,
                oauth_enabled: true,
                oauth_providers: ["google"],
                billing_enabled: true,
            },
        }),
    );
    await page.route("**/api/v1/auth/me", (route) => {
        if (route.request().method() === "PATCH") {
            stats.writes++;
            if (stats.failSave)
                return route.fulfill({
                    status: 503,
                    json: {
                        detail: { error: "PROFILE_UPDATE_FAILED", message: "Profile save failed" },
                    },
                });
            user = { ...user, ...route.request().postDataJSON() };
        }
        return route.fulfill({ json: user });
    });
    await page.route("**/api/v1/billing/subscription", (route) => {
        stats.reads++;
        return route.fulfill({
            json: { plan: "pro_monthly", status: "active", has_subscription: true },
        });
    });
    return stats;
}

for (const width of [390, 1440])
    for (const theme of ["light", "dark"] as const) {
        test(`personal profile and account use clean ${theme} layouts at ${width}px`, async ({
            page,
        }, info) => {
            // Given: a private profile and a real server snapshot shape for the current plan.
            const stats = await setup(page);
            await page.setViewportSize({ width, height: 1000 });
            await page.emulateMedia({ colorScheme: theme });
            await page.goto("/profile");
            await expect(page.getByRole("heading", { name: "Profile User" })).toBeVisible();
            await expect(page.locator(".personal-profile__details")).toContainText("Pro");
            await expect(page.locator(".personal-profile__details")).toContainText("Seoul");
            const edit = page.locator(".editable-avatar__edit");
            await page.getByRole("button", { name: "Choose photo" }).focus();
            await expect(edit).toHaveCSS("opacity", "1");
            expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            ).toBe(true);
            await page.screenshot({ path: info.outputPath("profile.png"), fullPage: true });
            // When: navigation happens inside the app, it reuses the subscription owner.
            await page.locator(".profile-menu__trigger").click();
            await page.getByRole("link", { name: "Settings", exact: true }).click();
            await expect(page.getByRole("heading", { name: "Account", exact: true })).toBeVisible();
            await expect(page.getByRole("button", { name: "Go to profile" })).toBeVisible();
            await expect(
                page.locator(".settings-row").filter({ hasText: "Current plan" }),
            ).toContainText("Pro");
            await expect(page.locator('input[type="password"]')).toHaveCount(0);
            await expect(
                page.locator('.app-sidebar a[href="/settings?section=profile"]'),
            ).toHaveCount(0);
            await expect(page.locator(".settings-content-card")).toHaveCSS("opacity", "1");
            const geometry = () =>
                page.locator(".settings-content-card").evaluate((shell) => {
                    const header = shell.querySelector("header")!;
                    const row = shell.querySelector(".settings-row")!;
                    const r = row.getBoundingClientRect();
                    const s = getComputedStyle(row);
                    return {
                        gap: r.top - header.getBoundingClientRect().bottom,
                        width: r.width,
                        padding: s.padding,
                        radius: s.borderRadius,
                        background: s.background,
                    };
                });
            const account = await geometry();
            await page.screenshot({ path: info.outputPath("account.png"), fullPage: true });
            const modalGeometry = () =>
                page.getByRole("dialog").evaluate((dialog) => {
                    const code = dialog.querySelector(".account-deletion-code-row")!;
                    const recipient = dialog.querySelector(".account-deletion-recipient")!;
                    const style = getComputedStyle(recipient);
                    return {
                        codeWidth: code.getBoundingClientRect().width,
                        recipientWidth: recipient.getBoundingClientRect().width,
                        padding: style.padding,
                        border: style.borderRadius,
                    };
                });
            await page.getByRole("button", { name: "Change password", exact: true }).click();
            const passwordGeometry = await modalGeometry();
            await page.screenshot({ path: info.outputPath("password-dialog.png"), fullPage: true });
            await page
                .getByRole("dialog")
                .getByRole("button", { name: "Cancel", exact: true })
                .click();
            await page.getByRole("button", { name: "Delete account", exact: true }).click();
            expect(await modalGeometry()).toEqual(passwordGeometry);
            await page
                .getByRole("dialog")
                .getByRole("button", { name: "Cancel", exact: true })
                .click();
            expect(stats.reads).toBe(1);
            // Then: account uses the exact General row/header geometry and surfaces.
            await page.goto("/settings?section=general");
            await expect(page.locator(".settings-content-card")).toHaveCSS("opacity", "1");
            expect(await geometry()).toEqual(account);
            await page.screenshot({ path: info.outputPath("general.png"), fullPage: true });
        });
    }

test("profile edit saves once, synchronizes sidebar, keeps failed drafts and survives reload", async ({
    page,
}) => {
    const stats = await setup(page);
    await page.goto("/profile");
    await page.getByRole("button", { name: "Edit profile" }).click();
    const dialog = page.getByRole("dialog", { name: "Edit profile" });
    await dialog.getByLabel("Name", { exact: true }).fill("Updated Profile");
    await dialog.getByLabel("Bio", { exact: true }).fill("A new bio\nwith two lines.");
    await dialog.getByRole("button", { name: /City \/ region/ }).click();
    await page.getByRole("menuitem", { name: "Busan-gwangyeoksi", exact: true }).click();
    expect(stats.writes).toBe(0);
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Updated Profile" })).toBeVisible();
    await page.locator(".profile-menu__trigger").click();
    await expect(page.locator(".profile-menu__dropdown")).toContainText("Updated Profile");
    await page.keyboard.press("Escape");
    expect(stats.writes).toBe(1);
    await page.reload();
    await expect(page.locator(".personal-profile__bio")).toContainText("with two lines");
    stats.failSave = true;
    await page.getByRole("button", { name: "Edit profile" }).click();
    await dialog.getByLabel("Name", { exact: true }).fill("Unsaved");
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Name", { exact: true })).toHaveValue("Unsaved");
    await expect(page.getByRole("heading", { name: "Updated Profile" })).toBeVisible();
});

test("password modal requires emailed code, validates confirmation and clears on success", async ({
    page,
}, info) => {
    await setup(page);
    let sends = 0,
        saves = 0;
    await page.route("**/api/v1/auth/me/password/code", (route) => {
        sends++;
        return route.fulfill({ json: { expires_in: 600, retry_after: 60 } });
    });
    await page.route("**/api/v1/auth/me/password", (route) => {
        saves++;
        expect(route.request().postDataJSON()).toEqual({
            code: "123456",
            password: "NewPassword123!",
        });
        return route.fulfill({ json: { message: "Password changed." } });
    });
    await page.goto("/settings?section=account");
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await page.getByRole("button", { name: "Change password" }).click();
    const dialog = page.getByRole("dialog", { name: "Change password" });
    await expect(dialog.getByRole("button", { name: "Change password" })).toBeDisabled();
    await dialog.getByRole("button", { name: "Send code" }).click();
    await expect(dialog.getByRole("button", { name: /In \d+s/ })).toBeDisabled();
    await dialog.getByLabel("6-digit verification code").fill("123456");
    await dialog.getByLabel("New password", { exact: true }).fill("NewPassword123!");
    await dialog.getByLabel("Confirm new password", { exact: true }).fill("Wrong123!");
    await expect(dialog.getByRole("button", { name: "Change password" })).toBeDisabled();
    await dialog.getByLabel("Confirm new password", { exact: true }).fill("NewPassword123!");
    await page.screenshot({ path: info.outputPath("password-modal.png"), fullPage: true });
    await dialog.getByRole("button", { name: "Change password" }).click();
    await expect(dialog).toHaveCount(0);
    expect(sends).toBe(1);
    expect(saves).toBe(1);
});

test("disabled email blocks password and deletion but leaves profile navigation", async ({
    page,
}) => {
    await setup(page, false);
    await page.goto("/settings?section=account");
    await expect(page.getByRole("button", { name: "Change password" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Delete account", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Go to profile" }).click();
    await expect(page).toHaveURL(/\/profile$/);
});

test("profile bio enforces 100 characters, expands naturally and preserves sidebar state", async ({
    page,
}, info) => {
    // Given: the expanded app sidebar and a short saved bio.
    await setup(page);
    await page.goto("/home");
    await page.getByRole("button", { name: "Expand sidebar" }).click();
    await expect(page.locator(".app-sidebar")).toHaveCSS("width", "224px");
    const sidebar = await page.locator(".app-sidebar").boundingBox();
    await page.locator(".profile-menu__trigger").click();
    await page.getByRole("link", { name: "Profile", exact: true }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.locator(".app-sidebar")).toHaveCSS("width", `${sidebar!.width}px`);
    const before = (await page.locator(".personal-profile__bio").boundingBox())!.height;
    await page.getByRole("button", { name: "Edit profile" }).click();
    const dialog = page.getByRole("dialog", { name: "Edit profile" });
    const bio = dialog.getByRole("textbox", { name: "Bio", exact: true });
    // When: a longer draft is entered, the counter and client limit agree.
    await bio.fill("x".repeat(101));
    await expect(bio).toHaveValue("x".repeat(100));
    await expect(dialog.getByText("100/100", { exact: true })).toBeVisible();
    const text = Array.from({ length: 10 }, () => "Hello").join("\n");
    await bio.fill(text);
    const add = dialog.getByRole("button", { name: "Add photo" });
    await expect(add).toHaveClass(/ui-button/);
    await expect(add).toHaveCSS("border-radius", "8px");
    await expect(dialog.getByRole("button", { name: "Remove photo" })).toBeDisabled();
    await page.screenshot({ path: info.outputPath("profile-editor.png"), fullPage: true });
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    // Then: every line remains visible without a fixed-height clamp.
    const body = page.locator(".personal-profile__bio");
    await expect(body).toHaveText(text);
    expect((await body.boundingBox())!.height).toBeGreaterThan(before * 3);
    expect(await body.evaluate((el) => el.scrollHeight <= el.clientHeight)).toBe(true);
});

test("name bio and country-region can be edited in place without opening a modal", async ({
    page,
}, info) => {
    const stats = await setup(page);
    await page.goto("/profile");
    await page.getByRole("button", { name: "Profile User", exact: true }).click();
    const nameForm = page.locator(".profile-inline-form--name");
    await expect(nameForm.getByRole("textbox", { name: "Name" })).toBeFocused();
    await nameForm.getByRole("textbox", { name: "Name" }).fill("Inline Name");
    await nameForm.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Inline Name" })).toBeVisible();
    await page
        .getByRole("button", { name: "Building useful things, one day at a time.", exact: true })
        .click();
    const bioForm = page.locator(".profile-inline-form--bio");
    await bioForm.getByRole("textbox", { name: "Bio" }).fill("A calm workspace.\nMade with care.");
    await expect(bioForm.getByText("33/100", { exact: true })).toBeVisible();
    await page.screenshot({ path: info.outputPath("inline-bio.png"), fullPage: true });
    await bioForm.getByRole("button", { name: "Save", exact: true }).click();
    await page.getByRole("button", { name: /Seoul-teukbyeolsi/ }).click();
    const locationForm = page.locator(".personal-profile__details .profile-inline-form");
    await locationForm.getByRole("button", { name: /Country:/ }).click();
    await page.getByRole("menuitem", { name: "United States", exact: true }).click();
    await expect(locationForm.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
    await locationForm.getByRole("button", { name: /City \/ region/ }).click();
    await page.getByRole("menuitem", { name: "California", exact: true }).click();
    await locationForm.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.locator(".personal-profile__details")).toContainText(
        "California, United States",
    );
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(stats.writes).toBe(3);
    await page.locator(".profile-menu__trigger").click();
    await page.getByRole("link", { name: "Settings", exact: true }).click();
    await expect(
        page
            .locator(".settings-row")
            .filter({ has: page.getByRole("heading", { name: "Name", exact: true }) }),
    ).toContainText("Inline Name");
});

test("compact inline edits preserve metadata geometry and account names share the profile owner", async ({
    page,
}, info) => {
    await setup(page);
    await page.goto("/profile");
    const strip = page.locator(".personal-profile__details");
    const before = (await strip.boundingBox())!.y;
    await page.getByRole("button", { name: "Profile User", exact: true }).click();
    expect(Math.abs((await strip.boundingBox())!.y - before)).toBeLessThanOrEqual(2);
    const nameInput = page.locator(".profile-inline-form--name input");
    const nameWidth = (await nameInput.boundingBox())!.width;
    await nameInput.fill("Profile User                    ");
    expect((await nameInput.boundingBox())!.width).toBe(nameWidth);
    await page.screenshot({ path: info.outputPath("compact-name.png"), fullPage: true });
    await page
        .locator(".profile-inline-form--name")
        .getByRole("button", { name: "Cancel", exact: true })
        .click();
    await page
        .getByRole("button", { name: "Building useful things, one day at a time.", exact: true })
        .click();
    await expect(page.locator(".profile-inline-form--bio textarea")).toHaveCSS("height", "96px");
    await page.locator(".profile-inline-form--bio textarea").fill("Introduction" + " ".repeat(80));
    await expect(page.locator(".profile-inline-form--bio textarea")).toHaveCSS("height", "96px");
    await page.screenshot({ path: info.outputPath("compact-bio.png"), fullPage: true });
    await page
        .locator(".profile-inline-form--bio")
        .getByRole("button", { name: "Cancel", exact: true })
        .click();
    const height = (await strip.boundingBox())!.height;
    await page.getByRole("button", { name: /Seoul-teukbyeolsi/ }).click();
    expect((await strip.boundingBox())!.height).toBe(height);
    await page.screenshot({ path: info.outputPath("location-popover.png"), fullPage: true });
    await page
        .locator(".profile-location-popover")
        .getByRole("button", { name: "Cancel", exact: true })
        .click();
    await page.locator(".profile-menu__trigger").click();
    await page.getByRole("link", { name: "Settings", exact: true }).click();
    const edit = page.getByRole("button", { name: "Edit name", exact: true });
    await expect(edit).toHaveCSS("border-radius", "8px");
    await expect(page.getByRole("button", { name: "Change password", exact: true })).toHaveCSS(
        "border-radius",
        "8px",
    );
    await edit.click();
    const form = page.locator(".account-name-form");
    await form.getByRole("textbox", { name: "Name", exact: true }).fill("Account Name");
    await form.getByRole("button", { name: "Save", exact: true }).click();
    await expect(form).toHaveCount(0);
    await page.getByRole("button", { name: "Go to profile" }).click();
    await expect(page.getByRole("heading", { name: "Account Name" })).toBeVisible();
});

for (const width of [390, 1440])
    test(`country options scroll internally without enlarging the page at ${width}px`, async ({
        page,
    }) => {
        await setup(page);
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/profile");
        await page.getByRole("button", { name: /Seoul-teukbyeolsi/ }).click();
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.getByRole("button", { name: /Country:/ }).click();
        const menu = page.getByRole("menu", { name: "Country", exact: true });
        await expect(menu).toHaveCSS("overflow-y", "auto");
        expect(await menu.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
        expect((await menu.boundingBox())!.height).toBeLessThanOrEqual(288);
        expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
        await menu.hover();
        await page.mouse.wheel(0, 500);
        await expect.poll(() => menu.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
        expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
    });
