import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminUsers } from "../../../hooks/api/auth/useAdminUsers";
import * as authApi from "../../../api/auth/authApi";

let connectivity = "online";
vi.mock("../../../hooks/connectivity/useServerConnectivity", () => ({
    useServerConnectivity: () => ({ isDesktop: true, status: connectivity }),
}));
const query = { page: 1, page_size: 10 };
const payload = (total: number): authApi.AdminUserList => ({
    items: [],
    total,
    page: 1,
    page_size: 10,
    summary: { total_users: total, active_users: total, admin_users: 1, manager_users: 0 },
});

describe("admin user directory state", () => {
    beforeEach(() => {
        connectivity = "online";
    });
    afterEach(() => vi.restoreAllMocks());
    it("pauses offline requests and refreshes on recovery", async () => {
        // Given: a desktop connection is unavailable.
        connectivity = "offline";
        const request = vi
            .spyOn(authApi, "listAdminUsers")
            .mockResolvedValueOnce(payload(1))
            .mockResolvedValueOnce(payload(2));
        const { result, rerender } = renderHook(() => useAdminUsers(1, query));
        expect(request).not.toHaveBeenCalled();
        // When: desktop connectivity returns.
        connectivity = "online";
        rerender();
        await waitFor(() => expect(result.current.data?.total).toBe(1));
        connectivity = "offline";
        rerender();
        expect(result.current.data?.total).toBe(1);
        connectivity = "online";
        rerender();
        // Then: recovery reloads the directory without clearing identity.
        await waitFor(() => expect(result.current.data?.total).toBe(2));
    });
    it("does not expose old data when account changes during a request", async () => {
        // Given: an old admin request is in flight.
        let release: (value: authApi.AdminUserList) => void = () => undefined;
        const pending = new Promise<authApi.AdminUserList>((resolve) => {
            release = resolve;
        });
        const request = vi
            .spyOn(authApi, "listAdminUsers")
            .mockReturnValueOnce(pending)
            .mockResolvedValueOnce(payload(2));
        const { result, rerender } = renderHook(({ owner }) => useAdminUsers(owner, query), {
            initialProps: { owner: 1 },
        });
        await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
        // When: the authenticated account changes before the old response completes.
        rerender({ owner: 2 });
        await waitFor(() => expect(result.current.data?.total).toBe(2));
        await act(async () => {
            release(payload(99));
            await pending;
        });
        // Then: the stale response cannot restore the previous account's data.
        expect(result.current.data?.total).toBe(2);
        expect(request.mock.calls[0][1]?.aborted).toBe(true);
    });
    it("clears sensitive results when the server revokes admin access", async () => {
        // Given: the directory was loaded successfully.
        const request = vi.spyOn(authApi, "listAdminUsers").mockResolvedValueOnce(payload(3));
        const { result } = renderHook(() => useAdminUsers(1, query));
        await waitFor(() => expect(result.current.data?.total).toBe(3));
        // When: a later request is forbidden.
        request.mockRejectedValueOnce({ detail: { error: "INSUFFICIENT_ROLE" } });
        act(() => result.current.reload());
        // Then: old user data is cleared and a localized error appears.
        await waitFor(() => expect(result.current.error).toBeTruthy());
        expect(result.current.data).toBeNull();
    });
});
