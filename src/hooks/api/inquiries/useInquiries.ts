import { useCallback, useEffect, useRef, useState } from "react";
import {
    createInquiry,
    getInquiry,
    listInquiries,
    replyInquiry,
    statusInquiry,
    type InquiryDetail,
    type InquiryPage,
    type InquiryStatus,
} from "../../../api/inquiries/inquiriesApi";
import { useInboxContext } from "../inbox/InboxProvider";
import { useServerConnectivity } from "../../connectivity/useServerConnectivity";
export type { InquiryDetail, InquiryStatus } from "../../../api/inquiries/inquiriesApi";
export function useInquiries(
    owner: number,
    admin: boolean,
    page: number,
    status: InquiryStatus | undefined,
    selected: number | null,
) {
    const { revision, refresh } = useInboxContext();
    const { isDesktop, status: connectivity } = useServerConnectivity();
    const available = !isDesktop || connectivity === "online";
    const key = JSON.stringify([owner, admin, page, status, selected]);
    const [snapshot, setSnapshot] = useState<{
        key: string;
        list: InquiryPage;
        detail: InquiryDetail | null;
    } | null>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const mutation = useRef<AbortController | null>(null);
    const request = useRef<{ payload: string; id: string } | null>(null);
    useEffect(
        () => () => {
            mutation.current?.abort();
            mutation.current = null;
        },
        [owner],
    );
    useEffect(() => {
        if (!available) return;
        const controller = new AbortController();
        let current = true;
        setLoading(true);
        setError(false);
        void Promise.all([
            listInquiries(admin, page, status, controller.signal),
            selected ? getInquiry(selected, controller.signal) : Promise.resolve(null),
        ])
            .then(([list, detail]) => {
                if (current) setSnapshot({ key, list, detail });
            })
            .catch(() => {
                if (current) {
                    setSnapshot(null);
                    setError(true);
                }
            })
            .finally(() => {
                if (current) setLoading(false);
            });
        return () => {
            current = false;
            controller.abort();
        };
    }, [available, key, admin, page, status, selected, revision]);
    const submit = useCallback(
        async (
            kind: "create" | "reply" | "status",
            input: { subject?: string; body?: string; status?: InquiryStatus },
        ) => {
            if (!available || mutation.current) return null;
            const controller = new AbortController();
            mutation.current = controller;
            setBusy(true);
            setError(false);
            const payload = JSON.stringify([owner, selected, kind, input]);
            if (request.current?.payload !== payload)
                request.current = { payload, id: crypto.randomUUID() };
            try {
                const result =
                    kind === "create"
                        ? await createInquiry(
                              input.subject!,
                              input.body!,
                              request.current.id,
                              controller.signal,
                          )
                        : kind === "reply"
                          ? await replyInquiry(
                                selected!,
                                input.body!,
                                request.current.id,
                                controller.signal,
                            )
                          : await statusInquiry(selected!, input.status!, controller.signal);
                if (controller.signal.aborted) return null;
                request.current = null;
                refresh();
                return result;
            } catch {
                if (!controller.signal.aborted) setError(true);
                return null;
            } finally {
                if (!controller.signal.aborted) {
                    mutation.current = null;
                    setBusy(false);
                }
            }
        },
        [owner, available, selected, refresh],
    );
    return {
        list: snapshot?.key === key ? snapshot.list : null,
        detail: snapshot?.key === key ? snapshot.detail : null,
        loading,
        busy,
        error,
        available,
        submit,
        reload: refresh,
    };
}
