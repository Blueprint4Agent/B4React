import type { components } from "../generated/openapi";

export type BillingErrorCode = components["schemas"]["BillingErrorDetail"]["error"];

const BILLING_ERROR_CODES = new Set<BillingErrorCode>([
    "BILLING_DISABLED",
    "BILLING_UNAVAILABLE",
    "BILLING_NOT_FOUND",
    "BILLING_RECONCILIATION_REQUIRED",
]);

/** Consumers map known codes to localized UI copy instead of displaying raw errors. */
export function extractBillingErrorCode(error: unknown): BillingErrorCode | null {
    if (!error || typeof error !== "object" || !("detail" in error)) return null;
    const detail = error.detail;
    if (!detail || typeof detail !== "object" || !("error" in detail)) return null;
    const code = detail.error;
    return typeof code === "string" && BILLING_ERROR_CODES.has(code as BillingErrorCode)
        ? (code as BillingErrorCode)
        : null;
}
