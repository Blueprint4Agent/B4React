import { AccountNameSettings } from "./AccountNameSettings";
import { useCurrentPlan } from "../../hooks/api/billing/useCurrentPlan";
import { CurrentPlanRow } from "../../components/features/billing/CurrentPlanRow";
import { PasswordSettings } from "./PasswordSettings";
import { KeyboardSettings } from "./KeyboardSettings";
import { BillingSettingsPage } from "../billing/BillingSettingsPage";
import { useToast } from "../../hooks/useToast";
import { resolveSettingsSection } from "../../utils/settingsSections";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ConnectedOAuthProvidersCard } from "../../components/features/auth/ConnectedOAuthProvidersCard";
import { DeveloperApiKeysSection } from "../../components/features/apiKey/DeveloperApiKeysSection";
import {
    Button,
    DropdownMenu,
    InlineMessage,
    PrimaryCard,
    ModalButton,
    ThemePreviewSelector,
} from "../../components/ui";
import type { APIKeyRecord } from "../../hooks/api/apiKey/useApiKeyApi";
import { useApiKeys } from "../../hooks/api/apiKey/useApiKeys";
import { useAccountDeletion } from "../../hooks/api/auth/useAccountDeletion";
import { AccountDeletionDialog } from "../../components/features/auth/AccountDeletionDialog";
import { useAuthContext } from "../../hooks/useAuth";
import { useAppConfig } from "../../hooks/useFeatures";
import { useTheme } from "../../hooks/useTheme";
import { resolveAPIKeyExpiresAt, type APIKeyExpiryOption } from "../../utils/date";

const DEFAULT_API_KEY_EXPIRY_OPTION: APIKeyExpiryOption = "30d";
const SUPPORTED_LANGUAGE_IDS = ["en", "ko"] as const;
type SupportedLanguageId = (typeof SUPPORTED_LANGUAGE_IDS)[number];

export function SettingsPage() {
    const { t, i18n } = useTranslation();
    const showToast = useToast();
    const navigate = useNavigate();
    const accountDeletion = useAccountDeletion(() => {
        showToast(t("settings.account.deleted"));
        navigate("/home", { replace: true });
    });
    const { user, loading: authLoading } = useAuthContext();
    const { data: appConfig } = useAppConfig();
    const plan = useCurrentPlan(user?.id);
    const { themeMode, setThemeMode } = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const section =
        searchParams.has("billing_setup") ||
        searchParams.has("billing_checkout") ||
        searchParams.has("billing_card_setup")
            ? "billing"
            : searchParams.get("section");
    const activeMenu = resolveSettingsSection(
        section === "billing" && !appConfig?.billing_enabled ? "general" : section,
        Boolean(user),
    );
    useEffect(() => {
        if (!authLoading && !user && section !== activeMenu) {
            setSearchParams(
                (previous) => {
                    const next = new URLSearchParams(previous);
                    next.set("section", activeMenu);
                    return next;
                },
                { replace: true },
            );
        }
    }, [authLoading, user, section, activeMenu, setSearchParams]);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newApiKeyName, setNewApiKeyName] = useState("");
    const [newApiKeyExpiryOption, setNewApiKeyExpiryOption] = useState<APIKeyExpiryOption>(
        DEFAULT_API_KEY_EXPIRY_OPTION,
    );
    const [createdSecret, setCreatedSecret] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [deactivateTarget, setDeactivateTarget] = useState<APIKeyRecord | null>(null);
    const loginEnabled = appConfig?.login_enabled === true;

    const showDevelopers = activeMenu === "developers";
    const {
        items: apiKeyItems,
        loading: apiKeyLoading,
        errorMessage: apiKeyErrorMessage,
        createBusy,
        createErrorMessage,
        deleteBusy: deactivateBusy,
        toggleBusyId,
        create: createKey,
        deleteKey,
        setEnabled: toggleKey,
        clearCreateError,
    } = useApiKeys({
        ownerId: user?.id,
        enabled: showDevelopers,
        realtimeEnabled: loginEnabled,
        onMutationResult: (action, success) =>
            showToast(t(`toast.key${action}${success ? "Success" : "Error"}`)),
    });
    const connectedOAuthProviders = user?.oauth_providers ?? [];
    const normalizedLanguageId =
        (i18n.resolvedLanguage ?? i18n.language ?? "en").split("-")[0] || "en";
    const currentLanguageId: SupportedLanguageId = SUPPORTED_LANGUAGE_IDS.includes(
        normalizedLanguageId as SupportedLanguageId,
    )
        ? (normalizedLanguageId as SupportedLanguageId)
        : "en";
    const currentLanguageLabel = t(`settings.general.languages.${currentLanguageId}`);
    const resolveOAuthProviderLabel = (provider: string) => {
        if (provider === "google") {
            return t("settings.profile.oauthProviders.google");
        }
        if (provider === "github") {
            return t("settings.profile.oauthProviders.github");
        }
        return provider.toUpperCase();
    };
    const openCreateModal = useCallback(() => {
        setCreateModalOpen(true);
        clearCreateError();
    }, [clearCreateError]);

    const closeCreateModal = useCallback(() => {
        if (createBusy) {
            return;
        }
        setCreateModalOpen(false);
        setNewApiKeyName("");
        setNewApiKeyExpiryOption(DEFAULT_API_KEY_EXPIRY_OPTION);
        clearCreateError();
    }, [createBusy, clearCreateError]);

    const handleToggleStatus = useCallback(
        (id: number, enabled: boolean) => {
            void toggleKey(id, enabled);
        },
        [toggleKey],
    );

    const handleCreateApiKey = useCallback(() => {
        const name = newApiKeyName.trim();
        if (!name) return;
        void createKey(name, resolveAPIKeyExpiresAt(newApiKeyExpiryOption)).then((secret) => {
            if (!secret) return;
            setCreateModalOpen(false);
            setNewApiKeyName("");
            setNewApiKeyExpiryOption(DEFAULT_API_KEY_EXPIRY_OPTION);
            setCreatedSecret(secret);
            setCopied(false);
        });
    }, [createKey, newApiKeyName, newApiKeyExpiryOption]);

    const closeSecretModal = useCallback(() => {
        setCreatedSecret(null);
        setCopied(false);
    }, []);

    const copySecret = useCallback(async () => {
        if (!createdSecret) return;
        try {
            await navigator.clipboard.writeText(createdSecret);
            setCopied(true);
            showToast(t("toast.copySuccess"));
        } catch {
            showToast(t("toast.copyError"));
        }
    }, [createdSecret, showToast, t]);

    const closeDeleteModal = useCallback(() => {
        if (deactivateBusy) {
            return;
        }
        setDeactivateTarget(null);
    }, [deactivateBusy]);

    const confirmDelete = useCallback(() => {
        if (!deactivateTarget) return;
        void deleteKey(deactivateTarget.id).then((deleted) => {
            if (deleted) setDeactivateTarget(null);
        });
    }, [deactivateTarget, deleteKey]);

    useEffect(() => {
        setCreatedSecret(null);
        setCopied(false);
        setCreateModalOpen(false);
        setDeactivateTarget(null);
    }, [user?.id]);

    return (
        <section className="settings-layout">
            <PrimaryCard key={activeMenu} className="settings-content-card">
                {activeMenu === "account" ? (
                    <>
                        <header className="settings-content-card__header">
                            <h1>
                                <span>{t("settings.account.title")}</span>
                            </h1>
                            <p>{t("settings.account.subtitle")}</p>
                        </header>
                        <section
                            className="settings-general-content"
                            aria-label={t("settings.account.title")}
                        >
                            {user ? <AccountNameSettings key={user.id} name={user.name} /> : null}
                            <article className="settings-row">
                                <h2>{t("settings.labels.email")}</h2>
                                <p>{user?.email ?? "—"}</p>
                            </article>
                            <article className="settings-row">
                                <h2>{t("settings.profile.joined")}</h2>
                                <p>
                                    {user?.created_at
                                        ? new Date(user.created_at).toLocaleDateString(
                                              i18n.resolvedLanguage,
                                              { year: "numeric", month: "long", day: "numeric" },
                                          )
                                        : "—"}
                                </p>
                            </article>
                            <article className="settings-row">
                                <h2>{t("settings.menu.profile")}</h2>
                                <Button appearance="pill" onClick={() => navigate("/profile")}>
                                    {t("settings.account.editProfile")}
                                </Button>
                            </article>
                            <CurrentPlanRow
                                plan={plan}
                                onOpen={() => navigate("/settings?section=billing")}
                            />
                            {loginEnabled && appConfig?.oauth_enabled ? (
                                <ConnectedOAuthProvidersCard
                                    title={t("settings.profile.oauthConnectedTitle")}
                                    providers={connectedOAuthProviders}
                                    emptyText={t("settings.profile.oauthConnectedEmpty")}
                                    getProviderLabel={resolveOAuthProviderLabel}
                                />
                            ) : null}
                            {loginEnabled && user ? (
                                <PasswordSettings
                                    key={user.id}
                                    hasPassword={user.has_password === true}
                                    emailEnabled={appConfig?.email_enabled === true}
                                    email={user.email}
                                />
                            ) : null}
                            {loginEnabled ? (
                                <section
                                    className="settings-row settings-row--account-delete"
                                    aria-label={t("settings.account.deleteTitle")}
                                >
                                    <div>
                                        <h2>{t("settings.account.deleteTitle")}</h2>
                                        <p className="muted">
                                            {t("settings.account.deleteDescription")}
                                        </p>
                                    </div>
                                    <ModalButton
                                        variant="danger"
                                        disabled={!appConfig?.email_enabled}
                                        onClick={accountDeletion.show}
                                    >
                                        {t("settings.account.deleteAction")}
                                    </ModalButton>
                                    {!appConfig?.email_enabled ? (
                                        <InlineMessage tone="info">
                                            {t("settings.account.emailRequired")}
                                        </InlineMessage>
                                    ) : null}
                                    <AccountDeletionDialog {...accountDeletion.dialog} />
                                </section>
                            ) : null}
                        </section>
                    </>
                ) : activeMenu === "billing" && user ? (
                    <BillingSettingsPage key={user.id} ownerId={user.id} email={user.email} />
                ) : showDevelopers ? (
                    <>
                        <header className="settings-content-card__header">
                            <h1>
                                <span>{t("settings.developers.title")}</span>
                            </h1>
                            <p>{t("settings.developers.subtitle")}</p>
                        </header>
                        <section
                            className="settings-general-content"
                            aria-label={t("settings.developers.title")}
                        >
                            <DeveloperApiKeysSection
                                controller={{
                                    items: apiKeyItems,
                                    loading: apiKeyLoading,
                                    errorMessage: apiKeyErrorMessage,
                                    createModalOpen,
                                    newApiKeyName,
                                    newApiKeyExpiryOption,
                                    createBusy,
                                    createErrorMessage,
                                    createdSecret,
                                    copied,
                                    deactivateTarget,
                                    deactivateBusy,
                                    toggleBusyId,
                                    setNewApiKeyName,
                                    setNewApiKeyExpiryOption,
                                    openCreateModal,
                                    closeCreateModal,
                                    handleCreateApiKey,
                                    handleToggleStatus,
                                    setDeactivateTarget,
                                    closeDeleteModal,
                                    confirmDelete,
                                    closeSecretModal,
                                    copySecret,
                                }}
                            />
                        </section>
                    </>
                ) : activeMenu === "keyboard" ? (
                    <KeyboardSettings />
                ) : activeMenu === "appearance" ? (
                    <>
                        <header className="settings-content-card__header">
                            <h1>{t("settings.menu.appearance")}</h1>
                        </header>
                        <section
                            className="settings-general-content"
                            aria-label={t("settings.menu.appearance")}
                        >
                            <article className="settings-row settings-appearance-row">
                                <h2>{t("settings.general.themeTitle")}</h2>
                                <ThemePreviewSelector
                                    themeMode={themeMode}
                                    onChangeTheme={setThemeMode}
                                />
                            </article>
                        </section>
                    </>
                ) : (
                    <>
                        <header className="settings-content-card__header">
                            <h1>
                                <span>{t("settings.general.title")}</span>
                            </h1>
                            <p>{t("settings.general.subtitle")}</p>
                        </header>
                        <section
                            className="settings-general-content"
                            aria-label={t("settings.general.title")}
                        >
                            <article className="settings-row">
                                <h2>{t("settings.general.languageTitle")}</h2>
                                <div className="settings-general-control">
                                    <DropdownMenu
                                        triggerLabel={currentLanguageLabel}
                                        label={t("settings.general.languageTitle")}
                                        items={SUPPORTED_LANGUAGE_IDS.map((languageId) => ({
                                            id: languageId,
                                            label: t(`settings.general.languages.${languageId}`),
                                        }))}
                                        onSelect={(languageId) => {
                                            void i18n.changeLanguage(languageId);
                                        }}
                                    />
                                </div>
                            </article>
                        </section>
                    </>
                )}
            </PrimaryCard>
        </section>
    );
}
