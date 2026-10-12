import { useCallback, useEffect, useRef, useState } from "react";
import {
    getInbox,
    readInbox,
    readAllInbox,
    updateInboxSelection,
    type InboxPage,
} from "../../../api/inbox/inboxApi";
import { useInboxContext } from "./InboxProvider";
import { useServerConnectivity } from "../../connectivity/useServerConnectivity";
export type { InboxItem } from "../../../api/inbox/inboxApi";
export function useInbox(owner: number | undefined, page: number, unreadOnly: boolean) {
    const { revision, refresh } = useInboxContext();
    const { isDesktop, status } = useServerConnectivity();
    const available = owner !== undefined && (!isDesktop || status === "online");
    const key = JSON.stringify([owner, page, unreadOnly]);
    const [snapshot, setSnapshot] = useState<{
        key: string;
        owner: number;
        data: InboxPage;
    } | null>(null);
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
                if (current && owner !== undefined) setSnapshot({ key, owner, data });
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
    }, [available, key, owner, page, unreadOnly, revision]);
    const mutate = useCallback(
        async (action: (signal: AbortSignal) => Promise<void>) => {
            if (mutation.current || !available) return false;
            const controller = new AbortController();
            mutation.current = controller;
            setBusy(true);
            setError(false);
            try {
                await action(controller.signal);
                if (controller.signal.aborted) return false;
                refresh();
                return true;
            } catch {
                if (!controller.signal.aborted) setError(true);
                return false;
            } finally {
                if (!controller.signal.aborted) {
                    mutation.current = null;
                    setBusy(false);
                }
            }
        },
        [available, refresh],
    );
    const markRead = useCallback(
        (id: number, all = false) =>
            mutate((signal) => (all ? readAllInbox(id, signal) : readInbox(id, signal))),
        [mutate],
    );
    const updateSelected = useCallback(
        (ids: number[], remove = false) =>
            mutate((signal) => updateInboxSelection(ids, remove, signal)),
        [mutate],
    );
    return {
        data: available && snapshot?.owner === owner ? snapshot.data : null,
        loading: loading || (available && !error && snapshot?.key !== key),
        error,
        busy,
        available,
        markRead,
        updateSelected,
        reload: refresh,
    };
}
