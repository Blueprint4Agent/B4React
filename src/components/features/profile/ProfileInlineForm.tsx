import { Check, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../ui";

export function ProfileInlineForm({
    children,
    busy,
    invalid = false,
    onSave,
    onCancel,
    className = "",
}: {
    children: ReactNode;
    busy: boolean;
    invalid?: boolean;
    onSave: () => void;
    onCancel: () => void;
    className?: string;
}) {
    const { t } = useTranslation();
    const formRef = useRef<HTMLFormElement>(null);
    useEffect(() => {
        if (busy) return;
        const cancelOutside = (event: PointerEvent) => {
            const form = formRef.current;
            const target = event.target;
            if (!form || !(target instanceof Node) || form.contains(target)) return;
            const inOwnedMenu = Array.from(form.querySelectorAll("[aria-controls]")).some(
                (trigger) =>
                    trigger
                        .getAttribute("aria-controls")
                        ?.split(/\s+/)
                        .some((id) => document.getElementById(id)?.contains(target)),
            );
            if (!inOwnedMenu) onCancel();
        };
        document.addEventListener("pointerdown", cancelOutside, true);
        return () => document.removeEventListener("pointerdown", cancelOutside, true);
    }, [busy, onCancel]);
    return (
        <form
            ref={formRef}
            className={`profile-inline-form ${className}`}
            onSubmit={(event) => {
                event.preventDefault();
                if (!invalid) onSave();
            }}
            onKeyDown={(event) => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    onCancel();
                }
            }}
        >
            {children}
            <div className="profile-inline-form__actions">
                <Button
                    iconOnly
                    appearance="text"
                    type="submit"
                    loading={busy}
                    disabled={invalid}
                    aria-label={t("settings.profile.save")}
                    title={t("settings.profile.save")}
                >
                    {!busy && <Check aria-hidden="true" />}
                </Button>
                <Button
                    iconOnly
                    appearance="text"
                    type="button"
                    disabled={busy}
                    onClick={onCancel}
                    aria-label={t("settings.account.cancel")}
                    title={t("settings.account.cancel")}
                >
                    <X aria-hidden="true" />
                </Button>
            </div>
        </form>
    );
}
