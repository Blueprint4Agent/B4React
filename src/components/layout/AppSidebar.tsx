import { profileSidebarPath } from "../../utils/profileNavigation";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import type { SubscriptionTier } from "../../utils/billingPlans";
import { useToast } from "../../hooks/useToast";
import { resolveSettingsSection } from "../../utils/settingsSections";
import {
    Keyboard,
    AppWindow,
    Home,
    CreditCard,
    BookOpen,
    Users,
    Server,
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
import { shortcutAriaKeys } from "../../utils/keyboardShortcuts";
import { SidebarResizeHandle, SIDEBAR_DEFAULT_WIDTH } from "./SidebarResizeHandle";

type AppSidebarProps = {
    expanded: boolean;
    subscriptionTier?: SubscriptionTier | null;
    width?: number;
    onWidthChange?: (width: number) => void;
    onResizingChange?: (resizing: boolean) => void;
    onToggleExpanded: () => void;
};

export function AppSidebar({
    expanded,
    subscriptionTier,
    onToggleExpanded,
    width = SIDEBAR_DEFAULT_WIDTH,
    onWidthChange,
    onResizingChange,
}: AppSidebarProps) {
    const { t } = useTranslation();
    const { bindings } = useKeyboardShortcuts();
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
    const sidebarPath = profileSidebarPath(location);
    const isSettings = sidebarPath === "/settings";
    const [searchParams] = useSearchParams();
    const section = searchParams.has("billing_setup") ? "billing" : searchParams.get("section");
    const { profileImageUrl, user, logout } = useAuthContext();
    const showToast = useToast();
    const activeSection = resolveSettingsSection(section, Boolean(user));
    const { data: appConfig } = useAppConfig();
    const { checkNow, isDesktop, status } = useServerConnectivity();
    const [busy, setBusy] = useState(false);
    const development = appConfig?.app_mode === "development";
    const homePath = "/home";
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
            navigate(homePath, { replace: true });
        } catch {
            showToast(t("toast.logoutError"));
            navigate(homePath, { replace: true });
        } finally {
            setBusy(false);
        }
    };
    const isAdminPanel =
        sidebarPath.startsWith("/admin") && (user?.role === "admin" || user?.role === "manager");
    const items = isAdminPanel
        ? [
              {
                  path: homePath,
                  label: t("settings.backToApp"),
                  icon: ArrowLeft,
                  section: "back",
              },
              { path: "/admin", label: t("admin.users"), icon: Users, section: "users" },
              ...(user?.role === "admin"
                  ? [
                        {
                            path: "/admin/server",
                            label: t("serverStatus.title"),
                            icon: Server,
                            section: "server",
                        },
                    ]
                  : []),
          ]
        : isSettings
          ? [
                {
                    path: homePath,
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
                    label: t("settings.menu.account"),
                    icon: UserRound,
                    section: "account",
                },
                {
                    path: "/settings?section=keyboard",
                    label: t("settings.menu.keyboard"),
                    icon: Keyboard,
                    section: "keyboard",
                },
                {
                    path: "/settings?section=billing",
                    label: t("billing.title"),
                    icon: CreditCard,
                    section: "billing",
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
                    path: homePath,
                    label: t("nav.home"),
                    icon: Home,
                    section: "",
                },
                ...(development
                    ? [
                          {
                              path: "/show-case",
                              label: t("nav.sidebar.showCase"),
                              icon: AppWindow,
                              section: "showcase",
                          },
                      ]
                    : []),
            ];

    return (
        <aside className={expanded ? "app-sidebar app-sidebar--expanded" : "app-sidebar"}>
            <div className="app-sidebar__header">
                {expanded ? (
                    <>
                        <Link
                            to={homePath}
                            className="app-sidebar__brand"
                            aria-label={t("nav.home")}
                        >
                            <span className="app-sidebar__brand-name">{t("nav.brand")}</span>
                        </Link>
                        <Tooltip
                            content={
                                <span className="ui-shortcut-hint">
                                    {t("nav.sidebar.toggleClose")}
                                    <KeyboardShortcut keys={bindings.toggleSidebar} />
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
                                aria-keyshortcuts={shortcutAriaKeys(bindings.toggleSidebar)}
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
                                <KeyboardShortcut keys={bindings.toggleSidebar} />
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
                            aria-keyshortcuts={shortcutAriaKeys(bindings.toggleSidebar)}
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
                    .filter(
                        (item) =>
                            (user ||
                                !["account", "developers", "billing"].includes(item.section)) &&
                            (item.section !== "billing" || appConfig?.billing_enabled === true),
                    )
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
                                end={isAdminPanel}
                                aria-current={
                                    isSettings
                                        ? location.pathname !== "/profile" &&
                                          itemSection === activeSection
                                            ? "page"
                                            : false
                                        : undefined
                                }
                                className={({ isActive }) =>
                                    (
                                        isSettings
                                            ? location.pathname !== "/profile" &&
                                              itemSection === activeSection
                                            : isActive
                                    )
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
                    {(development
                        ? [
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
                          ]
                        : []
                    ).map(({ href, label, icon: Icon }) => (
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
                    showPlans={appConfig?.billing_enabled === true}
                    expanded={expanded}
                    showAdmin={user?.role === "admin" || user?.role === "manager"}
                    avatarLabel={user ? displayName.slice(0, 1).toUpperCase() : undefined}
                    avatarImageUrl={profileImageUrl}
                    subscriptionTier={subscriptionTier}
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
