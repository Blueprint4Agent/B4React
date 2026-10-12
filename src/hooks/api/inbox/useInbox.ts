import { useCallback, useEffect, useRef, useState } from "react";
import { getInbox, readInbox, readAllInbox, type InboxPage } from "../../../api/inbox/inboxApi";
import { useInboxContext } from "./InboxProvider";
import { useServerConnectivity } from "../../connectivity/useServerConnectivity";
export type { InboxItem } from "../../../api/inbox/inboxApi";
export function useInbox(owner: number | undefined, page: number, unreadOnly: boolean) {
    const { revision, refresh } = useInboxContext();
    const { isDesktop, status } = useServerConnectivity();
    const available = owner !== undefined && (!isDesktop || status === "online");
    const key = JSON.stringify([owner, page, unreadOnly]);
    const [snapshot, setSnapshot] = useState<{ key: string; data: InboxPage } | null>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const mutation = useRef<AbortController | null>(null);
    useEffect(() => {
        setError(false);
        setBusy(false);
        return () => {
            mutation.current?.abort();
            mutation.current = null;
        };
    }, [owner]);
    useEffect(() => {
        if (!available) return;
        const controller = new AbortController();
        let current = true;
        setLoading(true);
        setError(false);
        void getInbox(page, unreadOnly, controller.signal)
            .then((data) => {
                if (current) setSnapshot({ key, data });
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
    }, [available, key, page, unreadOnly, revision]);
    const markRead = useCallback(
        async (id: number, all = false) => {
            if (mutation.current || !available) return;
            const controller = new AbortController();
            mutation.current = controller;
            setBusy(true);
            setError(false);
            try {
                await (all
                    ? readAllInbox(id, controller.signal)
                    : readInbox(id, controller.signal));
                if (!controller.signal.aborted) refresh();
            } catch {
                if (!controller.signal.aborted) setError(true);
            } finally {
                if (!controller.signal.aborted) {
                    mutation.current = null;
                    setBusy(false);
                }
            }
        },
        [available, refresh],
    );
    return {
        data: snapshot?.key === key ? snapshot.data : null,
        loading,
        error,
        busy,
        available,
        markRead,
        reload: refresh,
    };
}
