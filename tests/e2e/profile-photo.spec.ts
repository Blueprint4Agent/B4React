import { expect, test } from "../fixtures/browser";

// Valid one-pixel PNG input; the endpoint response is a separately encoded WebP.
const input = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEklEQVR4nGM8IafBwMDAxAAGAA1yARJBWiM1AAAAAElFTkSuQmCC",
    "base64",
);
const output = Buffer.from(
    "UklGRjoAAABXRUJQVlA4IC4AAACQAQCdASoCAAIAAUAmJaACdLoAA5gA/vFNr+LaR0KZD/7xn/9xn/9xn/yIAAAA",
    "base64",
);

test("account photo uploads binary, survives reload, preserves old photo on failure and removes", async ({
    page,
}) => {
    let photo: string | null = null;
    let unavailable = false;
    let reads = 0;
    const user = () => ({
        id: 1,
        name: "Photo User",
        email: "photo@example.com",
        role: "user",
        is_verified: true,
        created_at: "2026-01-01",
        oauth_providers: [],
        profile_image_url: photo,
    });
    await page.route("**/config", (route) =>
        route.fulfill({
            json: {
                app_mode: "development",
                api_base_path: "/api/v1",
                frontend_base_path: "",
                login_enabled: false,
                email_enabled: false,
                oauth_enabled: false,
                oauth_providers: [],
                billing_enabled: false,
                bootstrap_user: user(),
                bootstrap_access_token: "photo-test-token",
            },
        }),
    );
    await page.route("**/api/v1/auth/me/photo**", async (route) => {
        expect(route.request().headers().authorization).toBe("Bearer photo-test-token");
        if (route.request().method() === "PUT") {
            expect(route.request().headers()["content-type"]).toBe("application/octet-stream");
            expect(route.request().postDataBuffer()).toEqual(input);
            if (unavailable)
                return route.fulfill({
                    status: 503,
                    json: {
                        detail: { error: "PROFILE_PHOTO_UNAVAILABLE", message: "Unavailable" },
                    },
                });
            photo = "/api/v1/auth/me/photo?version=revision1";
            return route.fulfill({ json: user() });
        }
        if (route.request().method() === "DELETE") {
            photo = null;
            return route.fulfill({ json: user() });
        }
        reads += 1;
        return route.fulfill({ contentType: "image/webp", body: output });
    });
    await page.goto("/settings?section=account");
    const panel = page.locator(".settings-profile-photo-panel");
    const upload = panel.locator('input[type="file"]');
    await upload.setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: input });
    await expect(panel.locator("img")).toHaveAttribute("src", /^blob:/);
    await page.reload();
    await expect(panel.locator("img")).toHaveAttribute("src", /^blob:/);
    const old = await panel.locator("img").getAttribute("src");
    unavailable = true;
    await upload.setInputFiles({ name: "again.png", mimeType: "image/png", buffer: input });
    await expect(panel).toContainText("Your previous photo is unchanged");
    await expect(panel.locator("img")).toHaveAttribute("src", old!);
    await panel.getByRole("button", { name: "Remove photo" }).click();
    await expect(panel.locator("img")).toHaveCount(0);
    expect(reads).toBe(2);
});
