import type { components } from "../generated/openapi";
import { apiClient, getAuthHeader } from "../http";

export type AdminStatus = components["schemas"]["AdminStatusResponse"];

export class AdminStatusError extends Error {
    constructor(readonly status: number) {
        super("Unable to load admin status");
    }
}

export async function getAdminStatus(signal: AbortSignal): Promise<AdminStatus> {
    const { data, error, response } = await apiClient.GET("/api/v1/admin/status", {
        headers: getAuthHeader(),
        signal,
        cache: "no-store",
    });
    if (error || !data) throw new AdminStatusError(response.status);
    return data;
}
