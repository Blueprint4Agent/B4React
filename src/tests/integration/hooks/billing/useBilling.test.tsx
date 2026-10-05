import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBilling } from "../../../../hooks/api/billing/useBilling";

const api = vi.hoisted(() => ({
    updateBillingProfile: vi.fn(),
    manageBillingMethod: vi.fn(),
    createBillingCardSetup: vi.fn(),
    getBillingCardSetupStatus: vi.fn(),
    getBillingConfig: vi.fn(),
    getBillingProfile: vi.fn(),
    getBillingInvoices: vi.fn(),
    createBillingPortal: vi.fn(),
    listBillingPaymentMethods: vi.fn(),
    getBillingSetupStatus: vi.fn(),
    createBillingSetup: vi.fn(),
    extractBillingErrorCode: vi.fn(),
}));
let connection = { isDesktop: false, status: "online" };
vi.mock("../../../../hooks/api/billing/useBillingApi", () => ({ useBillingApi: () => api }));
vi.mock("../../../../hooks/connectivity/useServerConnectivity", () => ({
    useServerConnectivity: () => connection,
}));
const empty = { items: [], has_more: false, next_cursor: null };
function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((done) => {
        resolve = done;
    });
    return { promise, resolve };
}
async function ready(result: { current: { loading: boolean } }) {
    await waitFor(() => expect(result.current.loading).toBe(false));
}
beforeEach(() => {
    vi.resetAllMocks();
    connection = { isDesktop: false, status: "online" };
    api.getBillingConfig.mockResolvedValue({ enabled: true, livemode: false });
    api.listBillingPaymentMethods.mockResolvedValue(empty);
    api.getBillingProfile.mockResolvedValue({ portal_enabled: false });
    api.getBillingInvoices.mockResolvedValue(empty);
    api.getBillingSetupStatus.mockResolvedValue({
        id: "cs_test_return",
        status: "complete",
        registered: true,
    });
    api.createBillingSetup.mockResolvedValue({
        id: "cs_test_setup",
        url: "https://checkout.stripe.com/c/pay/example",
    });
    api.extractBillingErrorCode.mockReturnValue(null);
});
describe("billing owner lifecycle", () => {
    it("loads card and Link once, refreshes on focus, and skips provider reads when disabled", async () => {
        const { result } = renderHook(() => useBilling(1, null));
        await ready(result);
        expect(api.getBillingConfig).toHaveBeenCalledTimes(1);
        expect(api.listBillingPaymentMethods.mock.calls).toEqual([["card"], ["link"]]);
        api.getBillingConfig.mockResolvedValue({ enabled: false, livemode: false });
        await act(async () => {
            window.dispatchEvent(new Event("focus"));
        });
        await ready(result);
        expect(api.getBillingConfig).toHaveBeenCalledTimes(2);
        expect(api.listBillingPaymentMethods).toHaveBeenCalledTimes(2);
        expect(result.current.config?.enabled).toBe(false);
    });
    it("validates returned registration and does not trust a complete status without registered", async () => {
        api.getBillingSetupStatus.mockResolvedValue({ status: "complete", registered: false });
        const { result } = renderHook(() => useBilling(1, "cs_test_return"));
        await ready(result);
        expect(api.getBillingSetupStatus).toHaveBeenCalledWith("cs_test_return");
        expect(result.current.notice).toBe("pending");
        api.getBillingSetupStatus.mockResolvedValue({ status: "complete", registered: true });
        await act(async () => {
            await result.current.reload();
        });
        expect(result.current.notice).toBe("registered");
        api.getBillingSetupStatus.mockResolvedValue({ status: "expired", registered: false });
        await act(async () => {
            await result.current.reload();
        });
        expect(result.current.notice).toBe("expired");
    });
    it("shows cancellation and rejects malformed return references without querying them", async () => {
        const { result, rerender } = renderHook(({ session }) => useBilling(1, session), {
            initialProps: { session: "cancelled" },
        });
        await ready(result);
        expect(result.current.notice).toBe("cancelled");
        rerender({ session: "evil" });
        await waitFor(() => expect(result.current.error).toBe("billing.errors.unknown"));
        expect(api.getBillingSetupStatus).not.toHaveBeenCalled();
    });
    it("locks duplicate setup clicks and keeps the UUID across an ambiguous failure", async () => {
        const { result } = renderHook(() => useBilling(1, null));
        await ready(result);
        const first = deferred<{ id: string; url: string }>();
        api.createBillingSetup.mockReturnValueOnce(first.promise);
        let setup!: Promise<string | null>;
        act(() => {
            setup = result.current.createSetup();
        });
        await act(async () => {
            expect(await result.current.createSetup()).toBeNull();
        });
        expect(api.createBillingSetup).toHaveBeenCalledTimes(1);
        // An untrusted redirect fails closed and preserves retry identity.
        await act(async () => {
            first.resolve({ id: "cs_test_setup", url: "https://evil.example/" });
            await setup;
        });
        expect(result.current.error).toBe("billing.errors.unknown");
        await act(async () => {
            expect(await result.current.createSetup()).toContain("https://checkout.stripe.com/");
        });
        expect(api.createBillingSetup.mock.calls[0][0]).toBe(
            api.createBillingSetup.mock.calls[1][0],
        );
        await act(async () => {
            await result.current.createSetup();
        });
        expect(api.createBillingSetup.mock.calls[2][0]).not.toBe(
            api.createBillingSetup.mock.calls[1][0],
        );
    });
    it("ignores setup redirects and old snapshots after switching account", async () => {
        const { result, rerender } = renderHook(({ owner }) => useBilling(owner, null), {
            initialProps: { owner: 1 },
        });
        await ready(result);
        const late = deferred<{ id: string; url: string }>();
        api.createBillingSetup.mockReturnValueOnce(late.promise);
        let setup!: Promise<string | null>;
        act(() => {
            setup = result.current.createSetup();
        });
        rerender({ owner: 2 });
        await ready(result);
        await act(async () => {
            late.resolve({ id: "cs_test_old", url: "https://checkout.stripe.com/c/pay/old" });
            expect(await setup).toBeNull();
        });
        expect(result.current.busy).toBe(false);
    });
    it("pauses desktop I/O and refreshes on recovery", async () => {
        connection = { isDesktop: true, status: "offline" };
        const { result, rerender } = renderHook(() => useBilling(1, null));
        expect(api.getBillingConfig).not.toHaveBeenCalled();
        await act(async () => {
            expect(await result.current.createSetup()).toBeNull();
        });
        connection = { isDesktop: true, status: "online" };
        rerender();
        await ready(result);
        expect(api.getBillingConfig).toHaveBeenCalledTimes(1);
        expect(api.listBillingPaymentMethods).toHaveBeenCalledTimes(2);
    });
    it("paginates only the requested method type and removes duplicate records", async () => {
        const card = { id: "pm_first", type: "card", brand: "visa", last4: "4242" };
        api.listBillingPaymentMethods.mockImplementation(async (type: string, cursor?: string) =>
            type === "link"
                ? empty
                : cursor
                  ? { items: [card, { ...card, id: "pm_second" }], has_more: false }
                  : { items: [card], has_more: true, next_cursor: "pm_first" },
        );
        const { result } = renderHook(() => useBilling(1, null));
        await ready(result);
        await act(async () => {
            await result.current.loadMore("card");
        });
        expect(api.listBillingPaymentMethods).toHaveBeenLastCalledWith("card", "pm_first");
        expect(result.current.methods.card.items.map((item) => item.id)).toEqual([
            "pm_first",
            "pm_second",
        ]);
    });
    it("recovers from a provider failure with bounded loading and no false empty success", async () => {
        api.getBillingConfig.mockRejectedValueOnce(new Error("offline"));
        const { result } = renderHook(() => useBilling(1, null));
        await ready(result);
        expect(result.current.error).toBe("billing.errors.unknown");
        expect(api.listBillingPaymentMethods).not.toHaveBeenCalled();
        await act(async () => {
            await result.current.reload();
        });
        expect(result.current.error).toBeNull();
    });
});

describe("native billing action ownership", () => {
    it("locks native mutations and ignores completion after changing account", async () => {
        const pending = deferred<{ id: string; client_secret: string }>();
        api.createBillingCardSetup.mockReturnValue(pending.promise);
        const { result, rerender } = renderHook(({ owner }) => useBilling(owner, null), {
            initialProps: { owner: 1 },
        });
        await waitFor(() => expect(result.current.loading).toBe(false));
        let first!: ReturnType<typeof result.current.startCard>;
        act(() => {
            first = result.current.startCard();
        });
        await act(async () => {
            expect(await result.current.startCard()).toBeNull();
        });
        expect(api.createBillingCardSetup).toHaveBeenCalledTimes(1);
        rerender({ owner: 2 });
        await act(async () => {
            pending.resolve({ id: "seti_old", client_secret: "secret" });
            expect(await first).toBeNull();
        });
    });
});
