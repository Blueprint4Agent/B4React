import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
    APP_SHORTCUTS,
    getShortcutPlatform,
    shortcutAriaKeys,
    type ShortcutKeys,
} from "../utils/keyboardShortcuts";

export type ShortcutAction = keyof typeof APP_SHORTCUTS;
type Bindings = Record<ShortcutAction, ShortcutKeys>;
const STORAGE_KEY = "b4react.keyboard-shortcuts.v1";
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
    const names = keys.map((key) =>
        key === "mod" ? (getShortcutPlatform() === "macos" ? "meta" : "ctrl") : key,
    );
    if (new Set(names).size !== names.length) return "invalid";
    const signature = shortcutAriaKeys(keys);
    if (
        Object.entries(bindings).some(
            ([other, value]) => other !== action && shortcutAriaKeys(value) === signature,
        )
    )
        return "conflict";
    return null;
}
function readBindings(): Bindings {
    try {
        const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
        if (!saved || typeof saved !== "object") return APP_SHORTCUTS;
        const values = saved as Partial<Bindings>;
        const candidate: Bindings = {
            toggleSidebar: values.toggleSidebar ?? APP_SHORTCUTS.toggleSidebar,
            openSettings: values.openSettings ?? APP_SHORTCUTS.openSettings,
        };
        for (const action of Object.keys(APP_SHORTCUTS) as ShortcutAction[]) {
            if (
                !Array.isArray(candidate[action]) ||
                !candidate[action].every((key) => typeof key === "string") ||
                validateShortcut(candidate[action], action, candidate)
            )
                return APP_SHORTCUTS;
        }
        return candidate;
    } catch {
        return APP_SHORTCUTS;
    }
}
const Context = createContext({
    bindings: APP_SHORTCUTS as Bindings,
    update: (_action: ShortcutAction, _keys: ShortcutKeys): string | null => "unavailable",
    reset: () => {},
});
export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
    const [bindings, setBindings] = useState<Bindings>(readBindings);
    const value = useMemo(
        () => ({
            bindings,
            update(action: ShortcutAction, keys: ShortcutKeys) {
                const error = validateShortcut(keys, action, bindings);
                if (error) return error;
                const next = { ...bindings, [action]: [...keys] };
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                } catch {
                    return "storage";
                }
                setBindings(next);
                return null;
            },
            reset() {
                try {
                    localStorage.removeItem(STORAGE_KEY);
                } catch {
                    /* Defaults still apply for this session. */
                }
                setBindings(APP_SHORTCUTS);
            },
        }),
        [bindings],
    );
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
