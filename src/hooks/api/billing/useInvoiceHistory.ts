import { useServerConnectivity } from "../../connectivity/useServerConnectivity";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBillingApi } from "./useBillingApi";
import type { BillingInvoices, BillingInvoiceDetail } from "../../../api/billing/billingApi";
import { useAppConfig } from "../../useFeatures";

export function useInvoiceHistory(ownerId: number) {
    const api = useBillingApi();
    const { data: config } = useAppConfig();
    const [visible, setVisible] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [invoices, setInvoices] = useState<BillingInvoices | null>(null);
    const [detail, setDetail] = useState<BillingInvoiceDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const epoch = useRef(0);
    const request = useRef(0);
    const lock = useRef(false);
    const { isDesktop, status } = useServerConnectivity();
    const available = config?.billing_enabled === true && (!isDesktop || status === "online");
    useEffect(() => {
        ++epoch.current;
        setVisible(false);
        setLoading(false);
        setError(null);
        lock.current = false;
        setInvoices(null);
        setDetail(null);
        return () => {
            ++epoch.current;
        };
    }, [ownerId, available]);
    const load = useCallback(
        async (id: string | null, cursor?: string) => {
            if (!available || (cursor && lock.current)) return;
            const generation = epoch.current;
            const sequence = ++request.current;
            lock.current = true;
            setLoading(true);
            setError(null);
            try {
                if (id) {
                    const value = await api.getBillingInvoiceDetail(id);
                    if (generation === epoch.current && sequence === request.current)
                        setDetail(value);
                } else {
                    const value = await api.getBillingInvoices(20, cursor);
                    if (generation === epoch.current && sequence === request.current)
                        setInvoices((previous) =>
                            cursor && previous
                                ? {
                                      ...value,
                                      items: [
                                          ...new Map(
                                              [...previous.items, ...value.items].map((item) => [
                                                  item.id,
                                                  item,
                                              ]),
                                          ).values(),
                                      ],
                                  }
                                : value,
                        );
                }
            } catch (cause) {
                if (generation === epoch.current && sequence === request.current)
                    setError(`billing.errors.${api.extractBillingErrorCode(cause) ?? "unknown"}`);
            } finally {
                if (generation === epoch.current && sequence === request.current) {
                    lock.current = false;
                    setLoading(false);
                }
            }
        },
        [api, available],
    );
    const open = (id: string | null = null) => {
        setSelected(id);
        setDetail(null);
        setVisible(true);
        void load(id);
    };
    const close = () => {
        ++request.current;
        lock.current = false;
        setVisible(false);
    };
    return {
        visible,
        selected,
        invoices,
        detail,
        loading,
        error,
        open,
        close,
        retry: () => load(selected),
        more: () => load(null, invoices?.next_cursor ?? undefined),
    };
}
