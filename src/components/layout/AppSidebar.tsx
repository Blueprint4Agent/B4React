import { AppWindow, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuthContext } from "../../hooks/useAuth";
import { useServerConnectivity } from "../../hooks/connectivity/useServerConnectivity";
import { useAppConfig } from "../../hooks/useFeatures";
import { useTheme } from "../../hooks/useTheme";
import { BrandMark, Tooltip } from "../ui";
import { ConnectivityStatus } from "./ConnectivityStatus";
import { ProfileDropdown } from "./ProfileDropdown";

type AppSidebarProps = {
    expanded: boolean;
    onToggleExpanded: () => void;
};

export function AppSidebar({ expanded, onToggleExpanded }: AppSidebarProps) {
    const { t } = useTranslation();
    const toggleRef = useRef<HTMLButtonElement>(null);
    const previousExpanded = useRef(expanded);
    useEffect(() => {
        if (previousExpanded.current !== expanded) {
            toggleRef.current?.focus({ preventScroll: true });
            previousExpanded.current = expanded;
        }
    }, [expanded]);
    const navigate = useNavigate();
    const { user, logout } = useAuthContext();
    const { data: appConfig } = useAppConfig();
    const { checkNow, isDesktop, status } = useServerConnectivity();
    const { themeMode, setThemeMode } = useTheme();
    const [busy, setBusy] = useState(false);
    const loginEnabled = appConfig?.login_enabled === true;
    const logoutBlocked = isDesktop && status !== "online";
    const displayName = user?.name?.trim() || user?.email || t("nav.guest");
    const onLogout = async () => {
        if (logoutBlocked) {
            void checkNow();
            return;
        }
        setBusy(true);
        try {
            await logout();
            navigate(loginEnabled ? "/login" : "/show-case", { replace: true });
        } finally {
            setBusy(false);
        }
    };
    const items = [
        { path: "/show-case", label: t("nav.sidebar.showCase"), icon: AppWindow },
        { path: "/settings", label: t("nav.sidebar.settings"), icon: Settings },
    ];

    return (
        <aside className={expanded ? "app-sidebar app-sidebar--expanded" : "app-sidebar"}>
            <div className="app-sidebar__header">
                {expanded ? (
                    <>
                        <Link
                            to="/show-case"
                            className="app-sidebar__brand"
                            aria-label={t("nav.aria.goShowCase")}
                        >
                            <BrandMark />
                            <span className="app-sidebar__brand-name">{t("nav.brand")}</span>
                        </Link>
                        <Tooltip content={t("nav.sidebar.toggleClose")} side="right">
                            <button
                                type="button"
                                ref={toggleRef}
                                className="app-sidebar__toggle"
                                aria-label={t("nav.sidebar.toggleClose")}
                                aria-expanded={true}
                                aria-controls="app-sidebar-navigation"
                                onClick={onToggleExpanded}
                            >
                                <PanelLeftClose aria-hidden="true" />
                            </button>
                        </Tooltip>
                    </>
                ) : (
                    <Tooltip content={t("nav.sidebar.toggleOpen")} side="right">
                        <button
                            type="button"
                            ref={toggleRef}
                            className="app-sidebar__brand app-sidebar__toggle app-sidebar__brand-toggle"
                            aria-label={t("nav.sidebar.toggleOpen")}
                            aria-expanded={false}
                            aria-controls="app-sidebar-navigation"
                            onClick={onToggleExpanded}
                        >
                            <BrandMark />
                            <PanelLeftOpen
                                className="app-sidebar__expand-icon"
                                aria-hidden="true"
                            />
                        </button>
                    </Tooltip>
                )}
            </div>
            <nav
                id="app-sidebar-navigation"
                className="app-sidebar__nav"
                aria-label={t("nav.sidebar.aria")}
            >
                {items.map(({ path, label, icon: Icon }) => (
                    <Tooltip
                        key={path}
                        content={label}
                        side="right"
                        className="app-sidebar__item-tooltip"
                        disabled={expanded}
                    >
                        <NavLink
                            to={path}
                            className={({ isActive }) =>
                                isActive
                                    ? "app-sidebar__item app-sidebar__item--active"
                                    : "app-sidebar__item"
                            }
                            aria-label={label}
                        >
                            <Icon aria-hidden="true" />
                            {expanded ? (
                                <span className="app-sidebar__item-label">{label}</span>
                            ) : null}
                        </NavLink>
                    </Tooltip>
                ))}
            </nav>
            <div className="app-sidebar__footer">
                <ConnectivityStatus placement="sidebar" />
                <ProfileDropdown
                    expanded={expanded}
                    avatarLabel={user ? displayName.slice(0, 1).toUpperCase() : undefined}
                    avatarImageUrl={user?.profile_image_url}
                    busy={busy}
                    displayName={displayName}
                    email={user?.email}
                    onLogout={() => void onLogout()}
                    onChangeTheme={setThemeMode}
                    logoutDisabled={logoutBlocked}
                    logoutDisabledTitle={t("nav.logoutUnavailable")}
                    showLogout={Boolean(user) && loginEnabled}
                    themeMode={themeMode}
                />
            </div>
        </aside>
    );
}
