import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useAppConfig } from "./useFeatures";
import { serviceConfig, type AppLayoutMode } from "../service.config";
import { storageKey } from "../utils/basePath";

const preferenceKey = () => storageKey("blueprint_layout_preview");
function readPreview(): AppLayoutMode | null {
    try {
        const value = localStorage.getItem(preferenceKey());
        return value === "sidebar" || value === "topnav" || value === "focused" ? value : null;
    } catch {
        return null;
    }
}
type LayoutContextValue = {
    mode: AppLayoutMode;
    canPreview: boolean;
    setMode: (mode: AppLayoutMode) => void;
};
const LayoutContext = createContext<LayoutContextValue>({
    mode: serviceConfig.layout,
    canPreview: false,
    setMode: () => undefined,
});

export function AppLayoutProvider({ children }: { children: ReactNode }) {
    const { data } = useAppConfig();
    const canPreview = data?.app_mode === "development";
    const [preview, setPreview] = useState(readPreview);
    const setMode = useCallback(
        (mode: AppLayoutMode) => {
            if (!canPreview) return;
            setPreview(mode);
            try {
                localStorage.setItem(preferenceKey(), mode);
            } catch {
                /* Session preview remains available. */
            }
        },
        [canPreview],
    );
    const mode = canPreview && preview ? preview : serviceConfig.layout;
    const value = useMemo(() => ({ mode, canPreview, setMode }), [mode, canPreview, setMode]);
    return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useAppLayout(): LayoutContextValue {
    return useContext(LayoutContext);
}
