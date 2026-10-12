import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { getInboxSummary } from "../../../api/inbox/inboxApi";
import { useAuthContext } from "../../useAuth";
import { useServerConnectivity } from "../../connectivity/useServerConnectivity";
import { useRealtimeStreamSubscription } from "../../realtime/core/useRealtimeStreamSubscription";

const InboxContext = createContext({
    unread: null as number | null,
    revision: 0,
    refresh: () => {},
});
export const useInboxContext = () => useContext(InboxContext);
export function InboxProvider({ children }: { children: ReactNode }) {
    const { user } = useAuthContext();
    const owner = user?.id;
    const { isDesktop, status } = useServerConnectivity();
    const available = owner !== undefined && (!isDesktop || status === "online");
    const [snapshot, setSnapshot] = useState<{ owner: number; unread: number } | null>(null);
    const [revision, setRevision] = useState(0);
    const refresh = useCallback(() => setRevision((value) => value + 1), []);
    const onEvent = useCallback(
        (event: { type: string }) => {
            if (event.type === "connected" || event.type === "inbox.changed") refresh();
        },
        [refresh],
    );
    useRealtimeStreamSubscription({ enabled: available, subscriptionKey: owner, onEvent });
    useEffect(() => {
        if (!available || owner === undefined) return;
        const controller = new AbortController();
        let current = true;
        void getInboxSummary(controller.signal)
            .then((data) => {
                if (current) setSnapshot({ owner, unread: data.unread_count });
            })
            .catch(() => {
                if (current) setSnapshot(null);
            });
        return () => {
            current = false;
            controller.abort();
        };
    }, [available, owner, revision]);
    useEffect(() => {
        const visible = () => {
            if (document.visibilityState === "visible") refresh();
        };
        window.addEventListener("focus", visible);
        document.addEventListener("visibilitychange", visible);
        return () => {
            window.removeEventListener("focus", visible);
            document.removeEventListener("visibilitychange", visible);
        };
    }, [refresh]);
    const unread = snapshot?.owner === owner ? (snapshot?.unread ?? null) : null;
    const value = useMemo(() => ({ unread, revision, refresh }), [unread, revision, refresh]);
    return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}
