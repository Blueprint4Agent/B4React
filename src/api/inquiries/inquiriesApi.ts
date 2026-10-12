import { apiClient, getAuthHeader } from "../http";
import type { components } from "../generated/openapi";
export type InquiryDetail = components["schemas"]["InquiryDetail"];
export type InquiryPage = components["schemas"]["InquiryPage"];
export type InquiryStatus = components["schemas"]["InquiryStatus"];
export async function listInquiries(
    admin: boolean,
    page: number,
    status: InquiryStatus | undefined,
    signal: AbortSignal,
): Promise<InquiryPage> {
    const { data, error } = await apiClient.GET(
        admin ? "/api/v1/inquiries/admin" : "/api/v1/inquiries",
        {
            headers: getAuthHeader(),
            params: { query: { page, page_size: 20, status } },
            signal,
            cache: "no-store",
        },
    );
    if (error || !data) throw new Error("inquiry_failed");
    return data;
}
export async function getInquiry(id: number, signal: AbortSignal): Promise<InquiryDetail> {
    const { data, error } = await apiClient.GET("/api/v1/inquiries/{inquiry_id}", {
        headers: getAuthHeader(),
        params: { path: { inquiry_id: id } },
        signal,
        cache: "no-store",
    });
    if (error || !data) throw new Error("inquiry_failed");
    return data;
}
export async function createInquiry(
    subject: string,
    body: string,
    request_id: string,
    signal: AbortSignal,
): Promise<InquiryDetail> {
    const { data, error } = await apiClient.POST("/api/v1/inquiries", {
        headers: getAuthHeader(),
        body: { subject, body, request_id },
        signal,
    });
    if (error || !data) throw new Error("inquiry_failed");
    return data;
}
export async function replyInquiry(
    id: number,
    body: string,
    request_id: string,
    signal: AbortSignal,
): Promise<InquiryDetail> {
    const { data, error } = await apiClient.POST("/api/v1/inquiries/{inquiry_id}/messages", {
        headers: getAuthHeader(),
        params: { path: { inquiry_id: id } },
        body: { body, request_id },
        signal,
    });
    if (error || !data) throw new Error("inquiry_failed");
    return data;
}
export async function statusInquiry(
    id: number,
    status: InquiryStatus,
    signal: AbortSignal,
): Promise<InquiryDetail> {
    const { data, error } = await apiClient.PATCH("/api/v1/inquiries/{inquiry_id}/status", {
        headers: getAuthHeader(),
        params: { path: { inquiry_id: id } },
        body: { status },
        signal,
    });
    if (error || !data) throw new Error("inquiry_failed");
    return data;
}
