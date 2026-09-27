import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppSidebar } from "./AppSidebar";
import { clampSidebarWidth, SIDEBAR_DEFAULT_WIDTH } from "./SidebarResizeHandle";

const SIDEBAR_WIDTH_KEY = "blueprint_sidebar_width";
function readSidebarWidth(): number {
    try {
        const stored = window.localStorage.getItem(SIDEBAR_WIDTH_KEY);
        const value = stored === null ? SIDEBAR_DEFAULT_WIDTH : Number(stored);
        return Number.isFinite(value) ? clampSidebarWidth(value) : SIDEBAR_DEFAULT_WIDTH;
    } catch {
        return SIDEBAR_DEFAULT_WIDTH;
    }
}

type AppLayoutProps = { children: ReactNode };

export function AppLayout({ children }: AppLayoutProps) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(readSidebarWidth);
    const [resizing, setResizing] = useState(false);
    const onWidthChange = (width: number) => {
        const next = clampSidebarWidth(width);
        setSidebarWidth(next);
        try {
            window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(next));
        } catch {
            /* Keep resizing available when storage is blocked. */
        }
    };
    const isSettings = useLocation().pathname === "/settings";
    return (
        <div
            className={`app-shell${expanded ? " app-shell--expanded" : ""}${isSettings ? " app-shell--settings" : ""}${resizing ? " app-shell--resizing" : ""}`}
            style={{ "--sidebar-expanded-width": `${sidebarWidth}px` } as CSSProperties}
        >
            {expanded ? (
                <button
                    className="app-sidebar-backdrop"
                    type="button"
                    aria-label={t("nav.sidebar.toggleClose")}
                    onClick={() => setExpanded(false)}
                />
            ) : null}
            <AppSidebar
                expanded={expanded}
                onToggleExpanded={() => {
                    setResizing(false);
                    setExpanded((value) => !value);
                }}
                width={sidebarWidth}
                onWidthChange={onWidthChange}
                onResizingChange={setResizing}
            />
            <main className="app-main">
                <div className="app-main__content">{children}</div>
            </main>
        </div>
    );
}
