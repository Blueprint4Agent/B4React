import { registerSessionRecovery, resetSessionRecovery } from "../api/http";
import {
    rememberAccount,
    updateRememberedProfile,
    removeRecentAccount,
    completeOAuthAccountIntent,
} from "../utils/recentAccounts";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import type { User, UpdateProfileInput } from "../api/auth/authApi";
import { useAuthApi } from "./api/auth/useAuthApi";
import { useProfilePhoto } from "./api/auth/useProfilePhoto";
import { useAppConfig } from "./useFeatures";
import { clearAccessToken, getAccessToken, setAccessToken } from "../store/session";

type AuthContextValue = {
    user: RoleAwareUser | null;
    loading: boolean;
    profileImageUrl: string | null;
    uploadPhoto: (file: File) => Promise<void>;
    deletePhoto: () => Promise<void>;
    login: (input: {
        email: string;
        password: string;
        remember_me: boolean;
        remember_account?: boolean;
    }) => Promise<void>;
    signup: (input: { email: string; name: string; password: string }) => Promise<void>;
    updateProfile: (input: UpdateProfileInput) => Promise<void>;
    logout: () => Promise<void>;
    deleteAccount: (email: string, code: string) => Promise<void>;
    refreshSession: () => Promise<void>;
    revalidateSession: (options?: { force?: boolean }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type RoleAwareUser = User & { role?: "admin" | "manager" | "user" };

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { ensureConfig, reload: reloadConfig } = useAppConfig();
    const {
        refresh: refreshAuth,
        me,
        login: loginAuth,
        signup: signupAuth,
        updateMe,
        uploadProfilePhoto,
        deleteProfilePhoto,
        deleteMe,
        logout: logoutAuth,
    } = useAuthApi();
    const [user, setUser] = useState<RoleAwareUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [photoRefreshEpoch, setPhotoRefreshEpoch] = useState(0);
    const profileImageUrl = useProfilePhoto(
        user?.id,
        user?.profile_image_url ?? null,
        photoRefreshEpoch,
    );
    useEffect(() => {
        if (
            user &&
            (!user.profile_image_url?.startsWith("/api/v1/auth/me/photo?") || profileImageUrl)
        ) {
            void updateRememberedProfile({ ...user, profile_image_url: profileImageUrl });
        }
    }, [user, profileImageUrl]);
    const sessionEpoch = useRef(0);
    const refreshInFlightRef = useRef<Promise<void> | null>(null);

    const refreshSession = useCallback(async () => {
        if (refreshInFlightRef.current) {
            return refreshInFlightRef.current;
        }

        const epoch = sessionEpoch.current;
        const refreshTask = (async () => {
            const refreshResult = await refreshAuth();
            if (epoch !== sessionEpoch.current) return;
            setAccessToken(refreshResult.access_token);
            const nextUser = await me();
            if (epoch !== sessionEpoch.current) return;
            completeOAuthAccountIntent(nextUser);
            setUser(nextUser);
            setPhotoRefreshEpoch((value) => value + 1);
        })();

        refreshInFlightRef.current = refreshTask;
        try {
            await refreshTask;
        } finally {
            refreshInFlightRef.current = null;
        }
    }, [me, refreshAuth]);

    const recoveryInFlight = useRef<Promise<void> | null>(null);
    const revalidate = useCallback(
        async (force = false) => {
            const epoch = sessionEpoch.current;
            try {
                let config = await ensureConfig();
                if (force && config?.login_enabled === false) config = await reloadConfig();
                if (epoch !== sessionEpoch.current) return;
                if (config?.login_enabled === false) {
                    if (config.bootstrap_access_token) {
                        setAccessToken(config.bootstrap_access_token);
                    } else {
                        clearAccessToken();
                    }
                    setUser(config.bootstrap_user ?? null);
                    if (force) setPhotoRefreshEpoch((value) => value + 1);
                    return;
                }

                if (force) {
                    await refreshSession();
                    return;
                }
                const token = getAccessToken();
                if (token) {
                    try {
                        const nextUser = await me();
                        if (epoch !== sessionEpoch.current) return;
                        completeOAuthAccountIntent(nextUser);
                        setUser(nextUser);
                        return;
                    } catch {
                        if (epoch !== sessionEpoch.current) return;
                        clearAccessToken();
                    }
                }

                await refreshSession();
            } catch {
                if (epoch !== sessionEpoch.current) return;
                clearAccessToken();
                setUser(null);
            }
        },
        [ensureConfig, reloadConfig, me, refreshSession],
    );
    const revalidateSession = useCallback(
        (options?: { force?: boolean }) => {
            if (recoveryInFlight.current) return recoveryInFlight.current;
            const task = revalidate(options?.force === true).finally(() => {
                recoveryInFlight.current = null;
            });
            recoveryInFlight.current = task;
            return task;
        },
        [revalidate],
    );

    useEffect(
        () => registerSessionRecovery(() => revalidateSession({ force: true })),
        [revalidateSession],
    );

    useEffect(() => {
        // Agent customization note:
        // This bootstrap flow is the single place to plug SSO/session policies.
        const bootstrap = async () => {
            try {
                await revalidateSession();
            } finally {
                setLoading(false);
            }
        };

        void bootstrap();
    }, [revalidateSession]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            loading,
            profileImageUrl,
            uploadPhoto: async (file) => {
                const epoch = sessionEpoch.current;
                const nextUser = await uploadProfilePhoto(file);
                if (epoch === sessionEpoch.current) setUser(nextUser);
            },
            deletePhoto: async () => {
                const epoch = sessionEpoch.current;
                const nextUser = await deleteProfilePhoto();
                if (epoch === sessionEpoch.current) setUser(nextUser);
            },
            login: async (input) => {
                sessionEpoch.current += 1;
                resetSessionRecovery();
                const { remember_account, ...credentials } = input;
                const payload = await loginAuth(credentials);
                if (remember_account)
                    rememberAccount({
                        email: payload.user.email,
                        name: payload.user.name ?? "",
                        provider: "email",
                    });
                else removeRecentAccount({ email: payload.user.email, provider: "email" });
                resetSessionRecovery();
                setAccessToken(payload.access_token);
                setUser(payload.user);
            },
            signup: async (input) => {
                await signupAuth(input);
            },
            updateProfile: async (input) => {
                const epoch = sessionEpoch.current;
                const nextUser = await updateMe(input);
                if (epoch === sessionEpoch.current) setUser(nextUser);
            },
            deleteAccount: async (email, code) => {
                await deleteMe({ email, code });
                sessionEpoch.current += 1;
                resetSessionRecovery();
                removeRecentAccount({ email, provider: "email" });
                clearAccessToken();
                setUser(null);
            },
            logout: async () => {
                sessionEpoch.current += 1;
                resetSessionRecovery();
                try {
                    await logoutAuth();
                } finally {
                    resetSessionRecovery();
                    clearAccessToken();
                    setUser(null);
                }
            },
            refreshSession,
            revalidateSession,
        }),
        [
            loading,
            loginAuth,
            logoutAuth,
            refreshSession,
            revalidateSession,
            signupAuth,
            updateMe,
            uploadProfilePhoto,
            deleteProfilePhoto,
            profileImageUrl,
            deleteMe,
            user,
        ],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used inside <AuthProvider>.");
    }
    return context;
}
