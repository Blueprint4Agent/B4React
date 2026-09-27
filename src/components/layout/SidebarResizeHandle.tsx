import { useRef } from "react";
import { useTranslation } from "react-i18next";

export const SIDEBAR_DEFAULT_WIDTH = 224;
export const SIDEBAR_MIN_WIDTH = 200;
export const SIDEBAR_MAX_WIDTH = 360;
export function clampSidebarWidth(width: number): number {
    return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));
}

type SidebarResizeHandleProps = {
    width: number;
    onWidthChange: (width: number) => void;
    onResizingChange: (resizing: boolean) => void;
};

export function SidebarResizeHandle({
    width,
    onWidthChange,
    onResizingChange,
}: SidebarResizeHandleProps) {
    const { t } = useTranslation();
    const drag = useRef<{ x: number; width: number; pointerId: number } | null>(null);
    const finish = () => {
        drag.current = null;
        onResizingChange(false);
    };
    return (
        <div
            className="sidebar-resize-handle"
            role="separator"
            tabIndex={0}
            aria-label={t("nav.sidebar.resize")}
            aria-orientation="vertical"
            aria-valuemin={SIDEBAR_MIN_WIDTH}
            aria-valuemax={SIDEBAR_MAX_WIDTH}
            aria-valuenow={width}
            onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                drag.current = { x: event.clientX, width, pointerId: event.pointerId };
                onResizingChange(true);
            }}
            onPointerMove={(event) => {
                if (!drag.current || drag.current.pointerId !== event.pointerId) return;
                onWidthChange(
                    clampSidebarWidth(drag.current.width + event.clientX - drag.current.x),
                );
            }}
            onPointerUp={(event) => {
                if (drag.current?.pointerId !== event.pointerId) return;
                event.currentTarget.releasePointerCapture(event.pointerId);
                finish();
            }}
            onPointerCancel={finish}
            onLostPointerCapture={finish}
            onDoubleClick={() => onWidthChange(SIDEBAR_DEFAULT_WIDTH)}
            onKeyDown={(event) => {
                const next =
                    event.key === "ArrowLeft"
                        ? width - 16
                        : event.key === "ArrowRight"
                          ? width + 16
                          : event.key === "Home"
                            ? SIDEBAR_MIN_WIDTH
                            : event.key === "End"
                              ? SIDEBAR_MAX_WIDTH
                              : undefined;
                if (next === undefined) return;
                event.preventDefault();
                onWidthChange(clampSidebarWidth(next));
            }}
        />
    );
}
