import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import type { AppConfig } from "../api/config/configApi";
import { useConfigApi } from "./api/config/useConfigApi";

type AppConfigContextValue = {
    data: AppConfig | null;
    loading: boolean;
    error: unknown | null;
    reload: () => Promise<AppConfig>;
    ensureConfig: () => Promise<AppConfig>;
};
const AppConfigContext = createContext<AppConfigContextValue | null>(null);

export function AppConfigProvider({ children }: { children: ReactNode }) {
    const { getConfig } = useConfigApi();
    const [data, setData] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown | null>(null);
    const snapshot = useRef<AppConfig | null>(null);
    const inFlight = useRef<Promise<AppConfig> | null>(null);
    const reload = useCallback((): Promise<AppConfig> => {
        if (inFlight.current) return inFlight.current;
        if (!snapshot.current) setLoading(true);
        const request = Promise.resolve()
            .then(getConfig)
            .then((payload) => {
                snapshot.current = payload;
                setData(payload);
                setError(null);
                return payload;
            })
            .catch((nextError: unknown) => {
                setError(nextError);
                throw nextError;
            })
            .finally(() => {
                inFlight.current = null;
                setLoading(false);
            });
        inFlight.current = request;
        return request;
    }, [getConfig]);
    const ensureConfig = useCallback((): Promise<AppConfig> => {
        if (inFlight.current) return inFlight.current;
        return snapshot.current ? Promise.resolve(snapshot.current) : reload();
    }, [reload]);
    useEffect(() => {
        void ensureConfig().catch(() => undefined);
    }, [ensureConfig]);
    const value = useMemo(
        () => ({ data, loading, error, reload, ensureConfig }),
        [data, loading, error, reload, ensureConfig],
    );
    return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}

export function useSharedAppConfig(): AppConfigContextValue {
    const context = useContext(AppConfigContext);
    if (!context) throw new Error("useAppConfig must be used inside <AppConfigProvider>.");
    return context;
}
