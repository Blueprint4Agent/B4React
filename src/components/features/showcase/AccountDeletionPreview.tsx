import { useToast } from "../../../hooks/useToast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AccountDeletionDialog } from "../auth/AccountDeletionDialog";
import { Button, InlineMessage } from "../../ui";

export function AccountDeletionPreview() {
    const { t } = useTranslation();
    const showToast = useToast();
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [retryAt, setRetryAt] = useState(0);
    const [error, setError] = useState("");
    const [complete, setComplete] = useState(false);
    return (
        <>
            <p className="muted">{t("showCase.accountDeletion.description")}</p>
            <Button
                onClick={() => {
                    setOpen(true);
                    setComplete(false);
                    setError("");
                    setCode("");
                    setCodeSent(false);
                    setRetryAt(0);
                }}
            >
                {t("showCase.accountDeletion.trigger")}
            </Button>
            {complete ? (
                <InlineMessage tone="info">{t("showCase.accountDeletion.complete")}</InlineMessage>
            ) : null}
            <AccountDeletionDialog
                open={open}
                email="preview@example.com"
                code={code}
                codeSent={codeSent}
                busy={false}
                sending={false}
                retryAt={retryAt}
                error={error}
                onCodeChange={setCode}
                onClose={() => setOpen(false)}
                onSendCode={() => {
                    setCodeSent(true);
                    showToast(t("settings.account.codeSent"));
                    setRetryAt(Date.now() + 5000);
                    setCode("");
                    setError("");
                }}
                onConfirm={() => {
                    if (code === "123456") {
                        setOpen(false);
                        setComplete(true);
                    } else {
                        setError(t("auth.errors.accountDeleteCodeInvalid"));
                        setCode("");
                    }
                }}
            />
        </>
    );
}
