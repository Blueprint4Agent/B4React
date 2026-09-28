import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useApiKeyApi, type APIKeyRecord } from "./useApiKeyApi";
import { useServerConnectivity } from "../../connectivity/useServerConnectivity";
import { useApiKeyRealtimeSubscription } from "../../realtime/apiKey/useApiKeyRealtimeSubscription";

type Options = {
    ownerId: number | undefined;
    enabled: boolean;
    realtimeEnabled: boolean;
    onMutationResult?: (action: "Create" | "Delete" | "Toggle", success: boolean) => void;
};

type APIKeysState = {
    items: APIKeyRecord[];
    loading: boolean;
    errorMessage: string | null;
    createBusy: boolean;
    createErrorMessage: string | null;
    deleteBusy: boolean;
    toggleBusyId: number | null;
    create: (name: string, expiresAt: string | null) => Promise<string | null>;
    deleteKey: (id: number) => Promise<boolean>;
    setEnabled: (id: number, value: boolean) => Promise<void>;
    reload: () => Promise<void>;
    clearCreateError: () => void;
};

function normalize(items: APIKeyRecord[]): APIKeyRecord[] {
    return [...new Map(items.map((item) => [item.id, item])).values()].sort(
        (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || b.id - a.id,
    );
}

export function useApiKeys({
    ownerId,
    enabled,
    realtimeEnabled,
    onMutationResult,
}: Options): APIKeysState {
    const resultCallback = useRef(onMutationResult);
    resultCallback.current = onMutationResult;
    const api = useApiKeyApi();
    const { t } = useTranslation();
    const { isDesktop, status } = useServerConnectivity();
    const available = ownerId !== undefined && (!isDesktop || status === "online");
    const [items, setItems] = useState<APIKeyRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);
    const [createBusy, setCreateBusy] = useState(false);
    const [deleteBusy, setDeleteBusy] = useState(false);
    const [toggleBusyId, setToggleBusyId] = useState<number | null>(null);
    const active = useRef(false);
    const epoch = useRef(0);
    const request = useRef(0);
    const revision = useRef(0);
    const locks = useRef(new Set<string>());
    const online = useRef(available);
    const visible = useRef(enabled);
    const hasLoaded = useRef(false);
    online.current = available;
    visible.current = enabled;

    const message = useCallback(
        (error: unknown, fallback: string): string =>
            api.resolveAPIKeyErrorMessage(t, api.extractAPIKeyErrorDetail(error), fallback),
        [api, t],
    );
    const isCurrent = useCallback(
        (generation: number): boolean => active.current && epoch.current === generation,
        [],
    );

    const reload = useCallback(
        async function refresh(): Promise<void> {
            if (!active.current || !online.current || !visible.current) return;
            const generation = epoch.current;
            const requestId = ++request.current;
            const startRevision = revision.current;
            setLoading(!hasLoaded.current);
            try {
                const response = await api.listApiKeys();
                if (!isCurrent(generation) || requestId !== request.current) return;
                if (revision.current !== startRevision) {
                    // A mutation/event happened while this snapshot was loading.
                    void refresh();
                    return;
                }
                setItems(normalize(response.items));
                hasLoaded.current = true;
                setLoadError(null);
            } catch (error) {
                if (isCurrent(generation) && requestId === request.current) {
                    setLoadError(message(error, "settings.developers.listLoadError"));
                }
            } finally {
                if (isCurrent(generation) && requestId === request.current) setLoading(false);
            }
        },
        [api, isCurrent, message],
    );

    useEffect(() => {
        ++epoch.current;
        active.current = ownerId !== undefined;
        locks.current.clear();
        hasLoaded.current = false;
        setItems([]);
        setCreateBusy(false);
        setDeleteBusy(false);
        setToggleBusyId(null);
        setCreateErrorMessage(null);
        setErrorMessage(null);
        setLoadError(null);
        return () => {
            active.current = false;
            ++epoch.current;
            ++request.current;
        };
    }, [ownerId]);

    useEffect(() => {
        if (available && enabled) void reload();
        else {
            ++request.current;
            setLoading(false);
        }
    }, [available, enabled, ownerId, reload]);

    const upsert = useCallback((record: APIKeyRecord): void => {
        ++revision.current;
        setItems((previous) =>
            normalize([...previous.filter((item) => item.id !== record.id), record]),
        );
    }, []);
    const remove = useCallback((record: APIKeyRecord): void => {
        ++revision.current;
        setItems((previous) => previous.filter((item) => item.id !== record.id));
    }, []);
    const onUpsert = useCallback(
        (record: APIKeyRecord): void => {
            if (!active.current) return;
            upsert(record);
            void reload();
        },
        [upsert, reload],
    );
    const onDeleted = useCallback(
        (record: APIKeyRecord): void => {
            if (!active.current) return;
            remove(record);
            void reload();
        },
        [remove, reload],
    );
    useApiKeyRealtimeSubscription({
        enabled: available && enabled && realtimeEnabled,
        ownerId,
        onConnected: reload,
        onCreated: onUpsert,
        onStatusUpdated: onUpsert,
        onDeleted,
    });

    const create = useCallback(
        async (name: string, expiresAt: string | null): Promise<string | null> => {
            if (!active.current || !online.current || locks.current.has("create")) return null;
            const generation = epoch.current;
            locks.current.add("create");
            ++revision.current;
            setCreateBusy(true);
            setCreateErrorMessage(null);
            try {
                const result = await api.createApiKey(name, expiresAt);
                if (!isCurrent(generation)) return null;
                upsert(result.key);
                resultCallback.current?.("Create", true);
                return result.api_key;
            } catch (error) {
                if (isCurrent(generation)) {
                    setCreateErrorMessage(message(error, "settings.developers.createError"));
                    resultCallback.current?.("Create", false);
                }
                return null;
            } finally {
                if (isCurrent(generation)) {
                    locks.current.delete("create");
                    setCreateBusy(false);
                    void reload();
                }
            }
        },
        [api, isCurrent, message, reload, upsert],
    );

    const deleteKey = useCallback(
        async (id: number): Promise<boolean> => {
            if (!active.current || !online.current || locks.current.has("delete")) return false;
            const generation = epoch.current;
            locks.current.add("delete");
            ++revision.current;
            setDeleteBusy(true);
            setErrorMessage(null);
            try {
                const deleted = await api.deleteApiKey(id);
                if (!isCurrent(generation)) return false;
                remove(deleted);
                resultCallback.current?.("Delete", true);
                return true;
            } catch (error) {
                if (isCurrent(generation)) {
                    setErrorMessage(message(error, "settings.developers.deactivateError"));
                    resultCallback.current?.("Delete", false);
                }
                return false;
            } finally {
                if (isCurrent(generation)) {
                    locks.current.delete("delete");
                    setDeleteBusy(false);
                    void reload();
                }
            }
        },
        [api, isCurrent, message, reload, remove],
    );

    const setEnabled = useCallback(
        async (id: number, value: boolean): Promise<void> => {
            if (!active.current || !online.current || locks.current.has("toggle")) return;
            const generation = epoch.current;
            locks.current.add("toggle");
            ++revision.current;
            setToggleBusyId(id);
            setErrorMessage(null);
            try {
                const updated = await api.updateApiKeyStatus(id, value);
                if (isCurrent(generation)) {
                    upsert(updated);
                    resultCallback.current?.("Toggle", true);
                }
            } catch (error) {
                if (isCurrent(generation)) {
                    setErrorMessage(message(error, "settings.developers.updateError"));
                    resultCallback.current?.("Toggle", false);
                }
            } finally {
                if (isCurrent(generation)) {
                    locks.current.delete("toggle");
                    setToggleBusyId(null);
                    void reload();
                }
            }
        },
        [api, isCurrent, message, reload, upsert],
    );
    const clearCreateError = useCallback((): void => setCreateErrorMessage(null), []);
    return {
        items,
        loading,
        errorMessage: errorMessage ?? loadError,
        createBusy,
        createErrorMessage,
        deleteBusy,
        toggleBusyId,
        create,
        deleteKey,
        setEnabled,
        reload,
        clearCreateError,
    };
}
