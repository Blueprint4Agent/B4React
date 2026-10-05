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

export type BillingPlans = components["schemas"]["BillingPlansResponse"];
export type BillingSubscription = components["schemas"]["BillingSubscriptionResponse"];
export type BillingCheckoutStatus = components["schemas"]["BillingCheckoutStatusResponse"];
export type BillingCheckoutForm = components["schemas"]["BillingCheckoutForm"];

export async function getBillingPlans(): Promise<BillingPlans> {
    const { data, error } = await apiClient.GET("/api/v1/billing/plans", {
        headers: getAuthHeader(),
    });
    if (error || !data) throw error;
    return data;
}
export async function getBillingSubscription(): Promise<BillingSubscription> {
    const { data, error } = await apiClient.GET("/api/v1/billing/subscription", {
        headers: getAuthHeader(),
    });
    if (error || !data) throw error;
    return data;
}
export async function createBillingCheckout(body: BillingCheckoutForm): Promise<BillingSetup> {
    const { data, error } = await apiClient.POST("/api/v1/billing/checkout-sessions", {
        headers: getAuthHeader(),
        body,
    });
    if (error || !data) throw error;
    return data;
}
export async function getBillingCheckoutStatus(sessionId: string): Promise<BillingCheckoutStatus> {
    const { data, error } = await apiClient.GET("/api/v1/billing/checkout-sessions/{session_id}", {
        headers: getAuthHeader(),
        params: { path: { session_id: sessionId } },
    });
    if (error || !data) throw error;
    return data;
}

export type BillingChangeForm = components["schemas"]["BillingChangeForm"];
export async function changeBillingSubscription(
    body: BillingChangeForm,
): Promise<BillingSubscription> {
    const { data, error } = await apiClient.POST("/api/v1/billing/subscription/change", {
        headers: getAuthHeader(),
        body,
    });
    if (error || !data) throw error;
    return data;
}

export type BillingProfile = components["schemas"]["BillingProfileResponse"];
export type BillingInvoices = components["schemas"]["BillingInvoicesResponse"];
export type BillingPortalForm = components["schemas"]["BillingPortalForm"];
export async function getBillingProfile(): Promise<BillingProfile> {
    const { data, error } = await apiClient.GET("/api/v1/billing/profile", {
        headers: getAuthHeader(),
    });
    if (error || !data) throw error;
    return data;
}
export async function getBillingInvoices(): Promise<BillingInvoices> {
    const { data, error } = await apiClient.GET("/api/v1/billing/invoices", {
        headers: getAuthHeader(),
    });
    if (error || !data) throw error;
    return data;
}
export async function createBillingPortal(body: BillingPortalForm): Promise<BillingSetup> {
    const { data, error } = await apiClient.POST("/api/v1/billing/portal-sessions", {
        headers: getAuthHeader(),
        body,
    });
    if (error || !data) throw error;
    return data;
}

export type BillingProfileForm = components["schemas"]["BillingProfileForm"];
export type BillingMethodForm = components["schemas"]["BillingMethodForm"];
export type BillingCardSetup = components["schemas"]["BillingCardSetupResponse"];
export async function updateBillingProfile(body: BillingProfileForm): Promise<BillingProfile> {
    const { data, error } = await apiClient.PUT("/api/v1/billing/profile", {
        headers: getAuthHeader(),
        body,
    });
    if (error || !data) throw error;
    return data;
}
export async function manageBillingMethod(
    methodId: string,
    body: BillingMethodForm,
): Promise<BillingProfile> {
    const { data, error } = await apiClient.POST("/api/v1/billing/payment-methods/{method_id}", {
        headers: getAuthHeader(),
        params: { path: { method_id: methodId } },
        body,
    });
    if (error || !data) throw error;
    return data;
}
export async function createBillingCardSetup(requestId: string): Promise<BillingCardSetup> {
    const { data, error } = await apiClient.POST("/api/v1/billing/card-setups", {
        headers: getAuthHeader(),
        body: { request_id: requestId },
    });
    if (error || !data) throw error;
    return data;
}
export async function getBillingCardSetupStatus(intentId: string) {
    const { data, error } = await apiClient.GET("/api/v1/billing/card-setups/{intent_id}", {
        headers: getAuthHeader(),
        params: { path: { intent_id: intentId } },
    });
    if (error || !data) throw error;
    return data;
}
