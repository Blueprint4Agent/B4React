import { useCallback, useEffect, useRef, useState } from "react";
import { useServerConnectivity } from "../../connectivity/useServerConnectivity";
import {
    useBillingApi,
    type BillingChangeForm,
    type BillingPlans,
    type BillingSubscription,
    type BillingCheckoutForm,
} from "./useBillingApi";

/** Stripe snapshots only; a redirect/query never grants an entitlement. */
export function useSubscription(
    ownerId: number | undefined,
    returnSession: string | null = null,
    enabled = true,
    withPlans = false,
) {
    const api = useBillingApi();
    const { isDesktop, status } = useServerConnectivity();
    const available = enabled && !!ownerId && (!isDesktop || status === "online");
    const [subscription, setSubscription] = useState<BillingSubscription | null>(null);
    const [catalog, setCatalog] = useState<BillingPlans | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const generation = useRef(0);
    const sequence = useRef(0);
    const action = useRef(false);
    const retry = useRef<{ key: string; id: string } | null>(null);
    const active = useRef(false);
    const errorKey = useCallback(
        (cause: unknown) => `billing.errors.${api.extractBillingErrorCode(cause) ?? "unknown"}`,
        [api],
    );
    useEffect(() => {
        ++generation.current;
        active.current = available;
        setSubscription(null);
        setCatalog(null);
        setError(null);
        setNotice(null);
        setLoading(available);
        setBusy(false);
        action.current = false;
        retry.current = null;
        return () => {
            active.current = false;
            ++generation.current;
            ++sequence.current;
        };
    }, [ownerId, available]);
    const reload = useCallback(async () => {
        if (!available || !active.current) return;
        const epoch = generation.current;
        const request = ++sequence.current;
        const current = () =>
            active.current && generation.current === epoch && sequence.current === request;
        setLoading(true);
        setError(null);
        setNotice(null);
        try {
            if (withPlans) {
                const plans = await api.getBillingPlans();
                if (!current()) return;
                setCatalog(plans);
                if (!plans.enabled) return;
            }
            let nextNotice: string | null = null;
            if (returnSession === "cancelled") nextNotice = "cancelled";
            else if (returnSession) {
                if (!/^cs_[A-Za-z0-9_]{1,252}$/.test(returnSession))
                    throw new Error("Invalid checkout reference");
                const result = await api.getBillingCheckoutStatus(returnSession);
                if (!current()) return;
                nextNotice = result.paid
                    ? "paid"
                    : result.status === "expired"
                      ? "expired"
                      : "pending";
            }
            const next = await api.getBillingSubscription();
            if (current()) {
                setSubscription(next);
                setNotice(nextNotice);
            }
        } catch (cause) {
            if (current()) setError(errorKey(cause));
        } finally {
            if (current()) setLoading(false);
        }
    }, [available, ownerId, api, errorKey, returnSession, withPlans]);
    useEffect(() => {
        void reload();
        const recover = () => {
            if (!action.current) void reload();
        };
        window.addEventListener("focus", recover);
        window.addEventListener("online", recover);
        return () => {
            window.removeEventListener("focus", recover);
            window.removeEventListener("online", recover);
        };
    }, [reload]);
    const checkout = useCallback(
        async (plan: BillingCheckoutForm["plan"], currency: BillingCheckoutForm["currency"]) => {
            if (
                !available ||
                !active.current ||
                action.current ||
                loading ||
                !catalog?.enabled ||
                !subscription ||
                subscription.has_subscription
            )
                return null;
            const epoch = generation.current;
            const key = `${plan}:${currency}`;
            action.current = true;
            setBusy(true);
            setError(null);
            if (retry.current?.key !== key) retry.current = { key, id: crypto.randomUUID() };
            try {
                const result = await api.createBillingCheckout({
                    plan,
                    currency,
                    request_id: retry.current.id,
                });
                if (!active.current || generation.current !== epoch) return null;
                const url = new URL(result.url);
                if (
                    url.protocol !== "https:" ||
                    url.hostname !== "checkout.stripe.com" ||
                    url.username ||
                    url.password ||
                    url.port
                )
                    throw new Error("Invalid checkout destination");
                return url.href;
            } catch (cause) {
                if (active.current && generation.current === epoch) setError(errorKey(cause));
                return null;
            } finally {
                if (active.current && generation.current === epoch) {
                    action.current = false;
                    setBusy(false);
                }
            }
        },
        [available, loading, catalog, subscription, api, errorKey],
    );
    const change = useCallback(
        async (plan: BillingChangeForm["plan"], expectedVersion: string) => {
            if (!available || !active.current || action.current || !subscription?.can_manage)
                return false;
            const epoch = generation.current;
            action.current = true;
            ++sequence.current;
            setBusy(true);
            setError(null);
            const key = `change:${plan}:${expectedVersion}`;
            if (retry.current?.key !== key) retry.current = { key, id: crypto.randomUUID() };
            try {
                const next = await api.changeBillingSubscription({
                    plan,
                    expected_version: expectedVersion,
                    request_id: retry.current.id,
                });
                if (!active.current || generation.current !== epoch) return false;
                setSubscription(next);
                retry.current = null;
                return true;
            } catch (cause) {
                if (active.current && generation.current === epoch) {
                    setError(errorKey(cause));
                }
                return false;
            } finally {
                if (active.current && generation.current === epoch) {
                    action.current = false;
                    setBusy(false);
                    setLoading(false);
                }
            }
        },
        [available, subscription, api, errorKey],
    );
    return {
        subscription,
        catalog,
        loading,
        busy,
        error,
        notice,
        available,
        reload,
        checkout,
        change,
    };
}
