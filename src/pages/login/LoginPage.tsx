import { RecentAccountList } from "../../components/features/auth/RecentAccountList";
import { useRecentAccounts } from "../../hooks/useRecentAccounts";
import {
    beginOAuthAccountIntent,
    clearRecentAccounts,
    removeRecentAccount,
    type RecentAccount,
} from "../../utils/recentAccounts";
import { getApiBase } from "../../utils/apiBase";
import { AuthPageFrame } from "../../components/layout/AuthPageFrame";
import { FormEvent, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { OAuthProviderButton } from "../../components/features/auth/OAuthProviderButton";
import { Button, FormCheckbox, InputField, InlineMessage } from "../../components/ui";
import { useAuthContext } from "../../hooks/useAuth";
import { useAuthApi, type OAuthProvider } from "../../hooks/api/auth/useAuthApi";
import { useAppConfig } from "../../hooks/useFeatures";
import { isValidEmail, isValidPassword } from "../../utils/validation";

const REMEMBER_EMAIL_STORAGE_KEY = "template_remember_email";
const REMEMBER_EMAIL_ENABLED_STORAGE_KEY = "template_remember_email_enabled";
const REMEMBER_ME_ENABLED_STORAGE_KEY = "template_remember_me_enabled";

export function LoginPage({ embedded = false }: { embedded?: boolean }) {
    const [passwordStep, setPasswordStep] = useState(!embedded);
    const { t } = useTranslation();
    const { login, user } = useAuthContext();
    const accounts = useRecentAccounts();
    const location = useLocation();
    const handledSelection = useRef<string | null>(null);
    const {
        getOAuthProviders,
        resendVerificationEmail,
        extractApiDetail,
        resolveAuthErrorMessage,
    } = useAuthApi();
    const { data: appConfig, loading: configLoading } = useAppConfig();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [rememberEmail, setRememberEmail] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const [showResendButton, setShowResendButton] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const [emailErrorMessage, setEmailErrorMessage] = useState("");
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [oauthProviders, setOAuthProviders] = useState<
        Array<{ provider: OAuthProvider; start_path: string }>
    >([]);
    const loginEnabled = appConfig?.login_enabled === true;
    const emailEnabled = appConfig?.email_enabled === true;
    const oauthEnabled = appConfig?.oauth_enabled === true;

    useEffect(() => {
        try {
            const rememberMeEnabled =
                window.localStorage.getItem(REMEMBER_ME_ENABLED_STORAGE_KEY) === "true";
            setRememberMe(rememberMeEnabled);

            const rememberEmailEnabled =
                window.localStorage.getItem(REMEMBER_EMAIL_ENABLED_STORAGE_KEY) === "true";
            if (!rememberEmailEnabled) {
                setRememberEmail(false);
                return;
            }
            const rememberedEmail = window.localStorage.getItem(REMEMBER_EMAIL_STORAGE_KEY);
            if (rememberedEmail) {
                setEmail(rememberedEmail);
                setRememberEmail(true);
            }
        } catch {
            // ignore storage errors in restricted browser contexts
        }
    }, []);

    useEffect(() => {
        const run = async () => {
            if (!oauthEnabled || !loginEnabled) {
                setOAuthProviders([]);
                return;
            }
            try {
                const payload = await getOAuthProviders();
                setOAuthProviders(
                    payload.providers.filter(
                        (item) => item.provider === "google" || item.provider === "github",
                    ),
                );
            } catch {
                setOAuthProviders([]);
            }
        };
        void run();
    }, [oauthEnabled, loginEnabled]);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setEmailErrorMessage("");
        setPasswordErrorMessage("");
        setShowResendButton(false);
        setResendMessage("");

        if (!loginEnabled) {
            setPasswordErrorMessage(t("auth.errors.loginDisabled"));
            setSubmitting(false);
            return;
        }

        if (!email.trim()) {
            setEmailErrorMessage(t("auth.errors.requiredEmail"));
            setSubmitting(false);
            return;
        }
        if (!isValidEmail(email)) {
            setEmailErrorMessage(t("auth.errors.invalidEmail"));
            setSubmitting(false);
            return;
        }
        if (!passwordStep) {
            setPasswordStep(true);
            setSubmitting(false);
            return;
        }
        if (!password.trim()) {
            setPasswordErrorMessage(t("auth.errors.requiredPassword"));
            setSubmitting(false);
            return;
        }
        if (!isValidPassword(password)) {
            setPasswordErrorMessage(t("auth.errors.invalidPasswordPattern"));
            setSubmitting(false);
            return;
        }

        try {
            await login({
                email,
                password,
                remember_me: rememberMe,
                remember_account: rememberEmail,
            });
            try {
                window.localStorage.setItem(
                    REMEMBER_ME_ENABLED_STORAGE_KEY,
                    rememberMe ? "true" : "false",
                );
                if (rememberEmail) {
                    window.localStorage.setItem(REMEMBER_EMAIL_ENABLED_STORAGE_KEY, "true");
                    window.localStorage.setItem(REMEMBER_EMAIL_STORAGE_KEY, email.trim());
                } else {
                    window.localStorage.setItem(REMEMBER_EMAIL_ENABLED_STORAGE_KEY, "false");
                    window.localStorage.removeItem(REMEMBER_EMAIL_STORAGE_KEY);
                }
            } catch {
                // ignore storage errors in restricted browser contexts
            }
            navigate("/show-case", { replace: true });
        } catch (nextError) {
            const detail = extractApiDetail(nextError);
            const code = detail?.error;
            const details = detail?.details;

            if (code === "INVALID_CREDENTIALS" && typeof details?.remaining_attempts === "number") {
                setPasswordErrorMessage(
                    t("auth.errors.invalidCredentialsWithCount", {
                        count: details.remaining_attempts,
                    }),
                );
            } else if (
                code === "ACCOUNT_LOCKED" &&
                typeof details?.remaining_seconds === "number"
            ) {
                setPasswordErrorMessage(
                    t("auth.errors.accountLocked", { seconds: details.remaining_seconds }),
                );
            } else if (code === "EMAIL_NOT_VERIFIED") {
                setEmailErrorMessage(t("auth.errors.emailNotVerified"));
                setShowResendButton(true);
            } else {
                setPasswordErrorMessage(
                    resolveAuthErrorMessage(t, detail, "auth.errors.loginFallback"),
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const onResendVerification = async () => {
        if (!email.trim() || resending) return;
        setResending(true);
        setResendMessage("");
        try {
            const payload = await resendVerificationEmail(email.trim());
            setResendMessage(payload.message);
        } catch {
            setResendMessage(t("auth.errors.resendVerificationFallback"));
        } finally {
            setResending(false);
        }
    };

    const selectAccount = (account: RecentAccount) => {
        if (account.provider === "email") {
            setEmail(account.email);
            setPassword("");
            setPasswordStep(true);
            setEmailErrorMessage("");
            setPasswordErrorMessage("");
            setShowResendButton(false);
            setResendMessage("");
        } else {
            const provider = oauthProviders.find((item) => item.provider === account.provider);
            if (provider) {
                beginOAuthAccountIntent(provider.provider, rememberEmail);
                window.location.assign(new URL(provider.start_path, `${getApiBase()}/`).toString());
            }
        }
    };
    useEffect(() => {
        if (handledSelection.current === location.key) return;
        const state = location.state as {
            accountEmail?: unknown;
            accountProvider?: unknown;
        } | null;
        if (typeof state?.accountEmail !== "string") return;
        if (state.accountProvider === "google" || state.accountProvider === "github") {
            const provider = oauthProviders.find((item) => item.provider === state.accountProvider);
            if (!provider) return;
            handledSelection.current = location.key;
            beginOAuthAccountIntent(provider.provider, rememberEmail);
            window.location.assign(new URL(provider.start_path, `${getApiBase()}/`).toString());
        } else {
            handledSelection.current = location.key;
            setEmail(state.accountEmail);
            setPasswordStep(true);
        }
    }, [location.key, location.state, oauthProviders, rememberEmail]);
    return (
        <AuthPageFrame
            embedded={embedded}
            title={t(embedded ? "authDialog.title" : "login.title")}
            subtitle={t(embedded ? "authDialog.subtitle" : "login.subtitle")}
        >
            {loginEnabled && oauthProviders.length > 0 ? (
                <div className="auth-dialog-social">
                    <div className="oauth-provider-list">
                        {oauthProviders.map((item) => (
                            <OAuthProviderButton
                                key={item.provider}
                                provider={item.provider}
                                label={t(`login.oauth.providers.${item.provider}`)}
                                startPath={item.start_path}
                                onStart={() =>
                                    beginOAuthAccountIntent(item.provider, rememberEmail)
                                }
                            />
                        ))}
                    </div>
                    <div className="auth-dialog-divider">
                        <span>{t("authDialog.or")}</span>
                    </div>
                </div>
            ) : null}
            {loginEnabled ? (
                <form onSubmit={onSubmit} className="form" noValidate>
                    <RecentAccountList
                        accounts={accounts}
                        onSelect={selectAccount}
                        onRemove={removeRecentAccount}
                        onClear={clearRecentAccounts}
                        availableProviders={[
                            "email",
                            ...oauthProviders.map((item) => item.provider),
                        ]}
                    />

                    <FormCheckbox
                        checked={rememberEmail}
                        onCheckedChange={setRememberEmail}
                        label={t("recentAccounts.remember")}
                    />
                    <InputField
                        label={t("login.fields.email")}
                        type="email"
                        autoComplete="email"
                        value={email}
                        onValueChange={(value) => {
                            setEmail(value);
                            if (emailErrorMessage || resendMessage || showResendButton) {
                                setEmailErrorMessage("");
                                setResendMessage("");
                                setShowResendButton(false);
                            }
                        }}
                    />
                    {emailErrorMessage ? <InlineMessage>{emailErrorMessage}</InlineMessage> : null}
                    {showResendButton ? (
                        <div className="login-inline-actions">
                            <Button
                                appearance={embedded ? "pill" : "default"}
                                type="button"
                                loading={resending}
                                onClick={onResendVerification}
                            >
                                {t("auth.actions.resendVerification")}
                            </Button>
                        </div>
                    ) : null}
                    {resendMessage ? (
                        <InlineMessage tone="info">{resendMessage}</InlineMessage>
                    ) : null}
                    {passwordStep ? (
                        <>
                            <InputField
                                label={t("login.fields.password")}
                                type="password"
                                autoComplete="current-password"
                                autoFocus={embedded}
                                value={password}
                                onValueChange={(value) => {
                                    setPassword(value);
                                    if (passwordErrorMessage) {
                                        setPasswordErrorMessage("");
                                    }
                                }}
                            />
                            {passwordErrorMessage ? (
                                <InlineMessage>{passwordErrorMessage}</InlineMessage>
                            ) : null}
                            <div className="login-remember-options">
                                <FormCheckbox
                                    checked={rememberMe}
                                    onCheckedChange={setRememberMe}
                                    label={t("login.rememberMe")}
                                />
                            </div>
                        </>
                    ) : null}
                    <Button
                        appearance={embedded ? "pill" : "default"}
                        type="submit"
                        loading={submitting}
                    >
                        {t(passwordStep ? "login.submitIdle" : "authDialog.continue")}
                    </Button>
                </form>
            ) : (
                <div className="form">
                    <InlineMessage>{t("auth.errors.loginDisabled")}</InlineMessage>
                </div>
            )}
            <p className="muted auth-footer">
                {t("login.signupPrompt")}{" "}
                <Link to={user ? "/signup?switch=1" : "/signup"} className="text-link">
                    {t("login.signupLink")}
                </Link>
            </p>
            {!configLoading && emailEnabled ? (
                <p className="muted">
                    {t("login.forgotPasswordPrompt")}{" "}
                    <Link to="/forgot-password" className="text-link">
                        {t("login.forgotPasswordLink")}
                    </Link>
                </p>
            ) : null}
        </AuthPageFrame>
    );
}
