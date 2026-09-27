import { useEffect } from "react";
import {
    APP_SHORTCUTS,
    getShortcutPlatform,
    isShortcutBlocked,
    matchesShortcut,
} from "../utils/keyboardShortcuts";

type AppShortcutActions = { toggleSidebar: () => void; openSettings: () => void };

export function useAppShortcuts({ toggleSidebar, openSettings }: AppShortcutActions): void {
    useEffect(() => {
        const platform = getShortcutPlatform();
        const onKeyDown = (event: KeyboardEvent) => {
            if (isShortcutBlocked(event)) return;
            if (matchesShortcut(event, APP_SHORTCUTS.toggleSidebar, platform)) {
                event.preventDefault();
                toggleSidebar();
            } else if (matchesShortcut(event, APP_SHORTCUTS.openSettings, platform)) {
                event.preventDefault();
                openSettings();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [toggleSidebar, openSettings]);
}
