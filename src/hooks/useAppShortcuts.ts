import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { useEffect } from "react";
import {
    getShortcutPlatform,
    isShortcutBlocked,
    matchesShortcut,
} from "../utils/keyboardShortcuts";

type AppShortcutActions = { toggleSidebar: () => void; openSettings: () => void };

export function useAppShortcuts({ toggleSidebar, openSettings }: AppShortcutActions): void {
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
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [toggleSidebar, openSettings, bindings]);
}
