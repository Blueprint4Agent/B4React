import { useToast } from "../../hooks/useToast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, InputField, KeyboardShortcut } from "../../components/ui";
import {
    captureShortcut,
    useKeyboardShortcuts,
    type ShortcutAction,
} from "../../hooks/useKeyboardShortcuts";

export function KeyboardSettings() {
    const { t } = useTranslation();
    const { bindings, update, reset, disabled } = useKeyboardShortcuts();
    const [editing, setEditing] = useState<ShortcutAction | null>(null);
    const showToast = useToast();
    return (
        <>
            <header className="settings-content-card__header">
                <h1>{t("settings.menu.keyboard")}</h1>
                <p>{t("settings.keyboard.description")}</p>
            </header>
            <section className="settings-general-content" aria-label={t("settings.menu.keyboard")}>
                {(Object.keys(bindings) as ShortcutAction[]).map((action) => (
                    <article className="settings-row" key={action}>
                        <h2>{t(`settings.keyboard.${action}`)}</h2>
                        <div className="settings-keyboard-control">
                            {editing === action ? (
                                <>
                                    <InputField
                                        autoFocus
                                        readOnly
                                        disabled={disabled}
                                        label=""
                                        aria-label={t(`settings.keyboard.${action}`)}
                                        onBlur={() => {
                                            setEditing(null);
                                        }}
                                        value=""
                                        onValueChange={() => {}}
                                        placeholder={t("settings.keyboard.press")}
                                        onKeyDown={async (event) => {
                                            event.stopPropagation();
                                            event.preventDefault();
                                            if (
                                                event.repeat ||
                                                event.nativeEvent.isComposing ||
                                                ["Control", "Meta", "Alt", "Shift"].includes(
                                                    event.key,
                                                )
                                            )
                                                return;
                                            const problem = await update(
                                                action,
                                                captureShortcut(event),
                                            );
                                            if (problem)
                                                showToast(t(`settings.keyboard.errors.${problem}`));
                                            else setEditing(null);
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <Button
                                        disabled={disabled}
                                        appearance="text"
                                        className="settings-shortcut-trigger"
                                        aria-label={t(`settings.keyboard.${action}`)}
                                        onClick={() => {
                                            setEditing(action);
                                        }}
                                    >
                                        <KeyboardShortcut keys={bindings[action]} />
                                    </Button>
                                </>
                            )}
                        </div>
                    </article>
                ))}
                <div className="settings-keyboard-footer">
                    <Button
                        disabled={disabled}
                        onClick={async () => {
                            const problem = await reset();
                            if (problem) showToast(t(`settings.keyboard.errors.${problem}`));
                            else setEditing(null);
                        }}
                    >
                        {t("settings.keyboard.reset")}
                    </Button>
                </div>
            </section>
        </>
    );
}
