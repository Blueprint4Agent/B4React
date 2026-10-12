import { expect, test } from "@playwright/test";

const prefixes: string[] = JSON.parse(process.env.B4_DEPLOYMENT_TEST_PREFIXES || "[]");
if (prefixes.length !== 2) throw new Error("Two isolated prefix instances are required");

test("monolithic apps keep routes, assets, streaming and sessions beneath independent prefixes", async ({
    page,
    context,
    baseURL,
}) => {
    const unexpected: string[] = [];
    page.on("request", (request) => {
        const url = new URL(request.url());
        if (
            url.origin === baseURL &&
            !prefixes.some((prefix) => url.pathname.startsWith(prefix + "/"))
        )
            unexpected.push(url.pathname);
    });
    const accounts = [];
    for (const [index, prefix] of prefixes.entries()) {
        const account = {
            email: `prefix-${index}-${Date.now()}@example.test`,
            name: `Prefix ${index}`,
            password: "PrefixTest123!",
        };
        const signup = await page.request.post(`${prefix}/api/v1/auth/signup`, { data: account });
        expect(signup.ok(), await signup.text()).toBe(true);
        const login = await page.request.post(`${prefix}/api/v1/auth/login`, {
            data: { email: account.email, password: account.password, remember_me: true },
        });
        expect(login.ok(), await login.text()).toBe(true);
        accounts.push({ ...account, token: (await login.json()).access_token });
        const redirect = await page.request.get(prefix, { maxRedirects: 0 });
        expect(redirect.status()).toBe(308);
        expect(redirect.headers().location).toContain(prefix + "/");
        await page.goto(`${prefix}/home`);
        await expect(page.locator(".app-sidebar")).toBeVisible();
        await page.reload();
        await expect(page.locator(".app-sidebar")).toBeVisible();
        await page.goto(`${prefix}/settings`);
        await expect(page.locator(".settings-content-card")).toBeVisible();
        const images = await page.locator("img").evaluateAll((images) =>
            images.map((image) => ({
                src: image.getAttribute("src"),
                loaded:
                    (image as HTMLImageElement).complete &&
                    (image as HTMLImageElement).naturalWidth > 0,
            })),
        );
        expect(
            images
                .filter((image) => image.src?.startsWith(prefix + "/"))
                .every((image) => image.loaded),
        ).toBe(true);
        for (const path of ["/api/v1/missing", "/assets/missing.js", "/docs", "/metrics"])
            expect((await page.request.get(prefix + path)).status()).toBe(404);
        const stream = await page.evaluate(
            async ({ prefix, token }) => {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 5000);
                try {
                    const response = await fetch(prefix + "/api/v1/events/stream", {
                        headers: { Authorization: `Bearer ${token}` },
                        signal: controller.signal,
                    });
                    const reader = response.body!.getReader();
                    const chunk = await reader.read();
                    return {
                        status: response.status,
                        type: response.headers.get("content-type"),
                        text: new TextDecoder().decode(chunk.value),
                    };
                } finally {
                    clearTimeout(timer);
                    controller.abort();
                }
            },
            { prefix, token: accounts[index].token },
        );
        expect(stream.status).toBe(200);
        expect(stream.type).toContain("text/event-stream");
        expect(stream.text).toContain("event:");
    }
    const cookies = await context.cookies();
    for (const prefix of prefixes)
        expect(cookies.filter((cookie) => cookie.path === prefix + "/")).toHaveLength(2);
    expect(new Set(cookies.map((cookie) => cookie.name)).size).toBe(4);
    const logout = await page.request.post(`${prefixes[0]}/api/v1/auth/logout`, {
        headers: { Authorization: `Bearer ${accounts[0].token}` },
    });
    expect(logout.ok(), await logout.text()).toBe(true);
    expect(
        (await context.cookies()).filter((cookie) => cookie.path === prefixes[0] + "/"),
    ).toHaveLength(0);
    expect((await page.request.post(`${prefixes[1]}/api/v1/auth/refresh`)).ok()).toBe(true);
    const keys = await page.evaluate(() => Object.keys(sessionStorage));
    for (const prefix of prefixes) expect(keys).toContain(`template_access_token:${prefix}`);
    expect(unexpected).toEqual([]);
});
