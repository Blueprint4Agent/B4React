import { createContext, useContext, useMemo, useState, useRef, type ReactNode } from "react";
import {
    APP_SHORTCUTS,
    getShortcutPlatform,
    shortcutAriaKeys,
    type ShortcutKeys,
} from "../utils/keyboardShortcuts";

import { useAuthContext } from "./useAuth";
import { useServerConnectivity } from "./connectivity/useServerConnectivity";

export type ShortcutAction = keyof typeof APP_SHORTCUTS;
type Bindings = Record<ShortcutAction, ShortcutKeys>;
export function validateShortcut(
    keys: ShortcutKeys,
    action: ShortcutAction,
    bindings: Bindings,
): "invalid" | "conflict" | null {
    const modifiers = ["mod", "ctrl", "meta", "alt", "shift"];
    const primary = keys.filter((key) => !modifiers.includes(key));
    if (
        primary.length !== 1 ||
        !primary[0] ||
        ["dead", "unidentified"].includes(primary[0]) ||
        new Set(keys).size !== keys.length
    )
        return "invalid";
    for (const platform of ["macos", "windows"] as const) {
        const names = keys.map((key) =>
            key === "mod" ? (platform === "macos" ? "meta" : "ctrl") : key,
        );
        if (new Set(names).size !== names.length) return "invalid";
        const signature = shortcutAriaKeys(keys, platform);
        if (
            Object.entries(bindings).some(
                ([other, value]) =>
                    other !== action && shortcutAriaKeys(value, platform) === signature,
            )
        )
            return "conflict";
    }
    return null;
}
const Context = createContext({
    bindings: APP_SHORTCUTS as Bindings,
    disabled: true,
    update: async (_action: ShortcutAction, _keys: ShortcutKeys): Promise<string | null> =>
        "storage",
    reset: async (): Promise<string | null> => "storage",
});
export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
    const { user, loading, updateProfile } = useAuthContext();
    const { isDesktop, status } = useServerConnectivity();
    const [saving, setSaving] = useState(false);
    const inFlight = useRef(false);
    const bindings: Bindings = useMemo(
        () => ({
            ...APP_SHORTCUTS,
            ...user?.keyboard_shortcuts,
            openProfile: user?.keyboard_shortcuts?.openProfile ?? APP_SHORTCUTS.openProfile,
        }),
        [user?.keyboard_shortcuts],
    );
    const disabled = !user || loading || saving || (isDesktop && status !== "online");
    const value = useMemo(() => {
        const save = async (next: Bindings | null): Promise<string | null> => {
            if (disabled || inFlight.current) return "storage";
            inFlight.current = true;
            setSaving(true);
            try {
                await updateProfile({
                    keyboard_shortcuts: next
                        ? {
                              toggleSidebar: [...next.toggleSidebar],
                              openSettings: [...next.openSettings],
                              openProfile: [...next.openProfile],
                          }
                        : null,
                });
                return null;
            } catch {
                return "storage";
            } finally {
                inFlight.current = false;
                setSaving(false);
            }
        };
        return {
            bindings,
            disabled,
            async update(action: ShortcutAction, keys: ShortcutKeys): Promise<string | null> {
                const error = validateShortcut(keys, action, bindings);
                if (error) return error;
                return save({ ...bindings, [action]: [...keys] });
            },
            reset: () => save(null),
        };
    }, [bindings, disabled, updateProfile]);
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useKeyboardShortcuts = () => useContext(Context);
export function captureShortcut(event: {
    key: string;
    metaKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
}): ShortcutKeys {
    const mac = getShortcutPlatform() === "macos";
    return [
        ...(event.metaKey ? [mac ? "mod" : "meta"] : []),
        ...(event.ctrlKey ? [mac ? "ctrl" : "mod"] : []),
        ...(event.altKey ? ["alt"] : []),
        ...(event.shiftKey ? ["shift"] : []),
        event.key === " " ? "space" : event.key.toLowerCase(),
    ];
}
