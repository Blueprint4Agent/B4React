import { useCallback, useEffect, useRef, useState } from "react";
import {
    useBillingApi,
    type BillingConfig,
    type BillingProfileForm,
    type BillingMethodForm,
    type BillingProfile,
    type BillingInvoices,
    type BillingPortalForm,
    type BillingMethodType,
    type BillingPaymentMethods,
} from "./useBillingApi";
import { useServerConnectivity } from "../../connectivity/useServerConnectivity";

type Methods = Record<BillingMethodType, BillingPaymentMethods>;
const emptyMethods = (): Methods => ({
    card: { items: [], has_more: false },
    link: { items: [], has_more: false },
});
export type BillingNotice = "registered" | "pending" | "expired" | "cancelled" | null;

/** All snapshots/actions belong to one mounted account page; ignore obsolete async results. */
export function useBilling(
    ownerId: number,
    returnSession: string | null,
    returnIntent: string | null = null,
) {
    const api = useBillingApi();
    const { isDesktop, status } = useServerConnectivity();
    const available = !isDesktop || status === "online";
    const [profile, setProfile] = useState<BillingProfile | null>(null);
    const [invoices, setInvoices] = useState<BillingInvoices | null>(null);
    const [config, setConfig] = useState<BillingConfig | null>(null);
    const [methods, setMethods] = useState<Methods>(emptyMethods);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<BillingNotice>(null);
    const [busy, setBusy] = useState(false);
    const [moreBusy, setMoreBusy] = useState<BillingMethodType | null>(null);
    const epoch = useRef(0);
    const loadId = useRef(0);
    const mounted = useRef(false);
    const online = useRef(available);
    online.current = available;
    const actionLock = useRef(false);
    const pageLock = useRef(false);
    const nativeRequest = useRef<{ key: string; id: string } | null>(null);
    const retryId = useRef<string | null>(null);
    const errorKey = useCallback(
        (cause: unknown) => `billing.errors.${api.extractBillingErrorCode(cause) ?? "unknown"}`,
        [api],
    );
    const current = useCallback(
        (generation: number) => mounted.current && epoch.current === generation && online.current,
        [],
    );

    useEffect(() => {
        mounted.current = true;
        ++epoch.current;
        retryId.current = null;
        nativeRequest.current = null;
        actionLock.current = false;
        pageLock.current = false;
        setConfig(null);
        setProfile(null);
        setInvoices(null);
        setMethods(emptyMethods());
        setError(null);
        setNotice(null);
        setBusy(false);
        setMoreBusy(null);
        return () => {
            mounted.current = false;
            ++epoch.current;
            ++loadId.current;
        };
    }, [ownerId]);

    const reload = useCallback(async () => {
        if (!mounted.current || !online.current) return;
        const generation = epoch.current;
        const request = ++loadId.current;
        setLoading(true);
        setError(null);
        setNotice(null);
        try {
            const next = await api.getBillingConfig();
            if (!current(generation) || request !== loadId.current) return;
            setConfig(next);
            if (!next.enabled) {
                setMethods(emptyMethods());
                return;
            }
            if (returnIntent) {
                if (!/^seti_[A-Za-z0-9]{1,252}$/.test(returnIntent))
                    throw new Error("Invalid setup reference");
                const result = await api.getBillingCardSetupStatus(returnIntent);
                if (!current(generation) || request !== loadId.current) return;
                setNotice(result.registered ? "registered" : "pending");
            } else if (returnSession === "cancelled") setNotice("cancelled");
            else if (returnSession) {
                if (!/^cs_[A-Za-z0-9_]{1,252}$/.test(returnSession))
                    throw new Error("Invalid setup reference");
                const result = await api.getBillingSetupStatus(returnSession);
                if (!current(generation) || request !== loadId.current) return;
                setNotice(
                    result.registered
                        ? "registered"
                        : result.status === "expired"
                          ? "expired"
                          : "pending",
                );
            }
            const [card, link, nextProfile, nextInvoices] = await Promise.all([
                api.listBillingPaymentMethods("card"),
                api.listBillingPaymentMethods("link"),
                api.getBillingProfile(),
                api.getBillingInvoices(),
            ]);
            if (current(generation) && request === loadId.current) {
                setMethods({ card, link });
                setProfile(nextProfile);
                setInvoices(nextInvoices);
            }
        } catch (cause) {
            if (current(generation) && request === loadId.current) setError(errorKey(cause));
        } finally {
            if (current(generation) && request === loadId.current) setLoading(false);
        }
    }, [api, current, errorKey, returnSession, returnIntent]);

    useEffect(() => {
        if (available) void reload();
        else {
            ++loadId.current;
            setLoading(false);
        }
    }, [available, ownerId, reload]);
    useEffect(() => {
        const refresh = () => {
            if (document.visibilityState !== "hidden") void reload();
        };
        window.addEventListener("focus", refresh);
        window.addEventListener("online", refresh);
        return () => {
            window.removeEventListener("focus", refresh);
            window.removeEventListener("online", refresh);
        };
    }, [reload]);

    const createSetup = useCallback(async (): Promise<string | null> => {
        if (!mounted.current || !online.current || !config?.enabled || actionLock.current)
            return null;
        const generation = epoch.current;
        actionLock.current = true;
        setBusy(true);
        setError(null);
        try {
            retryId.current ??= crypto.randomUUID();
            const result = await api.createBillingSetup(retryId.current);
            if (!current(generation)) return null;
            const url = new URL(result.url);
            if (
                url.protocol !== "https:" ||
                url.hostname !== "checkout.stripe.com" ||
                url.username ||
                url.password
            )
                throw new Error("Invalid hosted checkout URL");
            retryId.current = null;
            return url.href;
        } catch (cause) {
            if (current(generation)) setError(errorKey(cause));
            return null;
        } finally {
            if (mounted.current && epoch.current === generation) {
                actionLock.current = false;
                setBusy(false);
            }
        }
    }, [api, config?.enabled, current, errorKey]);

    const loadMore = useCallback(
        async (type: BillingMethodType) => {
            const cursor = methods[type].next_cursor;
            if (!mounted.current || !online.current || loading || pageLock.current || !cursor)
                return;
            const generation = epoch.current;
            const request = loadId.current;
            pageLock.current = true;
            setMoreBusy(type);
            setError(null);
            try {
                const response = await api.listBillingPaymentMethods(type, cursor);
                if (current(generation) && request === loadId.current)
                    setMethods((previous) => ({
                        ...previous,
                        [type]: {
                            ...response,
                            items: [
                                ...new Map(
                                    [...previous[type].items, ...response.items].map((item) => [
                                        item.id,
                                        item,
                                    ]),
                                ).values(),
                            ],
                        },
                    }));
            } catch (cause) {
                if (current(generation) && request === loadId.current) setError(errorKey(cause));
            } finally {
                if (mounted.current && epoch.current === generation) {
                    pageLock.current = false;
                    setMoreBusy(null);
                }
            }
        },
        [api, current, errorKey, loading, methods],
    );

    const openPortal = useCallback(
        async (flow: BillingPortalForm["flow"]) => {
            if (
                !mounted.current ||
                !online.current ||
                !profile?.portal_enabled ||
                actionLock.current
            )
                return null;
            const generation = epoch.current;
            actionLock.current = true;
            setBusy(true);
            setError(null);
            try {
                const result = await api.createBillingPortal({
                    flow,
                    request_id: crypto.randomUUID(),
                });
                if (!current(generation)) return null;
                const url = new URL(result.url);
                if (
                    url.protocol !== "https:" ||
                    url.hostname !== "billing.stripe.com" ||
                    url.username ||
                    url.password ||
                    url.port
                )
                    throw new Error("Invalid portal URL");
                return url.href;
            } catch (cause) {
                if (current(generation)) setError(errorKey(cause));
                return null;
            } finally {
                if (mounted.current && epoch.current === generation) {
                    actionLock.current = false;
                    setBusy(false);
                }
            }
        },
        [api, profile, current, errorKey],
    );
    const nativeAction = useCallback(
        async <T>(
            key: string,
            operation: (id: string) => Promise<T>,
            refresh = true,
        ): Promise<T | null> => {
            if (!mounted.current || !online.current || actionLock.current) return null;
            const generation = epoch.current;
            actionLock.current = true;
            setBusy(true);
            setError(null);
            if (nativeRequest.current?.key !== key)
                nativeRequest.current = { key, id: crypto.randomUUID() };
            try {
                const result = await operation(nativeRequest.current.id);
                if (!current(generation)) return null;
                nativeRequest.current = null;
                if (refresh) await reload();
                return current(generation) ? result : null;
            } catch (cause) {
                if (current(generation)) setError(errorKey(cause));
                return null;
            } finally {
                if (mounted.current && epoch.current === generation) {
                    actionLock.current = false;
                    setBusy(false);
                }
            }
        },
        [current, errorKey, reload],
    );
    const saveProfile = (draft: Omit<BillingProfileForm, "request_id">) =>
        nativeAction(JSON.stringify(draft), (id) =>
            api.updateBillingProfile({ ...draft, request_id: id }),
        );
    const manageMethod = (methodId: string, action: BillingMethodForm["action"]) =>
        nativeAction(`${methodId}:${action}`, (id) =>
            api.manageBillingMethod(methodId, { action, request_id: id }),
        );
    const startCard = () =>
        nativeAction("card-setup", (id) => api.createBillingCardSetup(id), false);
    const finishCard = (intentId: string) =>
        nativeAction(`card-status:${intentId}`, () => api.getBillingCardSetupStatus(intentId));
    const clearError = () => setError(null);
    return {
        saveProfile,
        manageMethod,
        startCard,
        finishCard,
        clearError,
        profile,
        invoices,
        openPortal,
        config,
        methods,
        loading,
        error,
        notice,
        busy,
        moreBusy,
        available,
        reload,
        createSetup,
        loadMore,
    };
}
