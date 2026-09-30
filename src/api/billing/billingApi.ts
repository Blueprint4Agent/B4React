import type { components } from "../generated/openapi";
import { apiClient, getAuthHeader } from "../http";

export type BillingConfig = components["schemas"]["BillingConfigResponse"];
export type BillingSetup = components["schemas"]["BillingSetupResponse"];
export type BillingSetupStatus = components["schemas"]["BillingSetupStatusResponse"];
export type BillingPaymentMethods = components["schemas"]["BillingPaymentMethodsResponse"];
export type BillingMethodType = components["schemas"]["BillingPaymentMethodResponse"]["type"];

export async function getBillingConfig(): Promise<BillingConfig> {
    const { data, error } = await apiClient.GET("/api/v1/billing/config", {
        headers: getAuthHeader(),
    });
    if (error || !data) throw error;
    return data;
}

/** The caller creates one UUID per action and reuses it on ambiguous retries. */
export async function createBillingSetup(requestId: string): Promise<BillingSetup> {
    const { data, error } = await apiClient.POST("/api/v1/billing/setup-sessions", {
        headers: getAuthHeader(),
        body: { request_id: requestId },
    });
    if (error || !data) throw error;
    return data;
}

/** A return-URL parameter alone is never proof of successful registration. */
export async function getBillingSetupStatus(sessionId: string): Promise<BillingSetupStatus> {
    const { data, error } = await apiClient.GET("/api/v1/billing/setup-sessions/{session_id}", {
        headers: getAuthHeader(),
        params: { path: { session_id: sessionId } },
    });
    if (error || !data) throw error;
    return data;
}

export async function listBillingPaymentMethods(
    methodType: BillingMethodType = "card",
    startingAfter?: string,
    limit = 20,
): Promise<BillingPaymentMethods> {
    const { data, error } = await apiClient.GET("/api/v1/billing/payment-methods", {
        headers: getAuthHeader(),
        params: {
            query: { method_type: methodType, starting_after: startingAfter, limit },
        },
    });
    if (error || !data) throw error;
    return data;
}
