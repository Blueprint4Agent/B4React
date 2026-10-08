import { detectDesktopPlatform, type DesktopPlatform } from "./desktopRuntime";

export type ShortcutKeys = readonly string[];
export const APP_SHORTCUTS = {
    toggleSidebar: ["mod", "b"],
    openSettings: ["mod", ","],
    openProfile: ["mod", "shift", "p"],
} as const;

export function getShortcutPlatform(): DesktopPlatform {
    if (typeof navigator === "undefined") return "unknown";
    return detectDesktopPlatform(navigator.userAgent);
}

const MODIFIERS = ["mod", "ctrl", "meta", "alt", "shift"];
export function orderedShortcutKeys(keys: ShortcutKeys, platform: DesktopPlatform): string[] {
    const order =
        platform === "macos"
            ? ["ctrl", "alt", "shift", "mod", "meta"]
            : ["ctrl", "mod", "alt", "shift", "meta"];
    const normalized = keys.map((key) => key.toLowerCase());
    return [
        ...order.filter((key) => normalized.includes(key)),
        ...normalized.filter((key) => !MODIFIERS.includes(key)),
    ];
}

export function shortcutKeyName(key: string, platform: DesktopPlatform): string {
    if (key === "mod") return platform === "macos" ? "Meta" : "Control";
    if (key === "ctrl") return "Control";
    if (key === "meta") return "Meta";
    if (key === "alt") return "Alt";
    if (key === "shift") return "Shift";
    const namedKeys: Record<string, string> = {
        enter: "Enter",
        escape: "Escape",
        tab: "Tab",
        space: "Space",
        backspace: "Backspace",
        delete: "Delete",
        arrowup: "ArrowUp",
        arrowdown: "ArrowDown",
        arrowleft: "ArrowLeft",
        arrowright: "ArrowRight",
    };
    return namedKeys[key] ?? (key.length === 1 ? key.toUpperCase() : key);
}

export function shortcutAriaKeys(keys: ShortcutKeys, platform = getShortcutPlatform()): string {
    return orderedShortcutKeys(keys, platform)
        .map((key) => shortcutKeyName(key, platform))
        .join("+");
}

export function shortcutKeyDisplay(key: string, platform: DesktopPlatform): string {
    const name = shortcutKeyName(key, platform);
    const labels: Record<string, string> =
        platform === "macos"
            ? { Meta: "⌘", Control: "⌃", Alt: "⌥", Shift: "⇧", Escape: "Esc", Enter: "↵" }
            : {
                  Meta: "Meta",
                  Control: "Ctrl",
                  Alt: "Alt",
                  Shift: "Shift",
                  Escape: "Esc",
                  Enter: "Enter",
              };
    return labels[name] ?? name;
}

export function matchesShortcut(
    event: KeyboardEvent,
    keys: ShortcutKeys,
    platform = getShortcutPlatform(),
): boolean {
    const names = keys.map((key) => shortcutKeyName(key.toLowerCase(), platform));
    const key = names.find((name) => !["Control", "Meta", "Alt", "Shift"].includes(name));
    return (
        key !== undefined &&
        (event.key === " " ? "SPACE" : event.key.toUpperCase()) === key.toUpperCase() &&
        event.ctrlKey === names.includes("Control") &&
        event.metaKey === names.includes("Meta") &&
        event.altKey === names.includes("Alt") &&
        event.shiftKey === names.includes("Shift")
    );
}

export function isShortcutBlocked(event: KeyboardEvent): boolean {
    if (
        event.defaultPrevented ||
        event.repeat ||
        event.isComposing ||
        event.getModifierState("AltGraph")
    )
        return true;
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) return true;
    return event
        .composedPath()
        .some(
            (target) =>
                target instanceof Element &&
                Boolean(
                    target.closest(
                        'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]',
                    ),
                ),
        );
}
