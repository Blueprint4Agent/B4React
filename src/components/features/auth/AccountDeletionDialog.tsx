import { AccountEmailVerification } from "./AccountEmailVerification";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { InlineMessage, Modal, ModalButton } from "../../ui";

type AccountDeletionDialogProps = {
    open: boolean;
    email: string;
    code: string;
    codeSent: boolean;
    verified: boolean;
    verifying: boolean;
    onVerifyCode: () => void;
    busy: boolean;
    sending: boolean;
    retryAt: number;
    error: string;
    codeError: string;
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
    verified,
    verifying,
    onVerifyCode,
    busy,
    sending,
    retryAt,
    error,
    codeError,
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
    const pending = busy || sending || verifying;
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
                        disabled={sending || verifying || !verified || !/^[0-9]{6}$/.test(code)}
                        onClick={onConfirm}
                    >
                        {t("settings.account.deleteAction")}
                    </ModalButton>
                </>
            }
        >
            <AccountEmailVerification
                error={codeError}
                email={email}
                code={code}
                codeSent={codeSent}
                verified={verified}
                verifying={verifying}
                onVerifyCode={onVerifyCode}
                busy={busy}
                sending={sending}
                remaining={remaining}
                onCodeChange={onCodeChange}
                onSendCode={onSendCode}
            />
            {error ? <InlineMessage>{error}</InlineMessage> : null}
        </Modal>
    );
}
