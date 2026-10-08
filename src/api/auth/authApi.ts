import type { components, operations } from "../generated/openapi";
import { apiClient, getAuthHeader } from "../http";
import i18n from "../../i18n";

type SignupInput = components["schemas"]["SignupForm"];
type LoginInput = components["schemas"]["LoginForm"];
export type UpdateProfileInput = components["schemas"]["UpdateProfileForm"];

export type User = components["schemas"]["UserResponse"];
export type LoginPayload = components["schemas"]["LoginResponse"];
export type RefreshPayload = components["schemas"]["RefreshResponse"];
export type VerifyEmailPayload = components["schemas"]["VerifyEmailResponse"];
export type ResendVerificationPayload = components["schemas"]["ResendVerificationResponse"];
export type ForgotPasswordPayload = components["schemas"]["ForgotPasswordResponse"];
export type ResetPasswordPayload = components["schemas"]["ResetPasswordResponse"];
export type OAuthProvider = components["schemas"]["OAuthProvider"];
export type OAuthProvidersPayload = components["schemas"]["OAuthProvidersResponse"];

function getAppLanguageHeader(): HeadersInit {
    const language = (i18n.resolvedLanguage ?? i18n.language ?? "en").split("-")[0] || "en";
    return { "X-App-Language": language };
}

export async function signup(input: SignupInput): Promise<User> {
    const { data, error } = await apiClient.POST("/api/v1/auth/signup", {
        body: input,
        headers: getAppLanguageHeader(),
    });
    if (error || !data) {
        throw error;
    }
    return data;
}

export async function login(input: LoginInput): Promise<LoginPayload> {
    const { data, error } = await apiClient.POST("/api/v1/auth/login", { body: input });
    if (error || !data) {
        throw error;
    }
    return data;
}

export async function getOAuthProviders(): Promise<OAuthProvidersPayload> {
    const { data, error } = await apiClient.GET("/api/v1/auth/oauth/providers");
    if (error || !data) {
        throw error;
    }
    return data;
}

export async function me(): Promise<User> {
    const { data, error } = await apiClient.GET("/api/v1/auth/me", {
        headers: getAuthHeader(),
    });
    if (error || !data) {
        throw error;
    }
    return data;
}

export async function updateMe(input: UpdateProfileInput): Promise<User> {
    const { data, error } = await apiClient.PATCH("/api/v1/auth/me", {
        headers: getAuthHeader(),
        body: input,
    });
    if (error || !data) {
        throw error;
    }
    return data;
}

export async function refresh(): Promise<RefreshPayload> {
    const { data, error } = await apiClient.POST("/api/v1/auth/refresh", {
        body: {},
    });
    if (error || !data) {
        throw error;
    }
    return data;
}

export async function logout() {
    const { data, error } = await apiClient.POST("/api/v1/auth/logout", {
        headers: getAuthHeader(),
    });
    if (error || !data) {
        throw error;
    }
    return data;
}

export async function verifyEmail(token: string): Promise<VerifyEmailPayload> {
    const { data, error } = await apiClient.POST("/api/v1/auth/verify-email", {
        headers: getAppLanguageHeader(),
        body: { token },
    });
    if (error || !data) {
        throw error;
    }
    return data;
}

export async function resendVerificationEmail(email: string): Promise<ResendVerificationPayload> {
    const { data, error } = await apiClient.POST("/api/v1/auth/resend-verification", {
        body: { email },
        headers: getAppLanguageHeader(),
    });
    if (error || !data) {
        throw error;
    }
    return data;
}

export async function requestPasswordReset(email: string): Promise<ForgotPasswordPayload> {
    const { data, error } = await apiClient.POST("/api/v1/auth/forgot-password", {
        body: { email },
        headers: getAppLanguageHeader(),
    });
    if (error || !data) {
        throw error;
    }
    return data;
}

export async function resetPassword(
    token: string,
    password: string,
): Promise<ResetPasswordPayload> {
    const { data, error } = await apiClient.POST("/api/v1/auth/reset-password", {
        body: { token, password },
    });
    if (error || !data) {
        throw error;
    }
    return data;
}

export type AdminUserQuery = NonNullable<
    operations["admin_users_api_v1_auth_admin_users_get"]["parameters"]["query"]
>;
export type AdminUserList = components["schemas"]["AdminUserListResponse"];
export async function listAdminUsers(
    query: AdminUserQuery,
    signal?: AbortSignal,
): Promise<AdminUserList> {
    const { data, error } = await apiClient.GET("/api/v1/auth/admin/users", {
        headers: getAuthHeader(),
        params: { query },
        signal,
    });
    if (error || !data) throw error;
    return data;
}

export async function deleteMe(input: components["schemas"]["DeleteAccountForm"]): Promise<void> {
    const { error, response } = await apiClient.DELETE("/api/v1/auth/me", {
        headers: { ...getAuthHeader(), ...getAppLanguageHeader() },
        body: input,
    });
    if (error || !response.ok) throw error;
}

export async function requestDeletionCode(): Promise<
    components["schemas"]["DeleteAccountCodeResponse"]
> {
    const { data, error } = await apiClient.POST("/api/v1/auth/me/deletion-code", {
        headers: { ...getAuthHeader(), ...getAppLanguageHeader() },
    });
    if (error || !data) throw error;
    return data;
}

export async function uploadProfilePhoto(file: File): Promise<User> {
    const { data, error } = await apiClient.PUT("/api/v1/auth/me/photo", {
        headers: { ...getAuthHeader(), "Content-Type": "application/octet-stream" },
        // OpenAPI represents binary bodies as string; the serializer sends actual bytes.
        body: "",
        bodySerializer: () => file,
    });
    if (error || !data) throw error;
    return data;
}

export async function deleteProfilePhoto(): Promise<User> {
    const { data, error } = await apiClient.DELETE("/api/v1/auth/me/photo", {
        headers: getAuthHeader(),
    });
    if (error || !data) throw error;
    return data;
}

export async function readProfilePhoto(version: string, signal?: AbortSignal): Promise<Blob> {
    const { data, error } = await apiClient.GET("/api/v1/auth/me/photo", {
        headers: getAuthHeader(),
        params: { query: { version } },
        parseAs: "blob",
        signal,
        cache: "no-store",
    });
    if (error || !data) throw error;
    return data;
}
