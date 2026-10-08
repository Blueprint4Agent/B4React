import { useTranslation } from "react-i18next";
import { InputField, ModalButton } from "../../ui";

type AccountEmailVerificationProps = {
    email: string;
    code: string;
    codeSent: boolean;
    busy: boolean;
    sending: boolean;
    remaining: number;
    disabled?: boolean;
    onCodeChange: (value: string) => void;
    onSendCode: () => void;
};

export function AccountEmailVerification({
    email,
    code,
    codeSent,
    busy,
    sending,
    remaining,
    disabled = false,
    onCodeChange,
    onSendCode,
}: AccountEmailVerificationProps) {
    const { t } = useTranslation();
    return (
        <>
            <div className="account-deletion-recipient">
                <span>{t("settings.labels.email")}</span>
                <strong>{email}</strong>
            </div>
            <div className="account-deletion-code-row">
                <InputField
                    label={t("settings.account.codeLabel")}
                    value={code}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    onValueChange={(value) =>
                        onCodeChange(value.replace(/[^0-9]/g, "").slice(0, 6))
                    }
                    disabled={busy || sending || disabled}
                />
                <ModalButton
                    type="button"
                    variant="cancel"
                    loading={sending}
                    disabled={busy || disabled || remaining > 0}
                    onClick={onSendCode}
                >
                    {remaining > 0
                        ? t("settings.account.resendWait", { seconds: remaining })
                        : t(codeSent ? "settings.account.resendCode" : "settings.account.sendCode")}
                </ModalButton>
            </div>
            <p className="account-deletion-hint">{t("settings.account.codeHint")}</p>
        </>
    );
}
