import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthApi } from "./useAuthApi";
import { useServerConnectivity } from "../../connectivity/useServerConnectivity";
import type { AdminUserList, AdminUserQuery } from "../../../api/auth/authApi";
export type { AdminUserQuery, AdminUserList } from "../../../api/auth/authApi";

type Snapshot = { key: string; data: AdminUserList | null; error: string | null; loading: boolean };
export function useAdminUsers(ownerId: number | undefined, query: AdminUserQuery) {
    const api = useAuthApi();
    const { t } = useTranslation();
    const { isDesktop, status } = useServerConnectivity();
    const available = ownerId !== undefined && (!isDesktop || status === "online");
    const [revision, setRevision] = useState(0);
    const reload = useCallback(() => setRevision((value) => value + 1), []);
    const key = JSON.stringify([ownerId, query]);
    const [snapshot, setSnapshot] = useState<Snapshot>({
        key: "",
        data: null,
        error: null,
        loading: false,
    });
    useEffect(() => {
        if (!available) return;
        const controller = new AbortController();
        let current = true;
        setSnapshot((previous) => ({
            key,
            data: previous.key === key ? previous.data : null,
            error: null,
            loading: true,
        }));
        void api
            .listAdminUsers(query, controller.signal)
            .then((data) => {
                if (current) setSnapshot({ key, data, error: null, loading: false });
            })
            .catch((error: unknown) => {
                if (current)
                    setSnapshot({
                        key,
                        data: null,
                        loading: false,
                        error: api.resolveAuthErrorMessage(
                            t,
                            api.extractApiDetail(error),
                            "admin.loadError",
                        ),
                    });
            });
        return () => {
            current = false;
            controller.abort();
        };
    }, [api, available, key, query, revision, t]);
    useEffect(() => {
        if (!available) return;
        const onVisible = () => {
            if (document.visibilityState === "visible") reload();
        };
        window.addEventListener("focus", onVisible);
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            window.removeEventListener("focus", onVisible);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [available, reload]);
    const current = snapshot.key === key;
    return {
        data: current ? snapshot.data : null,
        error: current ? snapshot.error : null,
        loading: available && (!current || snapshot.loading),
        available,
        reload,
    };
}
