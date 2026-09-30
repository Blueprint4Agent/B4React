import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { InlineMessage, InputField, Modal, ModalButton } from "../../ui";

type AccountDeletionDialogProps = {
    open: boolean;
    email: string;
    code: string;
    codeSent: boolean;
    busy: boolean;
    sending: boolean;
    retryAt: number;
    error: string;
    onCodeChange: (value: string) => void;
    onSendCode: () => void;
    onConfirm: () => void;
    onClose: () => void;
};

export function AccountDeletionDialog({
    open,
    email,
    code,
    codeSent,
    busy,
    sending,
    retryAt,
    error,
    onCodeChange,
    onSendCode,
    onConfirm,
    onClose,
}: AccountDeletionDialogProps) {
    const { t } = useTranslation();
    const [now, setNow] = useState(Date.now);
    useEffect(() => {
        if (!open || retryAt <= Date.now()) return;
        setNow(Date.now());
        const timer = window.setInterval(() => {
            setNow(Date.now());
            if (Date.now() >= retryAt) window.clearInterval(timer);
        }, 1000);
        return () => window.clearInterval(timer);
    }, [open, retryAt]);
    const remaining = Math.max(0, Math.ceil((retryAt - now) / 1000));
    const pending = busy || sending;
    return (
        <Modal
            className="account-deletion-dialog"
            open={open}
            onClose={() => {
                if (!pending) onClose();
            }}
            title={t("settings.account.deleteTitle")}
            keyboardDismissible
            size="compact"
            description={t("settings.account.deleteWarning")}
            footer={
                <>
                    <ModalButton variant="cancel" disabled={pending} onClick={onClose}>
                        {t("settings.account.cancel")}
                    </ModalButton>
                    <ModalButton
                        variant="danger"
                        loading={busy}
                        disabled={sending || !/^[0-9]{6}$/.test(code)}
                        onClick={onConfirm}
                    >
                        {t("settings.account.deleteAction")}
                    </ModalButton>
                </>
            }
        >
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
                    disabled={pending}
                />
                <ModalButton
                    variant="cancel"
                    loading={sending}
                    disabled={busy || remaining > 0}
                    onClick={onSendCode}
                >
                    {remaining > 0
                        ? t("settings.account.resendWait", { seconds: remaining })
                        : t(codeSent ? "settings.account.resendCode" : "settings.account.sendCode")}
                </ModalButton>
            </div>
            <p className="account-deletion-hint">{t("settings.account.codeHint")}</p>
            {error ? <InlineMessage>{error}</InlineMessage> : null}
        </Modal>
    );
}
