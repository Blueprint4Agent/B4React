import { useTranslation } from "react-i18next";
import type { DesktopPlatform } from "../../../utils/desktopRuntime";
import {
    getShortcutPlatform,
    orderedShortcutKeys,
    shortcutKeyDisplay,
    shortcutKeyName,
    type ShortcutKeys,
} from "../../../utils/keyboardShortcuts";

type KeyboardShortcutProps = {
    keys: ShortcutKeys;
    platform?: DesktopPlatform;
    className?: string;
};

export function KeyboardShortcut({
    keys,
    platform = getShortcutPlatform(),
    className,
}: KeyboardShortcutProps) {
    const { t } = useTranslation();
    const ordered = orderedShortcutKeys(keys, platform);
    const accessibleLabel = ordered
        .map((key) => {
            const name = shortcutKeyName(key, platform);
            return ["Meta", "Control", "Alt", "Shift"].includes(name)
                ? t(`shortcuts.keys.${name === "Meta" && platform === "macos" ? "Command" : name}`)
                : name;
        })
        .join(" + ");
    return (
        <kbd
            className={`ui-keyboard-shortcut${className ? ` ${className}` : ""}`}
            aria-label={accessibleLabel}
        >
            {ordered.map((key, index) => (
                <span
                    key={`${key}-${index}`}
                    className="ui-keyboard-shortcut__key"
                    aria-hidden="true"
                >
                    {index > 0 && platform !== "macos" ? (
                        <span className="ui-keyboard-shortcut__separator">+</span>
                    ) : null}
                    {shortcutKeyDisplay(key, platform)}
                </span>
            ))}
        </kbd>
    );
}
