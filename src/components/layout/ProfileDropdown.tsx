import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import type { SubscriptionTier } from "../../utils/billingPlans";
import { createPortal } from "react-dom";
import { useRecentAccounts } from "../../hooks/useRecentAccounts";
import {
    Sparkles,
    LogOut,
    Settings,
    Shield,
    UserRound,
    ChevronRight,
    Check,
    Plus,
} from "lucide-react";
import { useEffect, useLayoutEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { KeyboardShortcut, UserAvatar } from "../ui";
import { shortcutAriaKeys } from "../../utils/keyboardShortcuts";

type ProfileDropdownProps = {
    expanded?: boolean;
    subscriptionTier?: SubscriptionTier | null;
    showPlans?: boolean;
    showLogin?: boolean;
    showAdmin?: boolean;
    allowAccountSwitching?: boolean;
    avatarLabel?: string;
    avatarImageUrl?: string | null;
    busy: boolean;
    displayName: string;
    email?: string;
    onLogout: () => void;
    logoutDisabled?: boolean;
    logoutDisabledTitle?: string;
    showLogout: boolean;
};

export function ProfileDropdown({
    expanded = false,
    subscriptionTier,
    showPlans = false,
    showLogin = false,
    showAdmin = false,
    allowAccountSwitching = false,
    avatarLabel,
    avatarImageUrl,
    busy,
    displayName,
    email,
    onLogout,
    logoutDisabled = false,
    logoutDisabledTitle,
    showLogout,
}: ProfileDropdownProps) {
    const { t } = useTranslation();
    const { bindings } = useKeyboardShortcuts();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [accountsOpen, setAccountsOpen] = useState(false);
    const accounts = useRecentAccounts();
    useEffect(() => {
        if (!menuOpen || !allowAccountSwitching) setAccountsOpen(false);
    }, [menuOpen, allowAccountSwitching]);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const popupId = useId();
    const accountPopupId = useId();
    const accountTriggerRef = useRef<HTMLButtonElement>(null);
    const accountPopupRef = useRef<HTMLDivElement>(null);
    const [accountPosition, setAccountPosition] = useState({ left: 0, top: 0 });
    useLayoutEffect(() => {
        if (!accountsOpen || !email) return;
        const update = () => {
            const parent = popupRef.current?.getBoundingClientRect();
            const anchor = accountTriggerRef.current?.getBoundingClientRect();
            const popup = accountPopupRef.current;
            if (!parent || !anchor || !popup) return;
            const width = popup.offsetWidth;
            const height = popup.offsetHeight;
            const right = parent.right + 8;
            const left =
                right + width <= window.innerWidth - 8
                    ? right
                    : parent.left - width - 8 >= 8
                      ? parent.left - width - 8
                      : Math.max(8, window.innerWidth - width - 8);
            const top = Math.max(8, Math.min(anchor.top, window.innerHeight - height - 8));
            setAccountPosition({ left, top });
        };
        update();
        const observer = new ResizeObserver(update);
        if (accountPopupRef.current) observer.observe(accountPopupRef.current);
        if (popupRef.current) observer.observe(popupRef.current);
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [accountsOpen, email]);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname, location.search]);

    useEffect(() => {
        if (!menuOpen) return;
        popupRef.current?.querySelector<HTMLElement>("a, button:not(:disabled)")?.focus();

        const onPointerDown = (event: MouseEvent) => {
            if (
                !menuRef.current?.contains(event.target as Node) &&
                !accountPopupRef.current?.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                if (accountPopupRef.current) {
                    setAccountsOpen(false);
                    accountTriggerRef.current?.focus();
                    return;
                }
                setMenuOpen(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [menuOpen]);

    const identity = (
        <>
            {avatarLabel ? (
                <UserAvatar
                    className="profile-menu__avatar"
                    imageUrl={avatarImageUrl}
                    label={avatarLabel}
                />
            ) : (
                <UserRound className="profile-menu__guest-avatar" aria-hidden="true" />
            )}
            <div className="profile-menu__identity-text">
                <p className="profile-menu__name">{displayName}</p>
                {subscriptionTier && (
                    <p
                        className={`profile-menu__tier-label profile-menu__tier-label--${subscriptionTier}`}
                    >
                        {t(`billing.plans.${subscriptionTier}.name`)}
                    </p>
                )}
                {email ? <p className="profile-menu__email">{email}</p> : null}
            </div>
        </>
    );

    return (
        <div
            className="profile-menu"
            ref={menuRef}
            onBlur={(event) => {
                if (
                    !event.currentTarget.contains(event.relatedTarget as Node | null) &&
                    !accountPopupRef.current?.contains(event.relatedTarget as Node | null)
                )
                    setMenuOpen(false);
            }}
        >
            <button
                ref={triggerRef}
                type="button"
                className="profile-menu__trigger"
                aria-label={t(showLogin ? "authDialog.entry" : "nav.aria.openMenu")}
                aria-haspopup="dialog"
                aria-controls={menuOpen ? popupId : undefined}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((prev) => !prev)}
                title={displayName}
            >
                {avatarLabel ? (
                    <span className="profile-menu__avatar-wrap">
                        <UserAvatar
                            className="profile-menu__avatar"
                            imageUrl={avatarImageUrl}
                            label={avatarLabel}
                        />
                        {subscriptionTier && (
                            <span
                                className={`profile-menu__tier profile-menu__tier--${subscriptionTier}`}
                                aria-label={t("billing.plans.profileTier", {
                                    plan: t(`billing.plans.${subscriptionTier}.name`),
                                })}
                            >
                                {subscriptionTier === "free"
                                    ? "F"
                                    : subscriptionTier === "plus"
                                      ? "+"
                                      : "P"}
                            </span>
                        )}
                    </span>
                ) : (
                    <UserRound aria-hidden="true" />
                )}
                {expanded ? (
                    <span className="profile-menu__trigger-name">{displayName}</span>
                ) : null}
            </button>
            {menuOpen ? (
                <div
                    ref={popupRef}
                    id={popupId}
                    className="profile-menu__dropdown"
                    role="dialog"
                    aria-label={t("nav.profileMenu")}
                >
                    {!showLogin && allowAccountSwitching ? (
                        <button
                            type="button"
                            className="profile-menu__identity profile-menu__identity-button"
                            aria-label={t("recentAccounts.switch")}
                            aria-expanded={accountsOpen}
                            ref={accountTriggerRef}
                            aria-controls={accountsOpen ? accountPopupId : undefined}
                            aria-haspopup="dialog"
                            disabled={!email}
                            onClick={() => setAccountsOpen((value) => !value)}
                        >
                            {identity}
                            {email ? (
                                <ChevronRight
                                    className="profile-menu__chevron"
                                    aria-hidden="true"
                                />
                            ) : null}
                        </button>
                    ) : null}
                    {!showLogin && !allowAccountSwitching ? (
                        <div className="profile-menu__identity">{identity}</div>
                    ) : null}
                    {allowAccountSwitching && accountsOpen && email
                        ? createPortal(
                              <div
                                  className="profile-menu__accounts"
                                  ref={accountPopupRef}
                                  id={accountPopupId}
                                  style={accountPosition}
                                  role="dialog"
                                  aria-label={t("recentAccounts.switch")}
                              >
                                  <div className="profile-menu__account-current">
                                      <UserAvatar
                                          label={displayName.slice(0, 1)}
                                          imageUrl={avatarImageUrl}
                                      />
                                      <span>
                                          <strong>{displayName}</strong>
                                          <small>{email}</small>
                                      </span>
                                      <Check aria-label={t("recentAccounts.current")} />
                                  </div>
                                  {accounts
                                      .filter(
                                          (account) =>
                                              account.email.toLowerCase() !== email.toLowerCase(),
                                      )
                                      .map((account) => (
                                          <Link
                                              key={`${account.provider}:${account.email}`}
                                              className="profile-menu__account-link"
                                              to="/login?switch=1"
                                              state={{
                                                  accountEmail: account.email,
                                                  accountProvider: account.provider,
                                              }}
                                          >
                                              <UserAvatar
                                                  imageUrl={account.imageUrl}
                                                  label={(account.name || account.email).slice(
                                                      0,
                                                      1,
                                                  )}
                                              />
                                              <span>
                                                  <strong>{account.name || account.email}</strong>
                                                  <small>
                                                      {account.email} ·{" "}
                                                      {t(
                                                          `recentAccounts.providers.${account.provider}`,
                                                      )}
                                                  </small>
                                              </span>
                                          </Link>
                                      ))}
                                  <Link
                                      className="profile-menu__item profile-menu__account-add"
                                      to="/login?switch=1"
                                  >
                                      <Plus aria-hidden="true" />
                                      {t("recentAccounts.add")}
                                  </Link>
                              </div>,
                              document.body,
                          )
                        : null}
                    <Link
                        to="/settings"
                        className="profile-menu__item"
                        aria-label={t("nav.settings")}
                        aria-keyshortcuts={shortcutAriaKeys(bindings.openSettings)}
                    >
                        <span className="profile-menu__item-icon" aria-hidden="true">
                            <Settings />
                        </span>
                        <span>{t("nav.settings")}</span>
                        <KeyboardShortcut keys={bindings.openSettings} />
                    </Link>
                    {!showLogin && showPlans && (
                        <Link
                            to="/plans"
                            state={{ returnTo: location.pathname + location.search }}
                            className="profile-menu__item"
                        >
                            <span className="profile-menu__item-icon" aria-hidden="true">
                                <Sparkles />
                            </span>
                            <span>{t("billing.changePlan")}</span>
                        </Link>
                    )}
                    {showAdmin ? (
                        <Link to="/admin" className="profile-menu__item">
                            <span className="profile-menu__item-icon" aria-hidden="true">
                                <Shield />
                            </span>
                            <span>{t("admin.title")}</span>
                        </Link>
                    ) : null}
                    {showLogin ? (
                        <div className="profile-menu__guest-cta">
                            <p>{t("authDialog.guestTitle")}</p>
                            <p>{t("authDialog.guestDescription")}</p>
                            <Link className="profile-menu__login" to="/login">
                                {t("authDialog.login")}
                            </Link>
                        </div>
                    ) : null}
                    {showLogout ? (
                        <button
                            type="button"
                            className="profile-menu__item profile-menu__logout"
                            onClick={onLogout}
                            disabled={busy || logoutDisabled}
                            title={logoutDisabled ? logoutDisabledTitle : undefined}
                        >
                            <span className="profile-menu__item-icon" aria-hidden="true">
                                <LogOut />
                            </span>
                            <span>{busy ? t("nav.logoutBusy") : t("nav.logoutIdle")}</span>
                        </button>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
