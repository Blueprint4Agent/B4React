import { ProfileInlineForm } from "../../components/features/profile/ProfileInlineForm";
import { ProfileLocationFields } from "../../components/features/profile/ProfileLocationFields";
import { profileLocationLabel, profileLocationOptions } from "../../utils/profileLocation";
import { useId, useMemo } from "react";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import {
    Button,
    EditableAvatar,
    UserAvatar,
    AvatarUploadField,
    InlineMessage,
    InputField,
    Modal,
    ModalButton,
    StatusBadge,
    TextareaField,
} from "../../components/ui";
import { useAuthContext } from "../../hooks/useAuth";
import { useProfileEditor } from "../../hooks/api/auth/useProfileEditor";
import { useCurrentPlan } from "../../hooks/api/billing/useCurrentPlan";
import { LoadingPage } from "../main/LoadingPage";

export function ProfilePage() {
    const { t, i18n } = useTranslation();
    const { user, loading, profileImageUrl } = useAuthContext();
    const editor = useProfileEditor();
    const plan = useCurrentPlan(user?.id);
    const formId = useId();
    const language = i18n.resolvedLanguage ?? "en";
    const country = editor.location.split(":")[0];
    const locationOptions = useMemo(
        () => profileLocationOptions(language, country),
        [language, country],
    );
    const locationValid =
        !editor.location || locationOptions.regionItems.some((item) => item.id === editor.location);
    if (loading) return <LoadingPage />;
    if (!user) return <Navigate to="/home" replace />;
    const joined = new Date(user.created_at).toLocaleDateString(i18n.resolvedLanguage, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    return (
        <section className="personal-profile" aria-label={t("settings.profile.title")}>
            <div className="personal-profile__actions">
                <Button appearance="pill" onClick={editor.show} disabled={editor.busy}>
                    {t("settings.profile.edit")}
                </Button>
            </div>
            <header className="personal-profile__hero">
                <EditableAvatar
                    imageUrl={profileImageUrl}
                    name={user.name}
                    label={t("settings.profile.photoSelect")}
                    busy={editor.busy}
                    onSelect={editor.selectPhoto}
                />
                {editor.editing === "name" ? (
                    <ProfileInlineForm
                        className="profile-inline-form--name"
                        busy={editor.busy}
                        invalid={editor.name.trim().length < 2}
                        onSave={editor.saveInline}
                        onCancel={editor.cancelInline}
                    >
                        <InputField
                            label=""
                            aria-label={t("settings.labels.name")}
                            size={14}
                            value={editor.name}
                            onValueChange={editor.setName}
                            minLength={2}
                            maxLength={50}
                            autoFocus
                            disabled={editor.busy}
                            required
                        />
                    </ProfileInlineForm>
                ) : (
                    <h1 aria-label={user.name}>
                        <Button
                            className="profile-edit-trigger"
                            title={t("settings.profile.editName")}
                            onClick={() => editor.startInline("name")}
                            disabled={editor.busy}
                        >
                            {user.name}
                        </Button>
                    </h1>
                )}
                {user.role === "admin" || user.role === "manager" ? (
                    <StatusBadge tone="active">
                        {t(
                            `settings.profile.roleBadge${user.role === "admin" ? "Admin" : "Manager"}`,
                        )}
                    </StatusBadge>
                ) : null}
                {editor.editing === "bio" ? (
                    <ProfileInlineForm
                        className="profile-inline-form--bio"
                        busy={editor.busy}
                        onSave={editor.saveInline}
                        onCancel={editor.cancelInline}
                    >
                        <TextareaField
                            label=""
                            aria-label={t("settings.profile.bio")}
                            autoFocus
                            rows={3}
                            value={editor.bio}
                            onValueChange={editor.setBio}
                            disabled={editor.busy}
                            aria-describedby={`${formId}-inline-bio-count`}
                            placeholder={t("settings.profile.emptyBio")}
                        />
                        <span
                            id={`${formId}-inline-bio-count`}
                            className="profile-bio-field__count"
                        >
                            {Array.from(editor.bio).length}/100
                        </span>
                    </ProfileInlineForm>
                ) : (
                    <div className={`personal-profile__bio${user.bio ? "" : " muted"}`}>
                        <Button
                            className="profile-edit-trigger"
                            title={t("settings.profile.editBio")}
                            onClick={() => editor.startInline("bio")}
                            disabled={editor.busy}
                        >
                            {user.bio || t("settings.profile.emptyBio")}
                        </Button>
                    </div>
                )}
            </header>
            {!editor.open && editor.error ? (
                <InlineMessage tone="error">{editor.error}</InlineMessage>
            ) : null}
            <dl className="personal-profile__details">
                <div>
                    <dt>
                        <MapPin aria-hidden="true" />
                        {t("settings.profile.location")}
                    </dt>
                    <dd className="profile-location-anchor">
                        <Button
                            className="profile-edit-trigger"
                            title={t("settings.profile.editLocation")}
                            onClick={() => editor.startInline("location")}
                            disabled={editor.busy}
                            aria-expanded={editor.editing === "location"}
                        >
                            {profileLocationLabel(user.location, language) ||
                                t("settings.profile.notSet")}
                        </Button>
                        {editor.editing === "location" ? (
                            <div className="profile-location-popover">
                                <ProfileInlineForm
                                    busy={editor.busy}
                                    invalid={!locationValid}
                                    onSave={editor.saveInline}
                                    onCancel={editor.cancelInline}
                                >
                                    <ProfileLocationFields
                                        value={editor.location}
                                        busy={editor.busy}
                                        onChange={editor.setLocation}
                                    />
                                </ProfileInlineForm>
                            </div>
                        ) : null}
                    </dd>
                </div>
                <div>
                    <dt>
                        <CalendarDays aria-hidden="true" />
                        {t("settings.profile.joined")}
                    </dt>
                    <dd>{joined}</dd>
                </div>
                <div>
                    <dt>
                        <Sparkles aria-hidden="true" />
                        {t("settings.account.currentPlan")}
                    </dt>
                    <dd>{plan.label}</dd>
                </div>
            </dl>
            {plan.error ? (
                <div className="personal-profile__notice">
                    <InlineMessage tone="error">{plan.error}</InlineMessage>
                    <Button appearance="pill" onClick={plan.reload}>
                        {t("settings.profile.retry")}
                    </Button>
                </div>
            ) : null}
            <p className="personal-profile__privacy muted">{t("settings.profile.private")}</p>
            <Modal
                open={editor.open}
                onClose={editor.close}
                title={t("settings.profile.edit")}
                size="compact"
                keyboardDismissible
                footer={
                    <>
                        <ModalButton variant="cancel" onClick={editor.close} disabled={editor.busy}>
                            {t("settings.account.cancel")}
                        </ModalButton>
                        <ModalButton
                            type="submit"
                            form={formId}
                            loading={editor.busy}
                            disabled={editor.name.trim().length < 2 || !locationValid}
                        >
                            {t("settings.profile.save")}
                        </ModalButton>
                    </>
                }
            >
                <form
                    id={formId}
                    className="form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (locationValid) editor.save();
                    }}
                >
                    <div className="profile-editor-photo">
                        <UserAvatar imageUrl={profileImageUrl} label={user.name} />
                        <AvatarUploadField
                            busy={editor.busy}
                            canClear={Boolean(user.profile_image_url)}
                            helperText={t("settings.profile.photoHelp")}
                            selectButtonText={t("settings.profile.photoAdd")}
                            clearButtonText={t("settings.profile.photoClear")}
                            onSelectFile={(file) => {
                                if (file) editor.selectPhoto(file);
                            }}
                            onClear={editor.removePhoto}
                        />
                    </div>
                    <InputField
                        label={t("settings.labels.name")}
                        value={editor.name}
                        onValueChange={editor.setName}
                        minLength={2}
                        maxLength={50}
                        required
                        disabled={editor.busy}
                    />
                    <div className="profile-bio-field">
                        <TextareaField
                            label={t("settings.profile.bio")}
                            value={editor.bio}
                            onValueChange={editor.setBio}
                            aria-describedby={`${formId}-bio-count`}
                            rows={4}
                            disabled={editor.busy}
                            placeholder={t("settings.profile.bioPlaceholder")}
                        />
                        <span id={`${formId}-bio-count`} className="profile-bio-field__count">
                            {Array.from(editor.bio).length}/100
                        </span>
                    </div>
                    <ProfileLocationFields
                        value={editor.location}
                        busy={editor.busy}
                        onChange={editor.setLocation}
                    />
                    {editor.error ? (
                        <InlineMessage tone="error">{editor.error}</InlineMessage>
                    ) : null}
                </form>
            </Modal>
        </section>
    );
}
