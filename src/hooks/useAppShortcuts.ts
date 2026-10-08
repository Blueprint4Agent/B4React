import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { useEffect } from "react";
import {
    getShortcutPlatform,
    isShortcutBlocked,
    matchesShortcut,
} from "../utils/keyboardShortcuts";

type AppShortcutActions = {
    toggleSidebar: () => void;
    openSettings: () => void;
    openProfile?: () => void;
};

export function useAppShortcuts({
    toggleSidebar,
    openSettings,
    openProfile,
}: AppShortcutActions): void {
    const { bindings } = useKeyboardShortcuts();
    useEffect(() => {
        const platform = getShortcutPlatform();
        const onKeyDown = (event: KeyboardEvent) => {
            if (isShortcutBlocked(event)) return;
            if (matchesShortcut(event, bindings.toggleSidebar, platform)) {
                event.preventDefault();
                toggleSidebar();
            } else if (matchesShortcut(event, bindings.openSettings, platform)) {
                event.preventDefault();
                openSettings();
            } else if (openProfile && matchesShortcut(event, bindings.openProfile, platform)) {
                event.preventDefault();
                openProfile();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [toggleSidebar, openSettings, openProfile, bindings]);
}
