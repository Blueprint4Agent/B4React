import { AccountEmailVerification } from "../../components/features/auth/AccountEmailVerification";
import { useState, useRef, useEffect, useId, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button, InputField, InlineMessage, Modal, ModalButton } from "../../components/ui";
import { useAuthApi } from "../../hooks/api/auth/useAuthApi";
import { useToast } from "../../hooks/useToast";
import { isValidPassword } from "../../utils/validation";

function PasswordChangeDialog({
    onClose,
    emailEnabled,
    email,
}: {
    onClose: () => void;
    emailEnabled: boolean;
    email: string;
}) {
    const { t } = useTranslation();
    const formId = useId();
    const { changePassword, requestPasswordChangeCode, extractApiDetail, resolveAuthErrorMessage } =
        useAuthApi();
    const showToast = useToast();
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [retryAt, setRetryAt] = useState(0);
    const [now, setNow] = useState(Date.now);
    const [busy, setBusy] = useState(false);
    const [sending, setSending] = useState(false);
    const locked = busy || sending;
    const [error, setError] = useState("");
    const active = useRef(true);
    const pending = useRef(false);
    useEffect(() => {
        active.current = true;
        return () => {
            active.current = false;
        };
    }, []);
    useEffect(() => {
        if (retryAt <= Date.now()) return;
        const timer = window.setInterval(() => {
            setNow(Date.now());
            if (Date.now() >= retryAt) window.clearInterval(timer);
        }, 1000);
        return () => window.clearInterval(timer);
    }, [retryAt]);
    const remaining = Math.max(0, Math.ceil((retryAt - now) / 1000));
    const sendCode = async () => {
        if (pending.current || !emailEnabled || retryAt > Date.now()) return;
        pending.current = true;
        setSending(true);
        setError("");
        setCode("");
        setCodeSent(false);
        try {
            const result = await requestPasswordChangeCode();
            if (!active.current) return;
            setCodeSent(true);
            setRetryAt(Date.now() + result.retry_after * 1000);
            setNow(Date.now());
            showToast(t("settings.account.codeSent"));
        } catch (failure) {
            if (!active.current) return;
            const detail = extractApiDetail(failure);
            setError(resolveAuthErrorMessage(t, detail, "toast.passwordError"));
            if (typeof detail?.details?.remaining_seconds === "number")
                setRetryAt(Date.now() + detail.details.remaining_seconds * 1000);
        } finally {
            if (active.current) {
                pending.current = false;
                setSending(false);
            }
        }
    };
    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (
            pending.current ||
            !emailEnabled ||
            !codeSent ||
            !/^[0-9]{6}$/.test(code) ||
            !isValidPassword(password) ||
            confirm !== password
        )
            return;
        pending.current = true;
        setBusy(true);
        setError("");
        try {
            await changePassword({ code, password });
            if (!active.current) return;
            setCode("");
            setCodeSent(false);
            setPassword("");
            setConfirm("");
            showToast(t("toast.passwordSuccess"));
            onClose();
        } catch (failure) {
            if (!active.current) return;
            setError(resolveAuthErrorMessage(t, extractApiDetail(failure), "toast.passwordError"));
        } finally {
            if (active.current) {
                setBusy(false);
                pending.current = false;
            }
        }
    };
    return (
        <Modal
            open
            onClose={() => {
                if (!pending.current) onClose();
            }}
            className="account-deletion-dialog"
            title={t("settings.account.passwordTitle")}
            description={t("settings.account.passwordHelp")}
            size="compact"
            keyboardDismissible
            footer={
                <>
                    <ModalButton variant="cancel" disabled={locked} onClick={onClose}>
                        {t("settings.account.cancel")}
                    </ModalButton>
                    <ModalButton
                        type="submit"
                        form={formId}
                        loading={busy}
                        disabled={
                            locked ||
                            !emailEnabled ||
                            !codeSent ||
                            !/^[0-9]{6}$/.test(code) ||
                            !isValidPassword(password) ||
                            confirm !== password
                        }
                    >
                        {t("settings.account.passwordTitle")}
                    </ModalButton>
                </>
            }
        >
            <form
                id={formId}
                className="settings-password-form"
                onSubmit={(event) => void submit(event)}
            >
                <AccountEmailVerification
                    email={email}
                    code={code}
                    codeSent={codeSent}
                    busy={busy}
                    sending={sending}
                    remaining={remaining}
                    disabled={!emailEnabled}
                    onCodeChange={setCode}
                    onSendCode={() => void sendCode()}
                />
                {!emailEnabled ? (
                    <InlineMessage tone="info">
                        {t("settings.account.passwordEmailRequired")}
                    </InlineMessage>
                ) : null}
                <InputField
                    label={t("resetPassword.passwordLabel")}
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onValueChange={setPassword}
                    disabled={locked || !emailEnabled}
                    maxLength={24}
                    required
                />
                {password && !isValidPassword(password) ? (
                    <InlineMessage>{t("auth.errors.invalidPasswordPattern")}</InlineMessage>
                ) : null}
                <InputField
                    label={t("resetPassword.confirmPasswordLabel")}
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onValueChange={setConfirm}
                    disabled={locked || !emailEnabled}
                    maxLength={24}
                    required
                />
                {confirm && confirm !== password ? (
                    <InlineMessage>{t("auth.errors.passwordMismatch")}</InlineMessage>
                ) : null}
                {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
            </form>
        </Modal>
    );
}

export function PasswordSettings({
    hasPassword,
    emailEnabled,
    email,
}: {
    hasPassword: boolean;
    emailEnabled: boolean;
    email: string;
}) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    return (
        <>
            <article className="settings-row">
                <div>
                    <h2>{t("settings.account.passwordLabel")}</h2>
                    {!hasPassword ? (
                        <p className="muted">{t("settings.account.oauthPassword")}</p>
                    ) : !emailEnabled ? (
                        <p className="muted">{t("settings.account.passwordEmailRequired")}</p>
                    ) : null}
                </div>
                <Button disabled={!hasPassword || !emailEnabled} onClick={() => setOpen(true)}>
                    {t("settings.account.passwordTitle")}
                </Button>
            </article>
            {open ? (
                <PasswordChangeDialog
                    emailEnabled={emailEnabled}
                    email={email}
                    onClose={() => setOpen(false)}
                />
            ) : null}
        </>
    );
}
