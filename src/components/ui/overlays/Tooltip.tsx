import type { FocusEvent, ReactNode } from "react";
import { cloneElement, isValidElement, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type TooltipSide = "top" | "right" | "bottom" | "left";

type TooltipProps = {
    content: string;
    children: ReactNode;
    side?: TooltipSide;
    disabled?: boolean;
    className?: string;
};

export function Tooltip({
    content,
    children,
    side = "top",
    disabled = false,
    className,
}: TooltipProps) {
    const [open, setOpen] = useState(false);
    const dismissedRef = useRef(false);
    const keyboardFocusRef = useRef(false);
    const triggerRef = useRef<HTMLSpanElement>(null);
    const tooltipRef = useRef<HTMLSpanElement>(null);
    const id = useId();
    const visible = open && !disabled;
    const nextClassName = className ? `ui-tooltip ${className}` : "ui-tooltip";

    useLayoutEffect(() => {
        if (!visible) return;
        const wrapper = triggerRef.current;
        const tooltip = tooltipRef.current;
        if (!wrapper || !tooltip) return;
        // Measure the control, never its potentially stretched grid/flex wrapper.
        const trigger = wrapper.firstElementChild ?? wrapper;
        const gap = 8;
        const edge = 8;
        const opposite: Record<TooltipSide, TooltipSide> = {
            top: "bottom",
            bottom: "top",
            left: "right",
            right: "left",
        };
        const update = () => {
            const rect = trigger.getBoundingClientRect();
            const width = tooltip.offsetWidth;
            const height = tooltip.offsetHeight;
            const viewportWidth = document.documentElement.clientWidth;
            const viewportHeight = document.documentElement.clientHeight;
            const room: Record<TooltipSide, number> = {
                top: rect.top - edge,
                bottom: viewportHeight - rect.bottom - edge,
                left: rect.left - edge,
                right: viewportWidth - rect.right - edge,
            };
            const required = (side === "top" || side === "bottom" ? height : width) + gap;
            const resolved =
                room[side] < required && room[opposite[side]] > room[side] ? opposite[side] : side;
            let left = rect.left + (rect.width - width) / 2;
            let top = rect.top + (rect.height - height) / 2;
            if (resolved === "top") top = rect.top - height - gap;
            if (resolved === "bottom") top = rect.bottom + gap;
            if (resolved === "left") left = rect.left - width - gap;
            if (resolved === "right") left = rect.right + gap;
            tooltip.style.left = `${Math.max(edge, Math.min(left, viewportWidth - width - edge))}px`;
            tooltip.style.top = `${Math.max(edge, Math.min(top, viewportHeight - height - edge))}px`;
            tooltip.dataset.side = resolved;
            let clipped =
                rect.bottom <= 0 ||
                rect.top >= viewportHeight ||
                rect.right <= 0 ||
                rect.left >= viewportWidth;
            for (let parent = trigger.parentElement; parent; parent = parent.parentElement) {
                const style = getComputedStyle(parent);
                const bounds = parent.getBoundingClientRect();
                if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) {
                    clipped ||= rect.bottom <= bounds.top || rect.top >= bounds.bottom;
                }
                if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) {
                    clipped ||= rect.right <= bounds.left || rect.left >= bounds.right;
                }
            }
            tooltip.style.visibility = clipped ? "hidden" : "visible";
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(trigger);
        observer.observe(wrapper);
        observer.observe(tooltip);
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        const dismiss = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                dismissedRef.current = true;
                setOpen(false);
            }
        };
        const dismissOnWindowBlur = () => {
            dismissedRef.current = true;
            keyboardFocusRef.current = false;
            setOpen(false);
        };
        const dismissOutsidePointer = (event: PointerEvent) => {
            if (
                !wrapper.contains(event.target as Node) &&
                !(keyboardFocusRef.current && wrapper.contains(document.activeElement))
            ) {
                keyboardFocusRef.current = false;
                setOpen(false);
            }
        };
        document.addEventListener("pointermove", dismissOutsidePointer);
        window.addEventListener("keydown", dismiss);
        window.addEventListener("blur", dismissOnWindowBlur);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
            document.removeEventListener("pointermove", dismissOutsidePointer);
            window.removeEventListener("keydown", dismiss);
            window.removeEventListener("blur", dismissOnWindowBlur);
        };
    }, [visible, side, content]);

    const handleBlurCapture = (event: FocusEvent<HTMLSpanElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            dismissedRef.current = false;
            keyboardFocusRef.current = false;
            setOpen(false);
        }
    };
    const describedChildren = isValidElement<{ "aria-describedby"?: string }>(children)
        ? cloneElement(children, {
              "aria-describedby":
                  [children.props["aria-describedby"], visible ? id : undefined]
                      .filter(Boolean)
                      .join(" ") || undefined,
          })
        : children;

    return (
        <span
            className={nextClassName}
            onMouseEnter={() => {
                if (!dismissedRef.current) setOpen(true);
            }}
            onMouseLeave={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                if (
                    event.clientX < rect.left ||
                    event.clientX >= rect.right ||
                    event.clientY < rect.top ||
                    event.clientY >= rect.bottom
                ) {
                    dismissedRef.current = false;
                }
                // Always end pointer hover, even when window-exit coordinates are stale.
                if (!keyboardFocusRef.current) setOpen(false);
            }}
            onPointerDownCapture={() => {
                // A click may leave DOM focus behind; it is not keyboard tooltip intent.
                keyboardFocusRef.current = false;
            }}
            onFocusCapture={(event) => {
                keyboardFocusRef.current = event.target.matches(":focus-visible");
                if (keyboardFocusRef.current) setOpen(true);
            }}
            onBlurCapture={handleBlurCapture}
            onClickCapture={() => {
                dismissedRef.current = true;
                setOpen(false);
            }}
        >
            <span ref={triggerRef} className="ui-tooltip__trigger">
                {describedChildren}
            </span>
            {visible &&
                createPortal(
                    <span ref={tooltipRef} id={id} role="tooltip" className="ui-tooltip__content">
                        {content}
                    </span>,
                    document.body,
                )}
        </span>
    );
}
