import { apiClient, getAuthHeader } from "../http";
import type { components } from "../generated/openapi";
export type InboxItem = components["schemas"]["InboxItem"];
export type InboxPage = components["schemas"]["InboxPage"];
export type InboxSummary = components["schemas"]["InboxSummary"];
export async function getInbox(
    page: number,
    unreadOnly: boolean,
    signal: AbortSignal,
): Promise<InboxPage> {
    const { data, error } = await apiClient.GET("/api/v1/inbox", {
        headers: getAuthHeader(),
        params: { query: { page, page_size: 20, unread_only: unreadOnly } },
        signal,
        cache: "no-store",
    });
    if (error || !data || !Array.isArray(data.items)) throw new Error("inbox_unavailable");
    return data;
}
export async function getInboxSummary(signal: AbortSignal): Promise<InboxSummary> {
    const { data, error } = await apiClient.GET("/api/v1/inbox/summary", {
        headers: getAuthHeader(),
        signal,
        cache: "no-store",
    });
    if (error || !data || typeof data.unread_count !== "number")
        throw new Error("inbox_unavailable");
    return data;
}
export async function readInbox(id: number, signal: AbortSignal): Promise<void> {
    const { error, response } = await apiClient.POST("/api/v1/inbox/{notification_id}/read", {
        headers: getAuthHeader(),
        params: { path: { notification_id: id } },
        signal,
    });
    if (error || !response.ok) throw new Error("inbox_write_failed");
}
export async function readAllInbox(throughId: number, signal: AbortSignal): Promise<void> {
    const { error, response } = await apiClient.POST("/api/v1/inbox/read-all", {
        headers: getAuthHeader(),
        body: { through_id: throughId },
        signal,
    });
    if (error || !response.ok) throw new Error("inbox_write_failed");
}
