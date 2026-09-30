import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "../../../api/http";
import { useBillingApi } from "../../../hooks/api/billing/useBillingApi";
import { extractBillingErrorCode } from "../../../api/billing/billingError";

vi.mock("../../../api/http", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../../api/http")>()),
    getAuthHeader: () => ({ Authorization: "Bearer fixture" }),
}));

afterEach(() => vi.restoreAllMocks());

describe("billing foundation", () => {
    it("does not fetch on render and retains adapter identity", () => {
        const get = vi.spyOn(apiClient, "GET");
        const post = vi.spyOn(apiClient, "POST");
        const { result, rerender } = renderHook(useBillingApi);
        const previous = result.current;
        rerender();
        expect(result.current).toBe(previous);
        expect(get).not.toHaveBeenCalled();
        expect(post).not.toHaveBeenCalled();
    });

    it("retains the caller UUID for a retry and supplies bearer authentication", async () => {
        const post = vi.spyOn(apiClient, "POST").mockResolvedValue({
            data: { id: "cs_test_fixture", url: "https://checkout.stripe.com/x" },
            response: new Response(),
        } as never);
        const { result } = renderHook(useBillingApi);
        const id = "9a3f996f-7e30-4be4-8d74-86f4d8366b29";
        await result.current.createBillingSetup(id);
        await result.current.createBillingSetup(id);
        expect(post.mock.calls[0]).toEqual(post.mock.calls[1]);
        expect(post).toHaveBeenCalledWith("/api/v1/billing/setup-sessions", {
            headers: { Authorization: "Bearer fixture" },
            body: { request_id: id },
        });
    });

    it("passes the Link cursor and verifies setup with the provider API", async () => {
        const get = vi
            .spyOn(apiClient, "GET")
            .mockResolvedValueOnce({
                data: { items: [], has_more: false, next_cursor: null },
                response: new Response(),
            } as never)
            .mockResolvedValueOnce({
                data: { id: "cs_test_fixture", status: "open", registered: false },
                response: new Response(),
            } as never);
        const { result } = renderHook(useBillingApi);
        await result.current.listBillingPaymentMethods("link", "pm_previous", 10);
        expect(get).toHaveBeenCalledWith("/api/v1/billing/payment-methods", {
            headers: { Authorization: "Bearer fixture" },
            params: { query: { method_type: "link", starting_after: "pm_previous", limit: 10 } },
        });
        const status = await result.current.getBillingSetupStatus("cs_test_fixture");
        expect(status.registered).toBe(false);
        expect(get).toHaveBeenLastCalledWith("/api/v1/billing/setup-sessions/{session_id}", {
            headers: { Authorization: "Bearer fixture" },
            params: { path: { session_id: "cs_test_fixture" } },
        });
    });

    it("preserves typed provider failures and ignores unrecognized error text", async () => {
        const failure = { detail: { error: "BILLING_DISABLED", message: "ignored" } };
        vi.spyOn(apiClient, "GET").mockResolvedValue({
            error: failure,
            response: new Response(),
        } as never);
        const { result } = renderHook(useBillingApi);
        await expect(result.current.getBillingConfig()).rejects.toBe(failure);
        expect(extractBillingErrorCode(failure)).toBe("BILLING_DISABLED");
        expect(extractBillingErrorCode({ detail: { error: "sensitive" } })).toBeNull();
        expect(extractBillingErrorCode(null)).toBeNull();
    });
});
