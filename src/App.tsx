import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { useAuthContext } from "./hooks/useAuth";
import { useAppConfig } from "./hooks/useFeatures";
import { useTheme } from "./hooks/useTheme";
import { hasStartedFromLanding } from "./utils/landing";
import { ForgotPasswordEmailSentPage } from "./pages/login/ForgotPasswordEmailSentPage";
import { ForgotPasswordPage } from "./pages/login/ForgotPasswordPage";
import { LoginPage } from "./pages/login/LoginPage";
import { ResetPasswordPage } from "./pages/login/ResetPasswordPage";
import { ResetPasswordSuccessPage } from "./pages/login/ResetPasswordSuccessPage";
import { SignupEmailSentPage } from "./pages/login/SignupEmailSentPage";
import { SignupPage } from "./pages/login/SignupPage";
import { VerifyEmailPage } from "./pages/login/VerifyEmailPage";
import { LoadingPage } from "./pages/main/LoadingPage";
import { LandingPage } from "./pages/main/LandingPage";
import { ShowCaseNotFoundPage } from "./pages/main/ShowCaseNotFoundPage";
import { ShowCasePage } from "./pages/main/ShowCasePage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { ServerUnavailablePage } from "./pages/main/ServerUnavailablePage";
import { useServerConnectivity } from "./hooks/connectivity/useServerConnectivity";

function ProtectedLayout({
    loginEnabled,
    configLoading,
}: {
    loginEnabled: boolean;
    configLoading: boolean;
}) {
    const { user, loading } = useAuthContext();
    const { t } = useTranslation();
    if (loading || configLoading) {
        return <LoadingPage message={t("app.loadingSession")} />;
    }
    if (loginEnabled && !user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <AppLayout>
            <Outlet />
        </AppLayout>
    );
}

function NotFoundRoute({
    loginEnabled,
    configLoading,
}: {
    loginEnabled: boolean;
    configLoading: boolean;
}) {
    const { user, loading } = useAuthContext();

    if (loading || configLoading) {
        return <LoadingPage />;
    }

    if (user || !loginEnabled) {
        return (
            <AppLayout>
                <ShowCaseNotFoundPage />
            </AppLayout>
        );
    }

    return (
        <main className="page">
            <ShowCaseNotFoundPage />
        </main>
    );
}

export function App() {
    useTheme();
    const { t } = useTranslation();
    const {
        data: appConfig,
        loading: configLoading,
        error: configError,
        reload: reloadConfig,
    } = useAppConfig();
    const { checkNow, status: connectivityStatus } = useServerConnectivity();
    const [retryingConfig, setRetryingConfig] = useState(false);
    const landingStarted = hasStartedFromLanding();

    if (configLoading) {
        return <LoadingPage message={t("app.loadingSession")} />;
    }
    if (!appConfig) {
        return (
            <ServerUnavailablePage
                checking={
                    retryingConfig ||
                    connectivityStatus === "checking" ||
                    connectivityStatus === "reconnecting"
                }
                error={configError}
                onRetry={() => {
                    setRetryingConfig(true);
                    void checkNow()
                        .then(() => reloadConfig())
                        .catch(() => undefined)
                        .finally(() => setRetryingConfig(false));
                }}
            />
        );
    }

    const loginEnabled = appConfig.login_enabled;

    return (
        <Routes>
            <Route
                path="/"
                element={
                    landingStarted ? (
                        <Navigate to={loginEnabled ? "/login" : "/show-case"} replace />
                    ) : (
                        <LandingPage loginEnabled={loginEnabled} />
                    )
                }
            />
            <Route
                path="/login"
                element={loginEnabled ? <LoginPage /> : <Navigate to="/show-case" replace />}
            />
            <Route path="/loading" element={<LoadingPage />} />
            <Route
                path="/signup"
                element={loginEnabled ? <SignupPage /> : <Navigate to="/show-case" replace />}
            />
            <Route
                path="/signup/email-sent"
                element={
                    loginEnabled ? <SignupEmailSentPage /> : <Navigate to="/show-case" replace />
                }
            />
            <Route
                path="/forgot-password"
                element={
                    loginEnabled ? <ForgotPasswordPage /> : <Navigate to="/show-case" replace />
                }
            />
            <Route
                path="/forgot-password/email-sent"
                element={
                    loginEnabled ? (
                        <ForgotPasswordEmailSentPage />
                    ) : (
                        <Navigate to="/show-case" replace />
                    )
                }
            />
            <Route
                path="/reset-password"
                element={
                    loginEnabled ? <ResetPasswordPage /> : <Navigate to="/show-case" replace />
                }
            />
            <Route
                path="/reset-password/success"
                element={
                    loginEnabled ? (
                        <ResetPasswordSuccessPage />
                    ) : (
                        <Navigate to="/show-case" replace />
                    )
                }
            />
            <Route
                path="/verify-email"
                element={loginEnabled ? <VerifyEmailPage /> : <Navigate to="/show-case" replace />}
            />
            <Route
                element={
                    <ProtectedLayout loginEnabled={loginEnabled} configLoading={configLoading} />
                }
            >
                <Route path="/dashboard" element={<Navigate to="/show-case" replace />} />
                <Route path="/show-case" element={<ShowCasePage />} />
                <Route
                    path="/show-case/loading"
                    element={<LoadingPage message="Loading preview..." />}
                />
                <Route path="/show-case/404" element={<ShowCaseNotFoundPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route
                path="*"
                element={
                    <NotFoundRoute loginEnabled={loginEnabled} configLoading={configLoading} />
                }
            />
        </Routes>
    );
}
