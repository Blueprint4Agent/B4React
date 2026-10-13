import { useAppLayout } from "../../hooks/useAppLayout";
import { useAppNavigation } from "../../hooks/useAppNavigation";
import { SectionNavigation } from "./SectionNavigation";
import { storageKey } from "../../utils/basePath";
import { useAuthContext } from "../../hooks/useAuth";
import { profileSidebarPath } from "../../utils/profileNavigation";
import type { SubscriptionTier } from "../../utils/billingPlans";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppSidebar } from "./AppSidebar";
import { useAppShortcuts } from "../../hooks/useAppShortcuts";
import { clampSidebarWidth, SIDEBAR_DEFAULT_WIDTH } from "./SidebarResizeHandle";

const SIDEBAR_WIDTH_KEY = storageKey("blueprint_sidebar_width");
function readSidebarWidth(): number {
    try {
        const stored = window.localStorage.getItem(SIDEBAR_WIDTH_KEY);
        const value = stored === null ? SIDEBAR_DEFAULT_WIDTH : Number(stored);
        return Number.isFinite(value) ? clampSidebarWidth(value) : SIDEBAR_DEFAULT_WIDTH;
    } catch {
        return SIDEBAR_DEFAULT_WIDTH;
    }
}

type AppLayoutProps = {
    children: ReactNode;
    subscriptionTier?: SubscriptionTier | null;
    inboxUnread?: number | null;
};

export function AppLayout({ children, subscriptionTier, inboxUnread }: AppLayoutProps) {
    const { t } = useTranslation();
    const { mode } = useAppLayout();
    const { hasSections } = useAppNavigation();
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [openMenuPath, setOpenMenuPath] = useState<string | null>(null);
    const location = useLocation();
    const menuPath = mode + location.pathname + location.search;
    const expanded = mode === "sidebar" ? sidebarExpanded : openMenuPath === menuPath;
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
    const navigate = useNavigate();
    const toggleSidebar = useCallback(() => {
        setResizing(false);
        if (mode === "sidebar") setSidebarExpanded((value) => !value);
        else setOpenMenuPath((value) => (value === menuPath ? null : menuPath));
    }, [mode, menuPath]);
    const openSettings = useCallback(() => navigate("/settings"), [navigate]);
    const { user } = useAuthContext();
    const openProfile = useCallback(
        () => navigate("/profile", { state: { profileSidebarPath: profileSidebarPath(location) } }),
        [navigate, location],
    );
    useAppShortcuts({ toggleSidebar, openSettings, openProfile: user ? openProfile : undefined });
    const pathname = location.pathname;
    const isSettings =
        pathname === "/notifications" ||
        pathname === "/settings" ||
        pathname === "/home" ||
        pathname === "/admin" ||
        pathname.startsWith("/admin/") ||
        pathname === "/demo/admin" ||
        pathname.startsWith("/demo/admin/");
    return (
        <div
            data-layout={mode}
            className={`app-shell app-shell--${mode}${mode === "sidebar" && expanded ? " app-shell--expanded" : ""}${isSettings ? " app-shell--settings" : ""}${resizing ? " app-shell--resizing" : ""}`}
            style={{ "--sidebar-expanded-width": `${sidebarWidth}px` } as CSSProperties}
        >
            {mode === "sidebar" && expanded ? (
                <button
                    className="app-sidebar-backdrop"
                    type="button"
                    aria-label={t("nav.sidebar.toggleClose")}
                    onClick={() => setSidebarExpanded(false)}
                />
            ) : null}
            <AppSidebar
                mode={mode}
                expanded={expanded}
                subscriptionTier={subscriptionTier}
                inboxUnread={inboxUnread}
                onToggleExpanded={toggleSidebar}
                width={sidebarWidth}
                onWidthChange={onWidthChange}
                onResizingChange={setResizing}
            />
            <main
                className={`app-main${mode !== "sidebar" && hasSections ? " app-main--workspace" : ""}`}
            >
                <div
                    className={`app-main__content${mode !== "sidebar" && hasSections ? " app-workspace" : ""}`}
                >
                    {mode !== "sidebar" && hasSections ? <SectionNavigation /> : null}
                    <div className="app-page-content">{children}</div>
                </div>
            </main>
        </div>
    );
}
