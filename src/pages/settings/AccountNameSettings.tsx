import { Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, InlineMessage, InputField } from "../../components/ui";
import { ProfileInlineForm } from "../../components/features/profile/ProfileInlineForm";
import { useProfileEditor } from "../../hooks/api/auth/useProfileEditor";

export function AccountNameSettings({ name }: { name: string }) {
    const { t } = useTranslation();
    const editor = useProfileEditor();
    return (
        <article className="settings-row">
            <h2>{t("settings.labels.name")}</h2>
            <div className="account-name-value">
                {editor.editing === "name" ? (
                    <ProfileInlineForm
                        className="account-name-form"
                        busy={editor.busy}
                        invalid={editor.name.trim().length < 2}
                        onSave={editor.saveInline}
                        onCancel={editor.cancelInline}
                    >
                        <InputField
                            label=""
                            aria-label={t("settings.labels.name")}
                            value={editor.name}
                            onValueChange={editor.setName}
                            minLength={2}
                            maxLength={50}
                            required
                            autoFocus
                            disabled={editor.busy}
                        />
                    </ProfileInlineForm>
                ) : (
                    <>
                        <span>{name}</span>
                        <Button
                            appearance="text"
                            className="account-name-edit-trigger"
                            iconOnly
                            aria-label={t("settings.profile.editName")}
                            title={t("settings.profile.editName")}
                            onClick={() => editor.startInline("name")}
                        >
                            <Pencil aria-hidden="true" />
                        </Button>
                    </>
                )}
                {editor.error ? <InlineMessage tone="error">{editor.error}</InlineMessage> : null}
            </div>
        </article>
    );
}
