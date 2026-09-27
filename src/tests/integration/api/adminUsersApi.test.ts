import { afterEach, expect, it, vi } from "vitest";
import { listAdminUsers } from "../../../api/auth/authApi";
import { apiClient } from "../../../api/http";
import { clearAccessToken, setAccessToken } from "../../../store/session";

afterEach(() => {
    vi.restoreAllMocks();
    clearAccessToken();
});
it("loads the administrator directory with authentication, filters and cancellation", async () => {
    // Given: the typed client returns an empty page.
    const data = {
        items: [],
        total: 0,
        page: 1,
        page_size: 10,
        summary: { total_users: 0, active_users: 0, admin_users: 0 },
    };
    const request = vi
        .spyOn(apiClient, "GET")
        .mockResolvedValue({ data, response: new Response() } as never);
    setAccessToken("test-admin-token");
    const signal = new AbortController().signal;
    const query = { search: "member", page: 1, page_size: 10 };
    // When/Then: the wrapper forwards query parameters, authentication and cancellation.
    await expect(listAdminUsers(query, signal)).resolves.toEqual(data);
    expect(request).toHaveBeenCalledWith("/api/v1/auth/admin/users", {
        params: { query },
        signal,
        headers: { Authorization: "Bearer test-admin-token" },
    });
});
