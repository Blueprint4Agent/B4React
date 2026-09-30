import { useToast } from "../../hooks/useToast";
import { resolveSettingsSection } from "../../utils/settingsSections";
import {
    AppWindow,
    BookOpen,
    Users,
    ArrowLeft,
    Code2,
    SlidersHorizontal,
    Sun,
    UserRound,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from "react-router-dom";

import { useAuthContext } from "../../hooks/useAuth";
import { useServerConnectivity } from "../../hooks/connectivity/useServerConnectivity";
import { useAppConfig } from "../../hooks/useFeatures";
import { BrandMark, KeyboardShortcut, Tooltip } from "../ui";
import { ConnectivityStatus } from "./ConnectivityStatus";
import { ProfileDropdown } from "./ProfileDropdown";
import { APP_SHORTCUTS, shortcutAriaKeys } from "../../utils/keyboardShortcuts";
import { SidebarResizeHandle, SIDEBAR_DEFAULT_WIDTH } from "./SidebarResizeHandle";

type AppSidebarProps = {
    expanded: boolean;
    width?: number;
    onWidthChange?: (width: number) => void;
    onResizingChange?: (resizing: boolean) => void;
    onToggleExpanded: () => void;
};

export function AppSidebar({
    expanded,
    onToggleExpanded,
    width = SIDEBAR_DEFAULT_WIDTH,
    onWidthChange,
    onResizingChange,
}: AppSidebarProps) {
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
    const location = useLocation();
    const isSettings = location.pathname === "/settings";
    const [searchParams] = useSearchParams();
    const section = searchParams.get("section");
    const { user, logout } = useAuthContext();
    const showToast = useToast();
    const activeSection = resolveSettingsSection(section, Boolean(user));
    const { data: appConfig } = useAppConfig();
    const { checkNow, isDesktop, status } = useServerConnectivity();
    const [busy, setBusy] = useState(false);
    const loginEnabled = appConfig?.login_enabled === true;
    const logoutBlocked = isDesktop && status !== "online";
    const displayName =
        user?.name?.trim() || user?.email || t(loginEnabled ? "authDialog.entry" : "nav.guest");
    const onLogout = async () => {
        if (logoutBlocked) {
            void checkNow();
            return;
        }
        setBusy(true);
        try {
            await logout();
            showToast(t("toast.logoutSuccess"));
            navigate("/show-case", { replace: true });
        } catch {
            showToast(t("toast.logoutError"));
            navigate("/show-case", { replace: true });
        } finally {
            setBusy(false);
        }
    };
    const isAdminPanel = location.pathname === "/admin" && user?.role === "admin";
    const items = isAdminPanel
        ? [
              {
                  path: "/show-case",
                  label: t("settings.backToApp"),
                  icon: ArrowLeft,
                  section: "back",
              },
              { path: "/admin", label: t("admin.users"), icon: Users, section: "users" },
          ]
        : isSettings
          ? [
                {
                    path: "/show-case",
                    label: t("settings.backToApp"),
                    icon: ArrowLeft,
                    section: "back",
                },
                {
                    path: "/settings?section=general",
                    label: t("settings.menu.general"),
                    icon: SlidersHorizontal,
                    section: "general",
                },
                {
                    path: "/settings?section=appearance",
                    label: t("settings.menu.appearance"),
                    icon: Sun,
                    section: "appearance",
                },
                {
                    path: "/settings?section=account",
                    label: t("settings.menu.profile"),
                    icon: UserRound,
                    section: "account",
                },
                {
                    path: "/settings?section=developers",
                    label: t("settings.menu.developers"),
                    icon: Code2,
                    section: "developers",
                },
            ]
          : [
                {
                    path: "/show-case",
                    label: t("nav.sidebar.showCase"),
                    icon: AppWindow,
                    section: "",
                },
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
                            <span className="app-sidebar__brand-name">{t("nav.brand")}</span>
                        </Link>
                        <Tooltip
                            content={
                                <span className="ui-shortcut-hint">
                                    {t("nav.sidebar.toggleClose")}
                                    <KeyboardShortcut keys={APP_SHORTCUTS.toggleSidebar} />
                                </span>
                            }
                            side="right"
                        >
                            <button
                                type="button"
                                ref={toggleRef}
                                className="app-sidebar__toggle"
                                aria-label={t("nav.sidebar.toggleClose")}
                                aria-expanded={true}
                                aria-controls="app-sidebar-navigation"
                                aria-keyshortcuts={shortcutAriaKeys(APP_SHORTCUTS.toggleSidebar)}
                                onClick={onToggleExpanded}
                            >
                                <PanelLeftClose aria-hidden="true" />
                            </button>
                        </Tooltip>
                    </>
                ) : (
                    <Tooltip
                        content={
                            <span className="ui-shortcut-hint">
                                {t("nav.sidebar.toggleOpen")}
                                <KeyboardShortcut keys={APP_SHORTCUTS.toggleSidebar} />
                            </span>
                        }
                        side="right"
                    >
                        <button
                            type="button"
                            ref={toggleRef}
                            className="app-sidebar__brand app-sidebar__toggle app-sidebar__brand-toggle"
                            aria-label={t("nav.sidebar.toggleOpen")}
                            aria-expanded={false}
                            aria-controls="app-sidebar-navigation"
                            aria-keyshortcuts={shortcutAriaKeys(APP_SHORTCUTS.toggleSidebar)}
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
                aria-label={t(
                    isAdminPanel
                        ? "admin.title"
                        : isSettings
                          ? "settings.menu.title"
                          : "nav.sidebar.aria",
                )}
            >
                {items
                    .filter((item) => user || !["account", "developers"].includes(item.section))
                    .map(({ path, label, icon: Icon, section: itemSection }) => (
                        <Tooltip
                            key={path}
                            content={label}
                            side="right"
                            className="app-sidebar__item-tooltip"
                            disabled={expanded}
                        >
                            <NavLink
                                to={path}
                                aria-current={
                                    isSettings
                                        ? itemSection === activeSection
                                            ? "page"
                                            : false
                                        : undefined
                                }
                                className={({ isActive }) =>
                                    (isSettings ? itemSection === activeSection : isActive)
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
                <div className="app-sidebar__nav">
                    {[
                        {
                            href: "https://github.com/Blueprint4Agent/B4FastAPI",
                            label: t("nav.sidebar.github"),
                            icon: null,
                        },
                        {
                            href: "https://blueprint4agent.github.io/docs",
                            label: t("nav.sidebar.documentation"),
                            icon: BookOpen,
                        },
                    ].map(({ href, label, icon: Icon }) => (
                        <Tooltip
                            key={href}
                            content={label}
                            side="right"
                            className="app-sidebar__item-tooltip"
                            disabled={expanded}
                        >
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="app-sidebar__item"
                                aria-label={label}
                            >
                                {Icon ? (
                                    <Icon aria-hidden="true" />
                                ) : (
                                    <span className="app-sidebar__github-mark" aria-hidden="true" />
                                )}
                                {expanded ? (
                                    <span className="app-sidebar__item-label">{label}</span>
                                ) : null}
                            </a>
                        </Tooltip>
                    ))}
                </div>
                <ProfileDropdown
                    expanded={expanded}
                    showAdmin={user?.role === "admin"}
                    avatarLabel={user ? displayName.slice(0, 1).toUpperCase() : undefined}
                    avatarImageUrl={user?.profile_image_url}
                    busy={busy}
                    displayName={displayName}
                    email={user?.email}
                    onLogout={() => void onLogout()}
                    logoutDisabled={logoutBlocked}
                    logoutDisabledTitle={t("nav.logoutUnavailable")}
                    allowAccountSwitching={Boolean(user) && loginEnabled}
                    showLogout={Boolean(user) && loginEnabled}
                    showLogin={!user && loginEnabled}
                />
            </div>
            {expanded && onWidthChange && onResizingChange ? (
                <SidebarResizeHandle
                    width={width}
                    onWidthChange={onWidthChange}
                    onResizingChange={onResizingChange}
                />
            ) : null}
        </aside>
    );
}
