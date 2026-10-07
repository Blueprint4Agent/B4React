import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useAdminStatus } from "../../../hooks/api/admin/useAdminStatus";
import { AdminStatusError } from "../../../api/admin/adminApi";

const mock = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock("../../../api/admin/adminApi", async (original) => ({
    ...(await original<typeof import("../../../api/admin/adminApi")>()),
    getAdminStatus: mock.fetch,
}));
vi.mock("../../../hooks/connectivity/useServerConnectivity", () => ({
    useServerConnectivity: () => ({ isDesktop: false, status: "online" }),
}));
afterEach(() => {
    vi.clearAllMocks();
});
it("cancels former owner requests and clears protected snapshots on forbidden refresh", async () => {
    let resolve: ((value: unknown) => void) | undefined;
    mock.fetch.mockImplementationOnce(
        () =>
            new Promise((done) => {
                resolve = done;
            }),
    );
    const { result, rerender, unmount } = renderHook(({ owner }) => useAdminStatus(owner), {
        initialProps: { owner: 1 },
    });
    const signal = mock.fetch.mock.calls[0][0] as AbortSignal;
    mock.fetch.mockResolvedValueOnce({ status: "ok" });
    rerender({ owner: 2 });
    expect(signal.aborted).toBe(true);
    await waitFor(() => expect(result.current.data?.status).toBe("ok"));
    await act(async () => {
        resolve?.({ status: "degraded" });
    });
    expect(result.current.data?.status).toBe("ok");
    mock.fetch.mockRejectedValueOnce(new AdminStatusError(403));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.failed).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.stale).toBe(false);
    unmount();
});
it("coalesces focus requests while a probe is in flight", async () => {
    mock.fetch.mockImplementation(() => new Promise(() => {}));
    const { unmount } = renderHook(() => useAdminStatus(1));
    act(() => {
        window.dispatchEvent(new Event("focus"));
        window.dispatchEvent(new Event("online"));
    });
    expect(mock.fetch).toHaveBeenCalledTimes(1);
    const signal = mock.fetch.mock.calls[0][0] as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
});
