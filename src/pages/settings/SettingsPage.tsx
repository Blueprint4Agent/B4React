import { useToast } from "../../hooks/useToast";
import { resolveSettingsSection } from "../../utils/settingsSections";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ConnectedOAuthProvidersCard } from "../../components/features/auth/ConnectedOAuthProvidersCard";
import { DeveloperApiKeysSection } from "../../components/features/apiKey/DeveloperApiKeysSection";
import {
    AvatarUploadField,
    Button,
    DropdownMenu,
    InlineMessage,
    InputField,
    PrimaryCard,
    ModalButton,
    StatusBadge,
    ThemePreviewSelector,
    UserAvatar,
} from "../../components/ui";
import type { APIKeyRecord } from "../../hooks/api/apiKey/useApiKeyApi";
import { useApiKeys } from "../../hooks/api/apiKey/useApiKeys";
import { useAccountDeletion } from "../../hooks/api/auth/useAccountDeletion";
import { AccountDeletionDialog } from "../../components/features/auth/AccountDeletionDialog";
import { useAuthContext } from "../../hooks/useAuth";
import { useAppConfig } from "../../hooks/useFeatures";
import { useTheme } from "../../hooks/useTheme";
import { resolveAPIKeyExpiresAt, type APIKeyExpiryOption } from "../../utils/date";

type SaveFeedback = {
    message: string;
    tone: "error" | "info";
    source: "name" | "photo";
} | null;
const MAX_PROFILE_PHOTO_SIZE_MB = 8;
const MAX_PROFILE_PHOTO_SIZE_BYTES = MAX_PROFILE_PHOTO_SIZE_MB * 1024 * 1024;
const DEFAULT_API_KEY_EXPIRY_OPTION: APIKeyExpiryOption = "30d";
const SUPPORTED_LANGUAGE_IDS = ["en", "ko"] as const;
type SupportedLanguageId = (typeof SUPPORTED_LANGUAGE_IDS)[number];

export function SettingsPage() {
    const { t, i18n } = useTranslation();
    const showToast = useToast();
    const navigate = useNavigate();
    const accountDeletion = useAccountDeletion(() => {
        showToast(t("settings.account.deleted"));
        navigate("/show-case", { replace: true });
    });
    const { user, loading: authLoading, updateProfile } = useAuthContext();
    const { data: appConfig } = useAppConfig();
    const { themeMode, setThemeMode } = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const section = searchParams.get("section");
    const activeMenu = resolveSettingsSection(section, Boolean(user));
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
    const [nameInput, setNameInput] = useState("");
    const [profileImageInput, setProfileImageInput] = useState<string | null>(null);
    const [saveBusy, setSaveBusy] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState<SaveFeedback>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newApiKeyName, setNewApiKeyName] = useState("");
    const [newApiKeyExpiryOption, setNewApiKeyExpiryOption] = useState<APIKeyExpiryOption>(
        DEFAULT_API_KEY_EXPIRY_OPTION,
    );
    const [createdSecret, setCreatedSecret] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [deactivateTarget, setDeactivateTarget] = useState<APIKeyRecord | null>(null);
    const loginEnabled = appConfig?.login_enabled === true;

    const showProfile = activeMenu === "account";
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
    const normalizedNameInput = nameInput.trim();
    const normalizedCurrentName = (user?.name ?? "").trim();
    const normalizedProfileImageInput = profileImageInput?.trim() || null;
    const normalizedCurrentProfileImage = user?.profile_image_url ?? null;
    const isNameChanged = normalizedNameInput !== normalizedCurrentName;
    const connectedOAuthProviders = user?.oauth_providers ?? [];
    const normalizedLanguageId =
        (i18n.resolvedLanguage ?? i18n.language ?? "en").split("-")[0] || "en";
    const currentLanguageId: SupportedLanguageId = SUPPORTED_LANGUAGE_IDS.includes(
        normalizedLanguageId as SupportedLanguageId,
    )
        ? (normalizedLanguageId as SupportedLanguageId)
        : "en";
    const currentLanguageLabel = t(`settings.general.languages.${currentLanguageId}`);
    const isAdminUser = user?.role === "admin";

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

    useEffect(() => {
        setNameInput(user?.name ?? "");
        setProfileImageInput(user?.profile_image_url ?? null);
    }, [user?.name, user?.profile_image_url]);

    useEffect(() => {
        setSaveFeedback(null);
        setNameInput(user?.name ?? "");
        setProfileImageInput(user?.profile_image_url ?? null);
    }, [activeMenu]);

    const toDataUrl = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    resolve(reader.result);
                    return;
                }
                reject(new Error("Failed to read image file."));
            };
            reader.onerror = () => reject(new Error("Failed to read image file."));
            reader.readAsDataURL(file);
        });

    const handleProfileImageSelect = async (file: File | null) => {
        if (!file) {
            return;
        }

        setSaveFeedback(null);
        const isSupportedType = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/gif",
        ].includes(file.type);
        if (!isSupportedType) {
            setSaveFeedback({
                tone: "error",
                source: "photo",
                message: t("settings.profile.photoTypeError"),
            });
            showToast(t("toast.photoError"));
            return;
        }
        if (file.size > MAX_PROFILE_PHOTO_SIZE_BYTES) {
            setSaveFeedback({
                tone: "error",
                source: "photo",
                message: t("settings.profile.photoSizeError"),
            });
            showToast(t("toast.photoError"));
            return;
        }

        try {
            const dataUrl = await toDataUrl(file);
            setProfileImageInput(dataUrl);
            setSaveBusy(true);
            try {
                await updateProfile({ profile_image_url: dataUrl });
                showToast(t("toast.profileSuccess"));
                setSaveFeedback(null);
            } catch {
                setProfileImageInput(normalizedCurrentProfileImage);
                showToast(t("toast.profileError"));
                setSaveFeedback({
                    tone: "error",
                    source: "photo",
                    message: t("toast.profileError"),
                });
            } finally {
                setSaveBusy(false);
            }
        } catch {
            setSaveFeedback({
                tone: "error",
                source: "photo",
                message: t("settings.profile.photoReadError"),
            });
            showToast(t("toast.photoError"));
        }
    };

    const handleSaveProfile = async () => {
        const nextName = normalizedNameInput;
        if (!isNameChanged || !nextName) {
            return;
        }

        setSaveBusy(true);
        setSaveFeedback(null);
        try {
            await updateProfile({ name: nextName });
            showToast(t("toast.profileSuccess"));
            setSaveFeedback({
                tone: "info",
                source: "name",
                message: t("settings.profile.nameSaveSuccess"),
            });
        } catch (error) {
            showToast(t("toast.profileError"));
            setSaveFeedback({
                tone: "error",
                source: "name",
                message: t("settings.profile.nameSaveError"),
            });
        } finally {
            setSaveBusy(false);
        }
    };

    return (
        <section className="settings-layout">
            <PrimaryCard className="settings-content-card">
                {showProfile ? (
                    <>
                        <header className="settings-content-card__header">
                            <h1>
                                <span>{t("settings.profile.title")}</span>
                            </h1>
                            <p>{t("settings.profile.subtitle")}</p>
                            {isAdminUser ? (
                                <div className="settings-profile-role-badge-wrap">
                                    <StatusBadge tone="active">
                                        {t("settings.profile.roleBadgeAdmin")}
                                    </StatusBadge>
                                </div>
                            ) : null}
                        </header>

                        <section
                            className="settings-profile-content"
                            aria-label={t("settings.profile.title")}
                        >
                            <div className="settings-profile-info">
                                <article className="settings-profile-field-card">
                                    <h2>{t("settings.labels.name")}</h2>
                                    <form
                                        className="settings-profile-name-edit"
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            void handleSaveProfile();
                                        }}
                                    >
                                        <InputField
                                            className="settings-profile-name-input"
                                            label=""
                                            value={nameInput}
                                            onValueChange={(value) => {
                                                setNameInput(value);
                                                if (saveFeedback) {
                                                    setSaveFeedback(null);
                                                }
                                            }}
                                            placeholder={t("settings.profile.namePlaceholder")}
                                            aria-label={t("settings.labels.name")}
                                        />
                                        <Button
                                            className="settings-profile-save-button"
                                            type="submit"
                                            loading={saveBusy}
                                            disabled={!isNameChanged}
                                        >
                                            {t("settings.profile.save")}
                                        </Button>
                                    </form>
                                    <div className="settings-feedback-slot settings-feedback-slot--name">
                                        {saveFeedback?.source === "name" &&
                                        saveFeedback?.tone === "info" ? (
                                            <div className="settings-feedback settings-feedback--name">
                                                <InlineMessage tone="info">
                                                    {saveFeedback.message}
                                                </InlineMessage>
                                            </div>
                                        ) : null}
                                        {saveFeedback?.source === "name" &&
                                        saveFeedback?.tone === "error" ? (
                                            <div className="settings-feedback settings-feedback--name">
                                                <InlineMessage>
                                                    {saveFeedback.message}
                                                </InlineMessage>
                                            </div>
                                        ) : null}
                                    </div>
                                </article>

                                <article className="settings-profile-field-card">
                                    <h2>{t("settings.labels.email")}</h2>
                                    <p>{user?.email ?? "-"}</p>
                                </article>

                                {loginEnabled ? (
                                    <ConnectedOAuthProvidersCard
                                        title={t("settings.profile.oauthConnectedTitle")}
                                        providers={connectedOAuthProviders}
                                        emptyText={t("settings.profile.oauthConnectedEmpty")}
                                        getProviderLabel={resolveOAuthProviderLabel}
                                    />
                                ) : null}
                            </div>

                            <aside className="settings-profile-photo-panel">
                                <h2>{t("settings.profile.photo")}</h2>
                                <UserAvatar
                                    className="settings-profile-photo-card__preview"
                                    imageUrl={normalizedProfileImageInput}
                                    label={user?.name ?? "U"}
                                />
                                <AvatarUploadField
                                    busy={saveBusy}
                                    canClear={Boolean(normalizedProfileImageInput)}
                                    helperText={t("settings.profile.photoHelp")}
                                    selectButtonText={t("settings.profile.photoSelect")}
                                    clearButtonText={t("settings.profile.photoClear")}
                                    onSelectFile={(file) => {
                                        void handleProfileImageSelect(file);
                                    }}
                                    onClear={() => {
                                        setProfileImageInput(null);
                                        if (saveFeedback) {
                                            setSaveFeedback(null);
                                        }
                                        setSaveBusy(true);
                                        void updateProfile({ profile_image_url: null })
                                            .then(() => {
                                                showToast(t("toast.profileSuccess"));
                                                setSaveFeedback(null);
                                            })
                                            .catch(() => {
                                                setProfileImageInput(normalizedCurrentProfileImage);
                                                showToast(t("toast.profileError"));
                                                setSaveFeedback({
                                                    tone: "error",
                                                    source: "photo",
                                                    message: t("toast.profileError"),
                                                });
                                            })
                                            .finally(() => {
                                                setSaveBusy(false);
                                            });
                                    }}
                                />
                                {saveFeedback?.source === "photo" ? (
                                    <InlineMessage tone={saveFeedback.tone}>
                                        {saveFeedback.message}
                                    </InlineMessage>
                                ) : null}
                            </aside>
                        </section>
                        {loginEnabled ? (
                            <section
                                className="settings-account-delete"
                                aria-label={t("settings.account.deleteTitle")}
                            >
                                <div>
                                    <h2>{t("settings.account.deleteTitle")}</h2>
                                    <p>{t("settings.account.deleteDescription")}</p>
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
                    </>
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
