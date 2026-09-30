import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";

type ModalProps = {
    children?: ReactNode;
    description?: string;
    footer?: ReactNode;
    onClose: () => void;
    open: boolean;
    title: string;
    size?: "default" | "compact";
    className?: string;
    keyboardDismissible?: boolean;
    returnFocusSelector?: string;
};

export function Modal({
    children,
    description,
    footer,
    onClose,
    open,
    title,
    size = "default",
    className = "",
    keyboardDismissible = false,
    returnFocusSelector,
}: ModalProps) {
    const { t } = useTranslation();
    const panelRef = useRef<HTMLElement>(null);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;
    useEffect(() => {
        if (!open || !keyboardDismissible) return;
        const previous = document.activeElement as HTMLElement | null;
        const panel = panelRef.current;
        const dialog = panel?.closest(".ui-modal");
        panel?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            // An open child menu consumes the first Escape, preserving the dialog.
            if (event.key === "Escape" && dialog?.querySelector('[role="menu"]')) return;
            if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                closeRef.current();
            }
            if (event.key !== "Tab" || !panel) return;
            const controls = Array.from(
                (dialog ?? panel).querySelectorAll<HTMLElement>(
                    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
                ),
            ).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (!first) {
                event.preventDefault();
                panel.focus();
            } else if (
                event.shiftKey &&
                (document.activeElement === first || document.activeElement === panel)
            ) {
                event.preventDefault();
                last.focus();
            } else if (
                !event.shiftKey &&
                (document.activeElement === last ||
                    !(dialog ?? panel).contains(document.activeElement))
            ) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", onKeyDown, true);
        return () => {
            document.removeEventListener("keydown", onKeyDown, true);
            if (previous?.isConnected) previous.focus();
            else if (returnFocusSelector)
                document.querySelector<HTMLElement>(returnFocusSelector)?.focus();
        };
    }, [open, keyboardDismissible, returnFocusSelector]);
    if (!open || typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <div className={`ui-modal ${className}`} role="dialog" aria-modal="true" aria-label={title}>
            <button
                type="button"
                className="ui-modal__backdrop"
                aria-label={t("authDialog.closeBackdrop")}
                tabIndex={-1}
                onClick={onClose}
            />
            <section
                ref={panelRef}
                tabIndex={keyboardDismissible ? -1 : undefined}
                className={
                    size === "compact"
                        ? "ui-modal__panel ui-modal__panel--compact"
                        : "ui-modal__panel"
                }
            >
                <header className="ui-modal__header">
                    <div>
                        <h2>{title}</h2>
                        {description ? <p>{description}</p> : null}
                    </div>
                    {keyboardDismissible ? (
                        <button
                            type="button"
                            className="ui-modal__close"
                            aria-label={t("authDialog.close")}
                            onClick={onClose}
                        >
                            <X aria-hidden="true" />
                        </button>
                    ) : null}
                </header>
                {children ? <div className="ui-modal__body">{children}</div> : null}
                {footer ? <footer className="ui-modal__footer">{footer}</footer> : null}
            </section>
        </div>,
        document.body,
    );
}
