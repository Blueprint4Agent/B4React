import { afterEach, expect, it, vi } from "vitest";
import {
    authenticatedFetch,
    registerSessionRecovery,
    resetSessionRecovery,
} from "../../../api/http";
import { clearAccessToken, setAccessToken } from "../../../store/session";

const denied = () => Response.json({ detail: { error: "INVALID_TOKEN" } }, { status: 401 });
const request = (path = "subscription") =>
    new Request(`http://localhost/api/v1/billing/${path}`, {
        method: "POST",
        headers: { Authorization: "Bearer expired", "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: "same-id" }),
    });
let cleanup = () => {};
afterEach(() => {
    cleanup();
    clearAccessToken();
    vi.unstubAllGlobals();
});

it("shares recovery across concurrent and late failures and preserves replay bodies", async () => {
    setAccessToken("expired");
    let finish!: () => void;
    const recovery = vi.fn(async () => {
        await new Promise<void>((resolve) => {
            finish = resolve;
        });
        setAccessToken("fresh");
    });
    cleanup = registerSessionRecovery(recovery);
    let late!: (response: Response) => void;
    const bodies: string[] = [];
    vi.stubGlobal(
        "fetch",
        vi.fn(async (req: Request) => {
            if (req.headers.get("Authorization") === "Bearer fresh") {
                bodies.push(await req.text());
                return Response.json({ ok: true });
            }
            if (req.url.endsWith("late"))
                return new Promise<Response>((resolve) => {
                    late = resolve;
                });
            return denied();
        }),
    );
    const pending = [
        authenticatedFetch(request()),
        authenticatedFetch(request()),
        authenticatedFetch(request("late")),
    ];
    await vi.waitFor(() => expect(recovery).toHaveBeenCalledTimes(1));
    finish();
    await Promise.all(pending.slice(0, 2));
    late(denied());
    expect((await pending[2]).status).toBe(200);
    expect(recovery).toHaveBeenCalledTimes(1);
    expect(bodies).toEqual(Array(3).fill('{"request_id":"same-id"}'));
});

it("does not repeatedly renew the same rejected credential", async () => {
    setAccessToken("expired");
    const recovery = vi.fn(async () => {
        throw new Error("refresh rejected");
    });
    cleanup = registerSessionRecovery(recovery);
    vi.stubGlobal(
        "fetch",
        vi.fn(async () => denied()),
    );
    for (let i = 0; i < 4; i++) expect((await authenticatedFetch(request())).status).toBe(401);
    expect(recovery).toHaveBeenCalledTimes(1);
});

it("does not replay an old request in a new session", async () => {
    setAccessToken("expired");
    const recovery = vi.fn(async () => {});
    cleanup = registerSessionRecovery(recovery);
    let finish!: (response: Response) => void;
    const fetchMock = vi.fn(
        () =>
            new Promise<Response>((resolve) => {
                finish = resolve;
            }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const pending = authenticatedFetch(request());
    resetSessionRecovery();
    setAccessToken("other-account");
    finish(denied());
    expect((await pending).status).toBe(401);
    expect(recovery).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("never recursively recovers auth identity requests or forbidden responses", async () => {
    setAccessToken("expired");
    const recovery = vi.fn(async () => {});
    cleanup = registerSessionRecovery(recovery);
    vi.stubGlobal(
        "fetch",
        vi.fn(async () => denied()),
    );
    await authenticatedFetch(
        new Request("http://localhost/api/v1/auth/me", {
            headers: { Authorization: "Bearer expired" },
        }),
    );
    vi.stubGlobal(
        "fetch",
        vi.fn(async () => Response.json({}, { status: 403 })),
    );
    await authenticatedFetch(request());
    expect(recovery).not.toHaveBeenCalled();
});

it("bounds a rejected retry even when the renewed credential is also invalid", async () => {
    setAccessToken("expired");
    const recovery = vi.fn(async () => {
        setAccessToken("renewed");
    });
    cleanup = registerSessionRecovery(recovery);
    const network = vi.fn(async () => denied());
    vi.stubGlobal("fetch", network);
    expect((await authenticatedFetch(request())).status).toBe(401);
    const next = new Request("http://localhost/api/v1/billing/subscription", {
        headers: { Authorization: "Bearer renewed" },
    });
    expect((await authenticatedFetch(next)).status).toBe(401);
    expect(recovery).toHaveBeenCalledTimes(1);
    expect(network).toHaveBeenCalledTimes(3);
});
