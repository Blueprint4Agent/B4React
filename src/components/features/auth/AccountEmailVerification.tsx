import { useTranslation } from "react-i18next";
import { useId } from "react";
import { InputField, ModalButton, InlineMessage } from "../../ui";

type AccountEmailVerificationProps = {
    email: string;
    code: string;
    codeSent: boolean;
    verified?: boolean;
    verifying?: boolean;
    onVerifyCode?: () => void;
    busy: boolean;
    sending: boolean;
    remaining: number;
    disabled?: boolean;
    error?: string;
    onCodeChange: (value: string) => void;
    onSendCode: () => void;
};

export function AccountEmailVerification({
    email,
    code,
    codeSent,
    verified = false,
    verifying = false,
    onVerifyCode,
    busy,
    sending,
    remaining,
    disabled = false,
    error,
    onCodeChange,
    onSendCode,
}: AccountEmailVerificationProps) {
    const { t } = useTranslation();
    const feedbackId = useId();
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
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? feedbackId : undefined}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    onValueChange={(value) =>
                        onCodeChange(value.replace(/[^0-9]/g, "").slice(0, 6))
                    }
                    disabled={busy || sending || verifying || disabled}
                />
                {codeSent || code.length > 0 ? (
                    <ModalButton
                        type="button"
                        loading={verifying}
                        disabled={
                            busy || sending || disabled || verified || !/^[0-9]{6}$/.test(code)
                        }
                        onClick={onVerifyCode}
                    >
                        {t(
                            verified
                                ? "settings.account.codeVerified"
                                : "settings.account.verifyCode",
                        )}
                    </ModalButton>
                ) : (
                    <ModalButton
                        type="button"
                        variant="cancel"
                        loading={sending}
                        disabled={busy || disabled || remaining > 0}
                        onClick={onSendCode}
                    >
                        {remaining > 0
                            ? t("settings.account.resendWait", { seconds: remaining })
                            : t("settings.account.sendCode")}
                    </ModalButton>
                )}
            </div>
            {error ? (
                <div id={feedbackId} className="account-verification-feedback">
                    <InlineMessage tone="error">{error}</InlineMessage>
                </div>
            ) : null}
            {codeSent || code.length > 0 ? (
                <div className="account-verification-resend">
                    <ModalButton
                        type="button"
                        variant="cancel"
                        loading={sending}
                        disabled={busy || verifying || disabled || remaining > 0}
                        onClick={onSendCode}
                    >
                        {remaining > 0
                            ? t("settings.account.resendCodeWait", { seconds: remaining })
                            : t("settings.account.resendCode")}
                    </ModalButton>
                </div>
            ) : null}
            <p className="account-deletion-hint">{t("settings.account.codeHint")}</p>
        </>
    );
}
