import { setAccessToken } from "../../../../store/session";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useSubscription } from "../../../../hooks/api/billing/useSubscription";
const revalidateSession = vi.hoisted(() => vi.fn());
vi.mock("../../../../hooks/useAuth", () => ({ useAuthContext: () => ({ revalidateSession }) }));
const flags = vi.hoisted(() => ({
    data: { billing_enabled: true } as {
        billing_enabled: boolean;
    } | null,
}));
vi.mock("../../../../hooks/useFeatures", () => ({ useAppConfig: () => flags }));
const api = vi.hoisted(() => ({
    getBillingPlans: vi.fn(),
    getBillingSubscription: vi.fn(),
    getBillingCheckoutStatus: vi.fn(),
    createBillingCheckout: vi.fn(),
    changeBillingSubscription: vi.fn(),
    extractBillingErrorCode: vi.fn(),
}));
vi.mock("../../../../hooks/api/billing/useBillingApi", () => ({ useBillingApi: () => api }));
vi.mock("../../../../hooks/connectivity/useServerConnectivity", () => ({
    useServerConnectivity: () => ({ isDesktop: false, status: "online" }),
}));
const free = { plan: "free", status: "none", has_subscription: false };
beforeEach(() => {
    vi.resetAllMocks();
    flags.data = { billing_enabled: true };
    api.getBillingPlans.mockResolvedValue({ enabled: true, livemode: false, prices: [] });
    api.getBillingSubscription.mockResolvedValue(free);
    api.createBillingCheckout.mockResolvedValue({
        url: "https://checkout.stripe.com/c/pay/example",
    });
    api.extractBillingErrorCode.mockReturnValue(null);
});
it("keeps one request identity after a failure and blocks concurrent actions", async () => {
    const { result } = renderHook(() => useSubscription(1, null, true, true));
    await waitFor(() => expect(result.current.subscription).toEqual(free));
    api.createBillingCheckout.mockRejectedValueOnce(new Error("network"));
    await act(async () => {
        await result.current.checkout("monthly", "krw");
    });
    const request = api.createBillingCheckout.mock.calls[0][0];
    let resolve!: (value: { url: string }) => void;
    api.createBillingCheckout.mockReturnValueOnce(
        new Promise((done) => {
            resolve = done;
        }),
    );
    let first!: Promise<string | null>;
    await act(async () => {
        first = result.current.checkout("monthly", "krw");
        expect(await result.current.checkout("monthly", "krw")).toBeNull();
    });
    await act(async () => {
        resolve({ url: "https://checkout.stripe.com/c/pay/example" });
        await first;
    });
    expect(api.createBillingCheckout).toHaveBeenCalledTimes(2);
    expect(api.createBillingCheckout.mock.calls[1][0]).toEqual(request);
});
it("does not restore an old account snapshot after switching owners", async () => {
    let resolve!: (value: typeof free) => void;
    api.getBillingSubscription.mockReturnValueOnce(
        new Promise((done) => {
            resolve = done;
        }),
    );
    const { result, rerender } = renderHook(({ owner }) => useSubscription(owner), {
        initialProps: { owner: 1 },
    });
    await waitFor(() => expect(api.getBillingSubscription).toHaveBeenCalledTimes(1));
    const paid = { plan: "annual", status: "active", has_subscription: true };
    api.getBillingSubscription.mockResolvedValue(paid);
    rerender({ owner: 2 });
    await waitFor(() => expect(result.current.subscription).toEqual(paid));
    await act(async () => {
        resolve(free);
    });
    expect(result.current.subscription).toEqual(paid);
});
it("rejects untrusted redirect URLs and stale checkout completion", async () => {
    const { result, rerender } = renderHook(
        ({ owner }) => useSubscription(owner, null, true, true),
        { initialProps: { owner: 1 } },
    );
    await waitFor(() => expect(result.current.subscription).toEqual(free));
    api.createBillingCheckout.mockResolvedValueOnce({
        url: "https://checkout.stripe.com.evil.example/",
    });
    await act(async () => {
        expect(await result.current.checkout("monthly", "krw")).toBeNull();
    });
    expect(result.current.error).toBe("billing.errors.unknown");
    let resolve!: (value: { url: string }) => void;
    api.createBillingCheckout.mockReturnValueOnce(
        new Promise((done) => {
            resolve = done;
        }),
    );
    let pending!: Promise<string | null>;
    act(() => {
        pending = result.current.checkout("monthly", "krw");
    });
    rerender({ owner: 2 });
    await act(async () => {
        resolve({ url: "https://checkout.stripe.com/c/pay/example" });
        expect(await pending).toBeNull();
    });
});
it("does not infer payment from complete status and refetches on recovery", async () => {
    api.getBillingCheckoutStatus.mockResolvedValue({ status: "complete", paid: false });
    const { result } = renderHook(() => useSubscription(1, "cs_test_return"));
    await waitFor(() => expect(result.current.notice).toBe("pending"));
    api.getBillingCheckoutStatus.mockResolvedValue({ status: "complete", paid: true });
    await act(async () => {
        window.dispatchEvent(new Event("online"));
    });
    await waitFor(() => expect(result.current.notice).toBe("paid"));
});
it("disabled catalogs and guests cannot create checkout or claim a current plan", async () => {
    api.getBillingPlans.mockResolvedValue({ enabled: false, livemode: false, prices: [] });
    const { result, rerender } = renderHook(
        ({ owner }) => useSubscription(owner, null, true, true),
        { initialProps: { owner: 1 as number | undefined } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.subscription).toBeNull();
    expect(api.getBillingSubscription).not.toHaveBeenCalled();
    await act(async () => {
        expect(await result.current.checkout("monthly", "krw")).toBeNull();
    });
    rerender({ owner: undefined });
    expect(api.getBillingPlans).toHaveBeenCalledTimes(1);
    expect(api.createBillingCheckout).not.toHaveBeenCalled();
});

it("serializes plan changes, reuses retry identity and ignores a response after owner switch", async () => {
    const active = {
        plan: "monthly",
        status: "active",
        has_subscription: true,
        can_manage: true,
        change_version: "a".repeat(64),
    };
    api.getBillingSubscription.mockResolvedValue(active);
    const { result, rerender } = renderHook(({ owner }) => useSubscription(owner), {
        initialProps: { owner: 1 },
    });
    await waitFor(() => expect(result.current.subscription).toEqual(active));
    api.changeBillingSubscription.mockRejectedValueOnce(new Error("network"));
    await act(async () => {
        expect(await result.current.change("free", active.change_version)).toBe(false);
    });
    const request = api.changeBillingSubscription.mock.calls[0][0];
    let resolve!: (value: typeof active) => void;
    api.changeBillingSubscription.mockReturnValueOnce(
        new Promise((done) => {
            resolve = done;
        }),
    );
    let pending!: Promise<boolean>;
    await act(async () => {
        pending = result.current.change("free", active.change_version);
        expect(await result.current.change("annual", active.change_version)).toBe(false);
    });
    expect(api.changeBillingSubscription.mock.calls[1][0]).toEqual(request);
    api.getBillingSubscription.mockResolvedValue(free);
    rerender({ owner: 2 });
    await waitFor(() => expect(result.current.subscription).toEqual(free));
    await act(async () => {
        resolve(active);
        expect(await pending).toBe(false);
    });
    expect(result.current.subscription).toEqual(free);
});

it("refreshes the profile consumer once after a successful plan mutation", async () => {
    const plus = {
        plan: "monthly",
        status: "active",
        has_subscription: true,
        can_manage: true,
        change_version: "a".repeat(64),
    };
    const pro = { ...plus, plan: "pro_monthly" };
    api.getBillingSubscription.mockResolvedValue(plus);
    const actor = renderHook(() => useSubscription(1));
    const profile = renderHook(() => useSubscription(1));
    await waitFor(() => expect(actor.result.current.subscription).toEqual(plus));
    await waitFor(() => expect(profile.result.current.subscription).toEqual(plus));
    api.getBillingSubscription.mockResolvedValue(pro);
    api.changeBillingSubscription.mockResolvedValue(pro);
    await act(async () => {
        expect(await actor.result.current.change("pro_monthly", plus.change_version)).toBe(true);
    });
    await waitFor(() => expect(profile.result.current.subscription).toEqual(pro));
    expect(api.getBillingSubscription).toHaveBeenCalledTimes(3);
    expect(actor.result.current.subscription).toEqual(pro);
});

it("does not request disabled or unresolved features, including recovery events", async () => {
    flags.data = null;
    const { result, rerender } = renderHook(() => useSubscription(1, null));
    await act(async () => {
        await result.current.reload();
        window.dispatchEvent(new Event("focus"));
        window.dispatchEvent(new Event("online"));
    });
    flags.data = { billing_enabled: false };
    rerender();
    await act(async () => {
        await result.current.reload();
    });
    expect(result.current.available).toBe(false);
    for (const mock of Object.values(api)) expect(mock).not.toHaveBeenCalled();
});

it("recovers a rejected token once and stops repeated focus requests if renewal is rejected", async () => {
    setAccessToken("expired");
    api.getBillingSubscription.mockRejectedValue({ detail: { error: "INVALID_TOKEN" } });
    revalidateSession.mockImplementation(async () => {
        setAccessToken("renewed");
    });
    const { result } = renderHook(() => useSubscription(1));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(revalidateSession).toHaveBeenCalledTimes(1);
    expect(api.getBillingSubscription).toHaveBeenCalledTimes(2);
    for (let i = 0; i < 5; i++)
        await act(async () => {
            window.dispatchEvent(new Event("focus"));
        });
    expect(api.getBillingSubscription).toHaveBeenCalledTimes(2);
    api.getBillingSubscription.mockResolvedValue(free);
    await act(async () => {
        setAccessToken("new-session");
    });
    await waitFor(() => expect(result.current.subscription).toEqual(free));
});
