import { LogOut, Settings, UserRound } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { KeyboardShortcut, UserAvatar } from "../ui";
import { APP_SHORTCUTS, shortcutAriaKeys } from "../../utils/keyboardShortcuts";

type ProfileDropdownProps = {
    expanded?: boolean;
    showLogin?: boolean;
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
    showLogin = false,
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
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const popupId = useId();
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!menuOpen) return;
        popupRef.current?.querySelector<HTMLElement>("a, button:not(:disabled)")?.focus();

        const onPointerDown = (event: MouseEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
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

    return (
        <div
            className="profile-menu"
            ref={menuRef}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null))
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
                    <UserAvatar
                        className="profile-menu__avatar"
                        imageUrl={avatarImageUrl}
                        label={avatarLabel}
                    />
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
                    {!showLogin ? (
                        <div className="profile-menu__identity">
                            {avatarLabel ? (
                                <UserAvatar
                                    className="profile-menu__avatar"
                                    imageUrl={avatarImageUrl}
                                    label={avatarLabel}
                                />
                            ) : (
                                <UserRound
                                    className="profile-menu__guest-avatar"
                                    aria-hidden="true"
                                />
                            )}
                            <div className="profile-menu__identity-text">
                                <p className="profile-menu__name">{displayName}</p>
                                {email ? <p className="profile-menu__email">{email}</p> : null}
                            </div>
                        </div>
                    ) : null}
                    <Link
                        to="/settings"
                        className="profile-menu__item"
                        aria-label={t("nav.settings")}
                        aria-keyshortcuts={shortcutAriaKeys(APP_SHORTCUTS.openSettings)}
                    >
                        <span className="profile-menu__item-icon" aria-hidden="true">
                            <Settings />
                        </span>
                        <span>{t("nav.settings")}</span>
                        <KeyboardShortcut keys={APP_SHORTCUTS.openSettings} />
                    </Link>
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
