import { useCallback, useEffect, useState } from "react";
import { AdminStatusError, getAdminStatus, type AdminStatus } from "../../../api/admin/adminApi";
import { useServerConnectivity } from "../../connectivity/useServerConnectivity";

type Snapshot = { owner: number; data: AdminStatus; received: number };

export function useAdminStatus(owner: number) {
    const { isDesktop, status } = useServerConnectivity();
    const available = !isDesktop || status === "online";
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const [revision, setRevision] = useState(0);
    const [now, setNow] = useState(Date.now);
    const reload = useCallback(() => setRevision((value) => value + 1), []);
    useEffect(() => {
        if (!available) return;
        let active = true;
        let pending = false;
        let controller: AbortController | undefined;
        let timeout: number | undefined;
        const refresh = async () => {
            if (pending || document.visibilityState === "hidden") return;
            pending = true;
            controller = new AbortController();
            timeout = window.setTimeout(() => controller?.abort(), 8000);
            setLoading(true);
            try {
                const data = await getAdminStatus(controller.signal);
                if (active) {
                    setSnapshot({ owner, data, received: Date.now() });
                    setNow(Date.now());
                    setFailed(false);
                }
            } catch (error) {
                if (active) {
                    setFailed(true);
                    if (error instanceof AdminStatusError && [401, 403].includes(error.status))
                        setSnapshot(null);
                }
            } finally {
                window.clearTimeout(timeout);
                pending = false;
                if (active) setLoading(false);
            }
        };
        const onVisible = () => {
            void refresh();
        };
        void refresh();
        const timer = window.setInterval(onVisible, 30000);
        window.addEventListener("focus", onVisible);
        window.addEventListener("online", onVisible);
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            active = false;
            controller?.abort();
            window.clearTimeout(timeout);
            window.clearInterval(timer);
            window.removeEventListener("focus", onVisible);
            window.removeEventListener("online", onVisible);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [owner, available, revision]);
    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 5000);
        return () => window.clearInterval(timer);
    }, []);
    const current = snapshot?.owner === owner ? snapshot : null;
    return {
        data: current?.data,
        loading: available && (loading || (!current && !failed)),
        failed,
        available,
        reload,
        stale: current !== null && (!available || failed || now - current.received > 60000),
    };
}
