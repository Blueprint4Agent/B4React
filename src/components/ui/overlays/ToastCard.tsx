import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ToastCardProps = {
    message: string;
    durationMs?: number;
    onDismiss?: () => void;
};

const EXIT_DURATION_MS = 180; // Keep in sync with ui-toast-exit in app.css.

/** Mount to show; use a new React key to replay the same message. */
export function ToastCard({ message, durationMs = 3000, onDismiss }: ToastCardProps) {
    const [phase, setPhase] = useState<"hidden" | "visible" | "closing">("hidden");
    const dismissRef = useRef(onDismiss);
    dismissRef.current = onDismiss;
    const text = message.trim();
    const duration = Number.isFinite(durationMs)
        ? Math.min(10000, Math.max(1000, durationMs))
        : 3000;

    useEffect(() => {
        if (!text) {
            setPhase("hidden");
            return;
        }
        // Insert text after the empty polite status region mounts, without moving focus.
        setPhase("visible");
        const closing = window.setTimeout(() => setPhase("closing"), duration);
        const dismissed = window.setTimeout(() => {
            setPhase("hidden");
            dismissRef.current?.();
        }, duration + EXIT_DURATION_MS);
        return () => {
            window.clearTimeout(closing);
            window.clearTimeout(dismissed);
        };
    }, [text, duration]);

    if (typeof document === "undefined" || !text) return null;
    return createPortal(
        <div className="ui-toast-layer" role="status" aria-live="polite" aria-atomic="true">
            {phase !== "hidden" ? (
                <div
                    className={`ui-toast-card${phase === "closing" ? " ui-toast-card--closing" : ""}`}
                >
                    {text}
                </div>
            ) : null}
        </div>,
        document.body,
    );
}
