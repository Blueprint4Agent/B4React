import { expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import { refresh } from "../../../api/auth/authApi";

it("bootstraps a fresh session proof before each cookie refresh", async () => {
    const calls: string[] = [];
    let session = "first-session";
    server.use(
        http.get(/.*\/api\/v1\/auth\/csrf$/, ({ request }) => {
            expect(request.headers.get("X-CSRF-Bootstrap")).toBe("1");
            expect(request.credentials).toBe("include");
            calls.push("bootstrap");
            return HttpResponse.json({ csrf_token: session });
        }),
        http.post(/.*\/api\/v1\/auth\/refresh$/, ({ request }) => {
            expect(request.headers.get("X-CSRF-Token")).toBe(session);
            calls.push("refresh");
            return HttpResponse.json({
                access_token: "access",
                refresh_token: "refresh",
                token_type: "bearer",
            });
        }),
    );
    await refresh();
    session = "second-session";
    await refresh();
    expect(calls).toEqual(["bootstrap", "refresh", "bootstrap", "refresh"]);
});

it("does not attempt refresh when bootstrap fails", async () => {
    let refreshes = 0;
    server.use(
        http.get(/.*\/api\/v1\/auth\/csrf$/, () =>
            HttpResponse.json({ detail: { error: "INVALID_TOKEN" } }, { status: 401 }),
        ),
        http.post(/.*\/api\/v1\/auth\/refresh$/, () => {
            refreshes += 1;
            return HttpResponse.json({});
        }),
    );
    await expect(refresh()).rejects.toMatchObject({ detail: { error: "INVALID_TOKEN" } });
    expect(refreshes).toBe(0);
});
