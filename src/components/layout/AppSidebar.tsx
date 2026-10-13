import { getCoffeeSupportUrl } from "../../utils/coffeeSupport";
import { useAppNavigation } from "../../hooks/useAppNavigation";
import type { AppLayoutMode } from "../../service.config";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import type { SubscriptionTier } from "../../utils/billingPlans";
import { useToast } from "../../hooks/useToast";
import { Coffee, BookOpen, PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuthContext } from "../../hooks/useAuth";
import { useServerConnectivity } from "../../hooks/connectivity/useServerConnectivity";
import { useAppConfig } from "../../hooks/useFeatures";
import { BrandMark, Button, KeyboardShortcut, Tooltip } from "../ui";
import { ConnectivityStatus } from "./ConnectivityStatus";
import { ProfileDropdown } from "./ProfileDropdown";
import { shortcutAriaKeys } from "../../utils/keyboardShortcuts";
import { SidebarResizeHandle, SIDEBAR_DEFAULT_WIDTH } from "./SidebarResizeHandle";

type AppSidebarProps = {
    mode?: AppLayoutMode;
    expanded: boolean;
    subscriptionTier?: SubscriptionTier | null;
    inboxUnread?: number | null;
    width?: number;
    onWidthChange?: (width: number) => void;
    onResizingChange?: (resizing: boolean) => void;
    onToggleExpanded: () => void;
};

export function AppSidebar({
    mode = "sidebar",
    expanded,
    subscriptionTier,
    inboxUnread,
    onToggleExpanded,
    width = SIDEBAR_DEFAULT_WIDTH,
    onWidthChange,
    onResizingChange,
}: AppSidebarProps) {
    const { t } = useTranslation();
    const isSidebar = mode === "sidebar";
    const chromeRef = useRef<HTMLElement>(null);
    const { bindings } = useKeyboardShortcuts();
    const toggleRef = useRef<HTMLButtonElement>(null);
    const previousExpanded = useRef(expanded);
    useEffect(() => {
        if (previousExpanded.current !== expanded) {
            if (isSidebar) toggleRef.current?.focus({ preventScroll: true });
            else if (!expanded)
                document
                    .querySelector<HTMLButtonElement>(".app-header__toggle")
                    ?.focus({ preventScroll: true });
            previousExpanded.current = expanded;
        }
    }, [expanded, isSidebar]);
    const navigate = useNavigate();
    const navigation = useAppNavigation();
    const showLabels = isSidebar ? expanded : true;
    const { isSettings, isAdminPanel, isSectionActive } = navigation;
    const items = isSidebar ? navigation.items : navigation.globalItems;
    const Chrome = isSidebar ? "aside" : "header";
    const { profileImageUrl, user, logout } = useAuthContext();
    const showToast = useToast();
    const { data: appConfig } = useAppConfig();
    const { checkNow, isDesktop, status } = useServerConnectivity();
    const [busy, setBusy] = useState(false);
    const development = appConfig?.app_mode === "development";
    const coffeeUrl = getCoffeeSupportUrl(
        appConfig?.app_mode,
        import.meta.env.VITE_BUY_ME_A_COFFEE_ENABLED,
        import.meta.env.VITE_BUY_ME_A_COFFEE_URL,
    );
    const homePath = "/home";
    useEffect(() => {
        if (isSidebar || !expanded) return;
        chromeRef.current
            ?.querySelector<HTMLAnchorElement>(".app-header__menu a")
            ?.focus({ preventScroll: true });
        const close = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !document.querySelector(".profile-menu__dropdown"))
                onToggleExpanded();
        };
        const outside = (event: PointerEvent) => {
            if (!chromeRef.current?.contains(event.target as Node)) onToggleExpanded();
        };
        document.addEventListener("keydown", close);
        document.addEventListener("pointerdown", outside);
        return () => {
            document.removeEventListener("keydown", close);
            document.removeEventListener("pointerdown", outside);
        };
    }, [isSidebar, expanded, onToggleExpanded]);
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

    const navigationLinks = (
        <>
            {items.map(({ path, label, icon: Icon, section: itemSection }) => (
                <Tooltip
                    key={path}
                    content={label}
                    side="right"
                    className="app-sidebar__item-tooltip"
                    disabled={showLabels}
                >
                    <NavLink
                        to={path}
                        end={isSidebar && isAdminPanel}
                        aria-current={
                            isSidebar && isSettings
                                ? isSectionActive(itemSection)
                                    ? "page"
                                    : false
                                : undefined
                        }
                        className={({ isActive }) =>
                            (isSidebar && isSettings ? isSectionActive(itemSection) : isActive)
                                ? "app-sidebar__item app-sidebar__item--active"
                                : "app-sidebar__item"
                        }
                        aria-label={label}
                    >
                        <Icon aria-hidden="true" />
                        {showLabels ? (
                            <span className="app-sidebar__item-label">{label}</span>
                        ) : null}
                    </NavLink>
                </Tooltip>
            ))}
        </>
    );
    const resourceLinks = (
        <div className="app-sidebar__nav app-resource-links">
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
                      ...(coffeeUrl
                          ? [{ href: coffeeUrl, label: "Buy Me a Coffee", icon: Coffee }]
                          : []),
                  ]
                : []
            ).map(({ href, label, icon: Icon }) => (
                <Tooltip
                    key={href}
                    content={label}
                    side={isSidebar ? "right" : "bottom"}
                    className="app-sidebar__item-tooltip"
                    disabled={isSidebar && expanded}
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
                        {showLabels ? (
                            <span className="app-sidebar__item-label">{label}</span>
                        ) : null}
                    </a>
                </Tooltip>
            ))}
        </div>
    );
    const menuToggle = (
        <Tooltip content={t("layout.openMenu")} side="bottom" className="app-header__menu-control">
            <Button
                className="app-header__toggle"
                iconOnly
                appearance="text"
                aria-label={t("layout.openMenu")}
                aria-expanded={expanded}
                aria-controls="app-header-navigation"
                onClick={onToggleExpanded}
            >
                <Menu aria-hidden="true" />
            </Button>
        </Tooltip>
    );

    return (
        <Chrome
            ref={chromeRef}
            className={
                isSidebar
                    ? expanded
                        ? "app-sidebar app-sidebar--expanded"
                        : "app-sidebar"
                    : `app-header app-header--${mode}${expanded ? " app-header--open" : ""}`
            }
        >
            <div className="app-sidebar__header">
                {!isSidebar ? (
                    <>
                        {menuToggle}
                        <Link
                            to={homePath}
                            className="app-sidebar__brand"
                            aria-label={t("nav.home")}
                        >
                            <BrandMark />
                            <span className="app-sidebar__brand-name">{t("nav.brand")}</span>
                        </Link>
                    </>
                ) : expanded ? (
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
            {mode !== "focused" ? (
                <nav
                    id="app-sidebar-navigation"
                    className="app-sidebar__nav"
                    aria-label={isSidebar ? navigation.label : t("nav.sidebar.aria")}
                >
                    {navigationLinks}
                </nav>
            ) : null}
            <div className="app-sidebar__footer">
                <ConnectivityStatus placement={isSidebar ? "sidebar" : "navbar"} />
                {resourceLinks}

                <ProfileDropdown
                    tooltipSide={isSidebar ? "right" : "bottom"}
                    showPlans={appConfig?.billing_enabled === true}
                    expanded={isSidebar && expanded}
                    showAdmin={user?.role === "admin" || user?.role === "manager"}
                    showAdminDemo={appConfig?.demo_enabled === true && user?.role !== "admin"}
                    inboxUnread={inboxUnread}
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
            {!isSidebar && expanded ? (
                <nav
                    id="app-header-navigation"
                    className="app-header__menu"
                    aria-label={t("layout.openMenu")}
                >
                    <div className="app-header__menu-links">{navigationLinks}</div>
                </nav>
            ) : null}
            {isSidebar && expanded && onWidthChange && onResizingChange ? (
                <SidebarResizeHandle
                    width={width}
                    onWidthChange={onWidthChange}
                    onResizingChange={onResizingChange}
                />
            ) : null}
        </Chrome>
    );
}
