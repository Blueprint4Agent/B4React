import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../useToast";
import { useAuthContext } from "../../useAuth";
import { useAuthApi } from "./useAuthApi";

export function useAccountDeletion(onDeleted: () => void) {
    const { t } = useTranslation();
    const showToast = useToast();
    const { user, deleteAccount } = useAuthContext();
    const { requestDeletionCode, verifyDeletionCode, extractApiDetail, resolveAuthErrorMessage } =
        useAuthApi();
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState("");
    const [verified, setVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [sending, setSending] = useState(false);
    const [retryAt, setRetryAt] = useState(0);
    const [error, setError] = useState("");
    const [codeError, setCodeError] = useState("");
    const epoch = useRef(0);
    const inFlight = useRef(false);
    useEffect(() => {
        epoch.current += 1;
        setOpen(false);
        setCode("");
        setCodeSent(false);
        setVerified(false);
        setVerifying(false);
        setError("");
        setCodeError("");
        setRetryAt(0);
        setBusy(false);
        setSending(false);
        inFlight.current = false;
        return () => {
            epoch.current += 1;
        };
    }, [user?.id]);
    const showError = (failure: unknown, codeFailure = true) => {
        const detail = extractApiDetail(failure);
        const message = resolveAuthErrorMessage(t, detail, "auth.errors.accountDeleteFailed");
        if (codeFailure || detail?.error?.startsWith("ACCOUNT_DELETE_CODE_")) setCodeError(message);
        else setError(message);
        if (typeof detail?.details?.remaining_seconds === "number")
            setRetryAt(Date.now() + detail.details.remaining_seconds * 1000);
    };
    const onSendCode = async () => {
        if (!user || inFlight.current || retryAt > Date.now()) return;
        const current = epoch.current;
        inFlight.current = true;
        setSending(true);
        setError("");
        setCodeError("");
        setVerified(false);
        try {
            const result = await requestDeletionCode();
            if (current !== epoch.current) return;
            setCode("");
            setCodeSent(true);
            showToast(t("settings.account.codeSent"));
            setRetryAt(Date.now() + result.retry_after * 1000);
        } catch (failure) {
            if (current === epoch.current) showError(failure);
        } finally {
            if (current === epoch.current) {
                setSending(false);
                inFlight.current = false;
            }
        }
    };
    const onVerifyCode = async () => {
        if (!user || inFlight.current || !/^[0-9]{6}$/.test(code)) return;
        const current = epoch.current;
        inFlight.current = true;
        setVerifying(true);
        setError("");
        setCodeError("");
        try {
            await verifyDeletionCode(code);
            if (current === epoch.current) setVerified(true);
        } catch (failure) {
            if (current === epoch.current) {
                setVerified(false);
                showError(failure);
            }
        } finally {
            if (current === epoch.current) {
                inFlight.current = false;
                setVerifying(false);
            }
        }
    };
    const onConfirm = async () => {
        if (!user || inFlight.current || !verified || !/^[0-9]{6}$/.test(code)) return;
        const current = epoch.current;
        inFlight.current = true;
        setBusy(true);
        setError("");
        setCodeError("");
        try {
            await deleteAccount(user.email, code);
            // AuthProvider clears the owner on success; notify before the next render cleanup.
            onDeleted();
        } catch (failure) {
            if (current === epoch.current) {
                showError(failure, false);
                setCode("");
                setVerified(false);
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
            verified,
            verifying,
            onVerifyCode: () => void onVerifyCode(),
            busy,
            sending,
            retryAt,
            error,
            codeError,
            onCodeChange: (value: string) => {
                setCode(value);
                setVerified(false);
                setError("");
                setCodeError("");
            },
            onSendCode: () => void onSendCode(),
            onConfirm: () => void onConfirm(),
            onClose: () => {
                if (!inFlight.current) {
                    setOpen(false);
                    setCode("");
                    setVerified(false);
                    setError("");
                    setCodeError("");
                }
            },
        },
    };
}
