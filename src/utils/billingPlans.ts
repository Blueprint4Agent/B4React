import type { BillingSubscription } from "../api/billing/billingApi";

export type SubscriptionTier = "free" | "plus" | "pro";
export type BillingInterval = "monthly" | "annual";
export function planFor(tier: SubscriptionTier, interval: BillingInterval) {
    return tier === "free"
        ? "free"
        : tier === "plus"
          ? interval
          : interval === "monthly"
            ? "pro_monthly"
            : "pro_annual";
}
export function tierFor(plan: BillingSubscription["plan"]): SubscriptionTier | null {
    if (plan === "free") return "free";
    if (plan === "monthly" || plan === "annual") return "plus";
    if (plan === "pro_monthly" || plan === "pro_annual") return "pro";
    return null;
}

// Invalidation only: consumers re-read the authenticated server snapshot.
export const SUBSCRIPTION_CHANGED = "b4a:subscription-changed";

export function openSubscriptionPayment(url: string | null | undefined) {
    if (!url) return;
    try {
        const parsed = new URL(url);
        if (
            parsed.protocol === "https:" &&
            ["invoice.stripe.com", "pay.stripe.com"].includes(parsed.hostname) &&
            !parsed.username &&
            !parsed.password &&
            !parsed.port
        )
            window.open(parsed.href, "_blank", "noopener,noreferrer");
    } catch {
        /* Invalid provider URL: keep the current page. */
    }
}
