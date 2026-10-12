import type { components } from "../generated/openapi";
import { apiClient, getAuthHeader } from "../http";

export type AdminStatus = components["schemas"]["AdminStatusResponse"];

export class AdminStatusError extends Error {
    constructor(readonly status: number) {
        super("Unable to load admin status");
    }
}

export async function getAdminStatus(signal: AbortSignal, demo = false): Promise<AdminStatus> {
    const { data, error, response } = await apiClient.GET(
        demo ? "/api/v1/admin/demo/status" : "/api/v1/admin/status",
        {
            headers: getAuthHeader(),
            signal,
            cache: "no-store",
        },
    );
    if (error || !data) throw new AdminStatusError(response.status);
    return data;
}

export async function getDemoUsers(
    query: import("../auth/authApi").AdminUserQuery,
    signal: AbortSignal,
) {
    const { data, error, response } = await apiClient.GET("/api/v1/admin/demo/users", {
        params: { query },
        signal,
        cache: "no-store",
    });
    if (error || !data) throw new AdminStatusError(response.status);
    return data;
}
