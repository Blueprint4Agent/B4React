import { useSubscription } from "./hooks/api/billing/useSubscription";
import { tierFor } from "./utils/billingPlans";
import { useTranslation } from "react-i18next";
import { lazy, useState, type ReactNode } from "react";
import { Navigate, Outlet, Route, Routes, useSearchParams } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { useAuthContext } from "./hooks/useAuth";
import { useAppConfig } from "./hooks/useFeatures";
import { useTheme } from "./hooks/useTheme";
import { LoadingPage } from "./pages/main/LoadingPage";
import { ShowCaseNotFoundPage } from "./pages/main/ShowCaseNotFoundPage";
import { ShowCasePage } from "./pages/main/ShowCasePage";
import { ServerUnavailablePage } from "./pages/main/ServerUnavailablePage";
import { useServerConnectivity } from "./hooks/connectivity/useServerConnectivity";

import { RouteBoundary } from "./components/layout/RouteBoundary";

const ForgotPasswordEmailSentPage = lazy(() =>
    import("./pages/login/ForgotPasswordEmailSentPage").then((module) => ({
        default: module.ForgotPasswordEmailSentPage,
    })),
);
const ForgotPasswordPage = lazy(() =>
    import("./pages/login/ForgotPasswordPage").then((module) => ({
        default: module.ForgotPasswordPage,
    })),
);
const LoginPage = lazy(() =>
    import("./pages/login/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const ResetPasswordPage = lazy(() =>
    import("./pages/login/ResetPasswordPage").then((module) => ({
        default: module.ResetPasswordPage,
    })),
);
const ResetPasswordSuccessPage = lazy(() =>
    import("./pages/login/ResetPasswordSuccessPage").then((module) => ({
        default: module.ResetPasswordSuccessPage,
    })),
);
const SignupEmailSentPage = lazy(() =>
    import("./pages/login/SignupEmailSentPage").then((module) => ({
        default: module.SignupEmailSentPage,
    })),
);
const SignupPage = lazy(() =>
    import("./pages/login/SignupPage").then((module) => ({ default: module.SignupPage })),
);
const VerifyEmailPage = lazy(() =>
    import("./pages/login/VerifyEmailPage").then((module) => ({ default: module.VerifyEmailPage })),
);
const LandingPage = lazy(() =>
    import("./pages/main/LandingPage").then((module) => ({ default: module.LandingPage })),
);
const AdminPage = lazy(() =>
    import("./pages/admin/AdminPage").then((module) => ({ default: module.AdminPage })),
);
const SettingsPage = lazy(() =>
    import("./pages/settings/SettingsPage").then((module) => ({ default: module.SettingsPage })),
);

const HomePage = lazy(() =>
    import("./pages/main/HomePage").then((module) => ({ default: module.HomePage })),
);

const PlansPage = lazy(() =>
    import("./pages/billing/PlansPage").then((module) => ({ default: module.PlansPage })),
);

function AppShell({ children }: { children: ReactNode }) {
    const { user } = useAuthContext();
    const billing = useSubscription(user?.id);
    const tier = !billing.error && billing.subscription ? tierFor(billing.subscription.plan) : null;
    return <AppLayout subscriptionTier={tier}>{children}</AppLayout>;
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
            <AppShell>
                <ShowCaseNotFoundPage />
            </AppShell>
        );
    }

    return (
        <main className="page">
            <ShowCaseNotFoundPage />
        </main>
    );
}

function AuthDialogRoute({
    children,
    guestOnly = false,
}: {
    children: ReactNode;
    guestOnly?: boolean;
}) {
    const { user, loading } = useAuthContext();
    const [params] = useSearchParams();
    if (guestOnly && !loading && user && params.get("switch") !== "1")
        return <Navigate to="/home" replace />;
    return (
        <>
            <HomePage />
            <RouteBoundary fallback={<LoadingPage />}>{children}</RouteBoundary>
        </>
    );
}

export function App() {
    const { revalidateSession } = useAuthContext();
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
                        .then(() => revalidateSession())
                        .catch(() => undefined)
                        .finally(() => setRetryingConfig(false));
                }}
            />
        );
    }

    const loginEnabled = appConfig.login_enabled;
    const development = appConfig.app_mode === "development";
    const homePath = "/home";

    return (
        <Routes>
            <Route path="/" element={<Navigate to={homePath} replace />} />
            <Route
                path="/welcome"
                element={
                    <RouteBoundary fallback={<LoadingPage />}>
                        {development ? (
                            <LandingPage loginEnabled={loginEnabled} />
                        ) : (
                            <Navigate to={homePath} replace />
                        )}
                    </RouteBoundary>
                }
            />
            <Route path="/loading" element={<LoadingPage />} />
            <Route
                path="/plans"
                element={
                    <main className="plans-screen">
                        <RouteBoundary fallback={<LoadingPage />}>
                            <PlansPage />
                        </RouteBoundary>
                    </main>
                }
            />
            <Route
                element={
                    <AppShell>
                        <RouteBoundary fallback={<LoadingPage />}>
                            <Outlet />
                        </RouteBoundary>
                    </AppShell>
                }
            >
                <Route path="/home" element={<HomePage />} />
                <Route path="/dashboard" element={<Navigate to={homePath} replace />} />
                <Route
                    path="/show-case"
                    element={development ? <ShowCasePage /> : <Navigate to={homePath} replace />}
                />
                <Route
                    path="/show-case/loading"
                    element={
                        development ? <LoadingPage preview /> : <Navigate to={homePath} replace />
                    }
                />
                <Route
                    path="/show-case/404"
                    element={
                        development ? (
                            <ShowCaseNotFoundPage preview />
                        ) : (
                            <Navigate to={homePath} replace />
                        )
                    }
                />
                <Route
                    path="/login"
                    element={
                        loginEnabled ? (
                            <AuthDialogRoute guestOnly>
                                <LoginPage embedded />
                            </AuthDialogRoute>
                        ) : (
                            <Navigate to={homePath} replace />
                        )
                    }
                />
                <Route
                    path="/signup"
                    element={
                        loginEnabled ? (
                            <AuthDialogRoute guestOnly>
                                <SignupPage embedded />
                            </AuthDialogRoute>
                        ) : (
                            <Navigate to={homePath} replace />
                        )
                    }
                />
                <Route
                    path="/signup/email-sent"
                    element={
                        loginEnabled ? (
                            <AuthDialogRoute>
                                <SignupEmailSentPage embedded />
                            </AuthDialogRoute>
                        ) : (
                            <Navigate to={homePath} replace />
                        )
                    }
                />
                <Route
                    path="/forgot-password"
                    element={
                        loginEnabled ? (
                            <AuthDialogRoute>
                                <ForgotPasswordPage embedded />
                            </AuthDialogRoute>
                        ) : (
                            <Navigate to={homePath} replace />
                        )
                    }
                />
                <Route
                    path="/forgot-password/email-sent"
                    element={
                        loginEnabled ? (
                            <AuthDialogRoute>
                                <ForgotPasswordEmailSentPage embedded />
                            </AuthDialogRoute>
                        ) : (
                            <Navigate to={homePath} replace />
                        )
                    }
                />
                <Route
                    path="/reset-password"
                    element={
                        loginEnabled ? (
                            <AuthDialogRoute>
                                <ResetPasswordPage embedded />
                            </AuthDialogRoute>
                        ) : (
                            <Navigate to={homePath} replace />
                        )
                    }
                />
                <Route
                    path="/reset-password/success"
                    element={
                        loginEnabled ? (
                            <AuthDialogRoute>
                                <ResetPasswordSuccessPage embedded />
                            </AuthDialogRoute>
                        ) : (
                            <Navigate to={homePath} replace />
                        )
                    }
                />
                <Route
                    path="/verify-email"
                    element={
                        loginEnabled ? (
                            <AuthDialogRoute>
                                <VerifyEmailPage embedded />
                            </AuthDialogRoute>
                        ) : (
                            <Navigate to={homePath} replace />
                        )
                    }
                />
                <Route path="/admin" element={<AdminPage />} />
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
