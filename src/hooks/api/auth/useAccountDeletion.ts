import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../useToast";
import { useAuthContext } from "../../useAuth";
import { useAuthApi } from "./useAuthApi";

export function useAccountDeletion(onDeleted: () => void) {
    const { t } = useTranslation();
    const showToast = useToast();
    const { user, deleteAccount } = useAuthContext();
    const { requestDeletionCode, extractApiDetail, resolveAuthErrorMessage } = useAuthApi();
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [sending, setSending] = useState(false);
    const [retryAt, setRetryAt] = useState(0);
    const [error, setError] = useState("");
    const epoch = useRef(0);
    const inFlight = useRef(false);
    useEffect(() => {
        epoch.current += 1;
        setOpen(false);
        setCode("");
        setCodeSent(false);
        setError("");
        setRetryAt(0);
        setBusy(false);
        setSending(false);
        inFlight.current = false;
        return () => {
            epoch.current += 1;
        };
    }, [user?.id]);
    const showError = (failure: unknown, persistent = true) => {
        const detail = extractApiDetail(failure);
        const message = resolveAuthErrorMessage(t, detail, "auth.errors.accountDeleteFailed");
        if (persistent) setError(message);
        else showToast(message);
        if (typeof detail?.details?.remaining_seconds === "number")
            setRetryAt(Date.now() + detail.details.remaining_seconds * 1000);
    };
    const onSendCode = async () => {
        if (!user || inFlight.current || retryAt > Date.now()) return;
        const current = epoch.current;
        inFlight.current = true;
        setSending(true);
        setError("");
        setCode("");
        setCodeSent(false);
        try {
            const result = await requestDeletionCode();
            if (current !== epoch.current) return;
            setCodeSent(true);
            showToast(t("settings.account.codeSent"));
            setRetryAt(Date.now() + result.retry_after * 1000);
        } catch (failure) {
            if (current === epoch.current) showError(failure, false);
        } finally {
            if (current === epoch.current) {
                setSending(false);
                inFlight.current = false;
            }
        }
    };
    const onConfirm = async () => {
        if (!user || inFlight.current || !/^[0-9]{6}$/.test(code)) return;
        const current = epoch.current;
        inFlight.current = true;
        setBusy(true);
        setError("");
        try {
            await deleteAccount(user.email, code);
            // AuthProvider clears the owner on success; notify before the next render cleanup.
            onDeleted();
        } catch (failure) {
            if (current === epoch.current) {
                showError(failure);
                setCode("");
            }
        } finally {
            if (current === epoch.current) {
                setBusy(false);
                inFlight.current = false;
            }
        }
    };
    return {
        show: () => setOpen(true),
        dialog: {
            open,
            email: user?.email ?? "",
            code,
            codeSent,
            busy,
            sending,
            retryAt,
            error,
            onCodeChange: setCode,
            onSendCode: () => void onSendCode(),
            onConfirm: () => void onConfirm(),
            onClose: () => {
                if (!inFlight.current) {
                    setOpen(false);
                    setCode("");
                    setError("");
                }
            },
        },
    };
}
