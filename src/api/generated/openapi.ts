export interface paths {
    "/api/v1/admin/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Status */
        get: operations["status_api_v1_admin_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api-keys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Api Keys */
        get: operations["list_api_keys_api_v1_api_keys_get"];
        put?: never;
        /** Create Api Key */
        post: operations["create_api_key_api_v1_api_keys_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api-keys/{api_key_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Api Key */
        delete: operations["delete_api_key_api_v1_api_keys__api_key_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/api-keys/{api_key_id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update Api Key Status */
        patch: operations["update_api_key_status_api_v1_api_keys__api_key_id__status_patch"];
        trace?: never;
    };
    "/api/v1/auth/admin/user-role-stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Admin User Role Stats */
        get: operations["admin_user_role_stats_api_v1_auth_admin_user_role_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/admin/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Admin Users */
        get: operations["admin_users_api_v1_auth_admin_users_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/forgot-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Forgot Password */
        post: operations["forgot_password_api_v1_auth_forgot_password_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Login */
        post: operations["login_api_v1_auth_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Logout
         * @description Invalidates all refresh sessions for the authenticated user and expires both refresh cookies. Already-issued access tokens remain valid until their expiry.
         */
        post: operations["logout_api_v1_auth_logout_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Me */
        get: operations["me_api_v1_auth_me_get"];
        put?: never;
        post?: never;
        /**
         * Delete Me
         * @description Permanently deletes the current account, credentials, OAuth identities and API keys. Requires bearer authentication, matching email confirmation and a single-use emailed code. Clears refresh cookies; all sessions stop authenticating.
         */
        delete: operations["delete_me_api_v1_auth_me_delete"];
        options?: never;
        head?: never;
        /** Update Me */
        patch: operations["update_me_api_v1_auth_me_patch"];
        trace?: never;
    };
    "/api/v1/auth/me/deletion-code": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Request Deletion Code */
        post: operations["request_deletion_code_api_v1_auth_me_deletion_code_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me/photo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read Profile Photo */
        get: operations["read_profile_photo_api_v1_auth_me_photo_get"];
        /** Upload Profile Photo */
        put: operations["upload_profile_photo_api_v1_auth_me_photo_put"];
        post?: never;
        /** Delete Profile Photo */
        delete: operations["delete_profile_photo_api_v1_auth_me_photo_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/oauth/providers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Oauth Providers */
        get: operations["oauth_providers_api_v1_auth_oauth_providers_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/oauth/{provider}/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Oauth Callback */
        get: operations["oauth_callback_api_v1_auth_oauth__provider__callback_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/oauth/{provider}/start": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Oauth Start */
        get: operations["oauth_start_api_v1_auth_oauth__provider__start_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Refresh Token
         * @description Refreshes the access token and extends the existing refresh session TTL. The refresh token value is retained. Non-empty JSON fields take precedence over cookies; user_id can be resolved from the session. Browser clients may send an empty JSON object.
         */
        post: operations["refresh_token_api_v1_auth_refresh_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/resend-verification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Resend Verification Email */
        post: operations["resend_verification_email_api_v1_auth_resend_verification_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reset Password */
        post: operations["reset_password_api_v1_auth_reset_password_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/signup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Signup */
        post: operations["signup_api_v1_auth_signup_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Oauth Token Login */
        post: operations["oauth_token_login_api_v1_auth_token_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/verify-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verify Email */
        post: operations["verify_email_api_v1_auth_verify_email_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/card-setups": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Card Setup */
        post: operations["create_card_setup_api_v1_billing_card_setups_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/card-setups/{intent_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Card Setup Status */
        get: operations["card_setup_status_api_v1_billing_card_setups__intent_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/checkout-sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Checkout */
        post: operations["create_checkout_api_v1_billing_checkout_sessions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/checkout-sessions/{session_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Checkout Status */
        get: operations["checkout_status_api_v1_billing_checkout_sessions__session_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Billing Config */
        get: operations["billing_config_api_v1_billing_config_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/invoices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Billing Invoices */
        get: operations["billing_invoices_api_v1_billing_invoices_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/invoices/{invoice_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Invoice Detail */
        get: operations["invoice_detail_api_v1_billing_invoices__invoice_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/payment-methods": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Payment Methods */
        get: operations["list_payment_methods_api_v1_billing_payment_methods_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/payment-methods/{method_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Manage Billing Method */
        post: operations["manage_billing_method_api_v1_billing_payment_methods__method_id__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Plans */
        get: operations["plans_api_v1_billing_plans_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/portal-sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Billing Portal */
        post: operations["billing_portal_api_v1_billing_portal_sessions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Billing Profile */
        get: operations["billing_profile_api_v1_billing_profile_get"];
        /** Update Billing Profile */
        put: operations["update_billing_profile_api_v1_billing_profile_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/setup-sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Setup */
        post: operations["create_setup_api_v1_billing_setup_sessions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/setup-sessions/{session_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Setup Status */
        get: operations["setup_status_api_v1_billing_setup_sessions__session_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/subscription": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Subscription */
        get: operations["subscription_api_v1_billing_subscription_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/subscription/change": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Change Subscription */
        post: operations["change_subscription_api_v1_billing_subscription_change_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/billing/webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Billing Webhook */
        post: operations["billing_webhook_api_v1_billing_webhook_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/events/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Stream Events */
        get: operations["stream_events_api_v1_events_stream_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Config */
        get: operations["config_config_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health Live */
        get: operations["health_live_health_live_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health Ready */
        get: operations["health_ready_health_ready_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ping": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Ping */
        get: operations["ping_ping_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** APIKeyCreateForm */
        APIKeyCreateForm: {
            /** Expires At */
            expires_at?: string | null;
            /** Name */
            name: string;
        };
        /** APIKeyCreateResponse */
        APIKeyCreateResponse: {
            /** Api Key */
            api_key: string;
            key: components["schemas"]["APIKeyResponse"];
        };
        /** APIKeyErrorDetail */
        APIKeyErrorDetail: {
            /** Details */
            details?: {
                [key: string]: unknown;
            } | null;
            /**
             * Error
             * @example API_KEY_NOT_FOUND
             * @enum {string}
             */
            error:
                | "API_KEY_INVALID"
                | "API_KEY_USER_MISMATCH"
                | "API_KEY_CREATE_FAILED"
                | "API_KEY_NAME_ALREADY_EXISTS"
                | "API_KEY_NOT_FOUND"
                | "API_KEY_UPDATE_FAILED";
            /** Message */
            message: string;
        };
        /** APIKeyErrorResponse */
        APIKeyErrorResponse: {
            detail: components["schemas"]["APIKeyErrorDetail"];
        };
        /** APIKeyEvent */
        APIKeyEvent: {
            /** Id */
            id: string;
            payload: components["schemas"]["APIKeyEventPayload"];
            /**
             * Ts
             * Format: date-time
             */
            ts: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "api_key.created" | "api_key.deleted" | "api_key.status_updated";
            /**
             * Version
             * @default v1
             */
            version: string;
        };
        /** APIKeyEventPayload */
        APIKeyEventPayload: {
            api_key: components["schemas"]["APIKeyResponse"];
        };
        /** APIKeyResponse */
        APIKeyResponse: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Expires At */
            expires_at?: string | null;
            /** Id */
            id: number;
            /** Key Prefix */
            key_prefix: string;
            /** Last Used At */
            last_used_at?: string | null;
            /** Name */
            name: string;
            /** Request Count */
            request_count: number;
            /** Revoked At */
            revoked_at?: string | null;
        };
        /** APIKeyStatusUpdateForm */
        APIKeyStatusUpdateForm: {
            /** Enabled */
            enabled: boolean;
        };
        /** APIKeysResponse */
        APIKeysResponse: {
            /** Items */
            items: components["schemas"]["APIKeyResponse"][];
        };
        /** AdminConnection */
        AdminConnection: {
            /** Host */
            host?: string | null;
            /**
             * Id
             * @enum {string}
             */
            id: "server" | "database" | "cache";
            /** Latency Ms */
            latency_ms?: number | null;
            /** Port */
            port?: number | null;
            /**
             * Status
             * @enum {string}
             */
            status: "ok" | "failed" | "timeout";
            /**
             * Technology
             * @enum {string}
             */
            technology:
                | "fastapi"
                | "sqlite"
                | "postgresql"
                | "mysql"
                | "mariadb"
                | "database"
                | "redis"
                | "memory";
        };
        /** AdminEnvironment */
        AdminEnvironment: {
            /**
             * Admin Access
             * @default admin_only
             * @constant
             */
            admin_access: "admin_only";
            /**
             * App Mode
             * @enum {string}
             */
            app_mode: "development" | "production";
            /** Billing Configured */
            billing_configured: boolean;
            /** Billing Enabled */
            billing_enabled: boolean;
            /**
             * Billing Mode
             * @enum {string}
             */
            billing_mode: "disabled" | "test" | "live";
            /** Developer Enabled */
            developer_enabled: boolean;
            /** Email Enabled */
            email_enabled: boolean;
            /** Login Enabled */
            login_enabled: boolean;
            /** Oauth Enabled */
            oauth_enabled: boolean;
            /** Oauth Providers */
            oauth_providers: string[];
            /** Redis In Memory */
            redis_in_memory: boolean;
        };
        /** AdminEnvironmentValues */
        AdminEnvironmentValues: {
            /**
             * App Mode
             * @enum {string}
             */
            APP_MODE: "development" | "production";
            /** Email Enabled */
            EMAIL_ENABLED: boolean;
            /** Login Enabled */
            LOGIN_ENABLED: boolean;
            /** Oauth Enabled */
            OAUTH_ENABLED: boolean;
            /** Redis In Memory */
            REDIS_IN_MEMORY: boolean;
            /** Stripe Enabled */
            STRIPE_ENABLED: boolean;
        };
        /** AdminErrorDetail */
        AdminErrorDetail: {
            /** Details */
            details?: {
                [key: string]: unknown;
            } | null;
            /**
             * Error
             * @example ADMIN_STATUS_FAILED
             * @enum {string}
             */
            error: "ADMIN_STATUS_FAILED";
            /** Message */
            message: string;
        };
        /** AdminErrorResponse */
        AdminErrorResponse: {
            detail: components["schemas"]["AdminErrorDetail"];
        };
        /** AdminStatusResponse */
        AdminStatusResponse: {
            /**
             * Checked At
             * Format: date-time
             */
            checked_at: string;
            /** Connections */
            connections: components["schemas"]["AdminConnection"][];
            environment: components["schemas"]["AdminEnvironment"];
            environment_values: components["schemas"]["AdminEnvironmentValues"];
            /** Integration Checks */
            integration_checks: {
                [key: string]: components["schemas"]["IntegrationCheck"];
            };
            /** Startup Checks */
            startup_checks: {
                [key: string]: components["schemas"]["StartupCheck"];
            };
            /**
             * Status
             * @enum {string}
             */
            status: "ok" | "degraded";
        };
        /** AdminUserListResponse */
        AdminUserListResponse: {
            /** Items */
            items: components["schemas"]["AdminUserResponse"][];
            /** Page */
            page: number;
            /** Page Size */
            page_size: number;
            summary: components["schemas"]["UserRoleStatsResponse"];
            /** Total */
            total: number;
        };
        /** AdminUserResponse */
        AdminUserResponse: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Email */
            email: string;
            /** Id */
            id: number;
            /** Is Active */
            is_active: boolean;
            /** Is Verified */
            is_verified: boolean;
            /** Last Login At */
            last_login_at: string | null;
            /** Login Providers */
            login_providers: string[];
            /** Name */
            name: string;
            role: components["schemas"]["UserRole"];
        };
        /** AppConfigResponse */
        AppConfigResponse: {
            /** Api Base Path */
            api_base_path: string;
            /**
             * App Mode
             * @enum {string}
             */
            app_mode: "development" | "production";
            /** Billing Enabled */
            billing_enabled: boolean;
            /** Bootstrap Access Token */
            bootstrap_access_token?: string | null;
            bootstrap_user?: components["schemas"]["UserResponse"] | null;
            /** Email Enabled */
            email_enabled: boolean;
            /** Frontend Base Path */
            frontend_base_path: string;
            /** Login Enabled */
            login_enabled: boolean;
            /** Oauth Enabled */
            oauth_enabled: boolean;
            /** Oauth Providers */
            oauth_providers: string[];
        };
        /** AuthErrorDetail */
        AuthErrorDetail: {
            /** Details */
            details?: {
                [key: string]: unknown;
            } | null;
            /**
             * Error
             * @example INVALID_TOKEN
             * @enum {string}
             */
            error:
                | "ACCOUNT_BILLING_REVIEW_REQUIRED"
                | "ACCOUNT_DELETE_CODE_INVALID"
                | "ACCOUNT_DELETE_CODE_THROTTLED"
                | "ACCOUNT_DELETE_CODE_SEND_FAILED"
                | "ACCOUNT_DELETE_FAILED"
                | "ACCOUNT_DELETE_CONFIRMATION_REQUIRED"
                | "LAST_ADMIN_REQUIRED"
                | "ADMIN_USERS_FAILED"
                | "SIGNUP_FAILED"
                | "EMAIL_ALREADY_EXISTS"
                | "INVALID_CREDENTIALS"
                | "ACCOUNT_LOCKED"
                | "EMAIL_NOT_VERIFIED"
                | "LOGIN_DISABLED"
                | "EMAIL_DISABLED"
                | "INVALID_TOKEN"
                | "INSUFFICIENT_ROLE"
                | "USER_NOT_FOUND"
                | "PROFILE_PHOTO_INVALID"
                | "PROFILE_PHOTO_TOO_LARGE"
                | "PROFILE_PHOTO_UNAVAILABLE"
                | "PROFILE_PHOTO_NOT_FOUND"
                | "PROFILE_PHOTO_CONFLICT"
                | "PROFILE_UPDATE_FAILED"
                | "OAUTH_PROVIDER_NOT_ENABLED"
                | "OAUTH_PROVIDER_CONFIG_INVALID"
                | "OAUTH_IDENTITY_CONFLICT"
                | "OAUTH_SIGNUP_FAILED"
                | "OAUTH_PROVIDER_REQUEST_FAILED";
            /** Message */
            message: string;
        };
        /** AuthErrorResponse */
        AuthErrorResponse: {
            detail: components["schemas"]["AuthErrorDetail"];
        };
        /** BillingAddress */
        BillingAddress: {
            /**
             * City
             * @default
             */
            city: string;
            /**
             * Country
             * @default
             */
            country: string;
            /**
             * Line1
             * @default
             */
            line1: string;
            /**
             * Line2
             * @default
             */
            line2: string;
            /**
             * Postal Code
             * @default
             */
            postal_code: string;
            /**
             * State
             * @default
             */
            state: string;
        };
        /** BillingCardSetupResponse */
        BillingCardSetupResponse: {
            /** Client Secret */
            client_secret: string;
            /** Id */
            id: string;
        };
        /** BillingCardSetupStatus */
        BillingCardSetupStatus: {
            /** Registered */
            registered: boolean;
        };
        /** BillingChangeForm */
        BillingChangeForm: {
            /** Expected Version */
            expected_version: string;
            /**
             * Plan
             * @enum {string}
             */
            plan: "free" | "monthly" | "annual" | "pro_monthly" | "pro_annual" | "keep";
            /**
             * Request Id
             * Format: uuid
             * @description Reuse this UUID when retrying the same setup request.
             */
            request_id: string;
        };
        /** BillingCheckoutForm */
        BillingCheckoutForm: {
            /**
             * Currency
             * @enum {string}
             */
            currency: "krw" | "usd";
            /**
             * Plan
             * @enum {string}
             */
            plan: "monthly" | "annual" | "pro_monthly" | "pro_annual";
            /**
             * Request Id
             * Format: uuid
             * @description Reuse this UUID when retrying the same setup request.
             */
            request_id: string;
        };
        /** BillingCheckoutStatusResponse */
        BillingCheckoutStatusResponse: {
            /** Id */
            id: string;
            /** Paid */
            paid: boolean;
            /**
             * Status
             * @enum {string}
             */
            status: "open" | "complete" | "expired";
        };
        /** BillingConfigResponse */
        BillingConfigResponse: {
            /** Enabled */
            enabled: boolean;
            /** Livemode */
            livemode: boolean;
            /** Publishable Key */
            publishable_key?: string | null;
        };
        /** BillingErrorDetail */
        BillingErrorDetail: {
            /** Details */
            details?: {
                [key: string]: unknown;
            } | null;
            /**
             * Error
             * @example BILLING_DISABLED
             * @enum {string}
             */
            error:
                | "BILLING_WEBHOOK_INVALID"
                | "BILLING_WEBHOOK_UNAVAILABLE"
                | "BILLING_DISABLED"
                | "BILLING_UNAVAILABLE"
                | "BILLING_PLAN_UNAVAILABLE"
                | "BILLING_CHECKOUT_CONFLICT"
                | "BILLING_CHANGE_CONFLICT"
                | "BILLING_METHOD_REQUIRED"
                | "BILLING_NOT_FOUND"
                | "BILLING_RECONCILIATION_REQUIRED";
            /** Message */
            message: string;
        };
        /** BillingErrorResponse */
        BillingErrorResponse: {
            detail: components["schemas"]["BillingErrorDetail"];
        };
        /** BillingInvoiceDetail */
        BillingInvoiceDetail: {
            /** Amount */
            amount: number;
            /** Amount Due */
            amount_due: number;
            /** Amount Paid */
            amount_paid: number;
            /** Created */
            created: number;
            /** Currency */
            currency: string;
            /** Id */
            id: string;
            /** Lines */
            lines: components["schemas"]["BillingInvoiceLine"][];
            /**
             * Lines Has More
             * @default false
             */
            lines_has_more: boolean;
            /** Number */
            number?: string | null;
            /** Pdf Url */
            pdf_url?: string | null;
            /** Status */
            status: string;
            /** Subtotal */
            subtotal: number;
            /** Total */
            total: number;
            /** Url */
            url?: string | null;
        };
        /** BillingInvoiceLine */
        BillingInvoiceLine: {
            /** Amount */
            amount: number;
            /** Description */
            description: string;
            /** Quantity */
            quantity?: number | null;
        };
        /** BillingInvoiceResponse */
        BillingInvoiceResponse: {
            /** Amount */
            amount: number;
            /** Created */
            created: number;
            /** Currency */
            currency: string;
            /** Id */
            id: string;
            /** Number */
            number?: string | null;
            /** Status */
            status: string;
            /** Url */
            url?: string | null;
        };
        /** BillingInvoicesResponse */
        BillingInvoicesResponse: {
            /** Has More */
            has_more: boolean;
            /** Items */
            items: components["schemas"]["BillingInvoiceResponse"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** BillingMethodForm */
        BillingMethodForm: {
            /**
             * Action
             * @enum {string}
             */
            action: "default" | "remove";
            /**
             * Request Id
             * Format: uuid
             * @description Reuse this UUID when retrying the same setup request.
             */
            request_id: string;
        };
        /** BillingPaymentMethodResponse */
        BillingPaymentMethodResponse: {
            /** Brand */
            brand?: string | null;
            /** Exp Month */
            exp_month?: number | null;
            /** Exp Year */
            exp_year?: number | null;
            /** Id */
            id: string;
            /** Last4 */
            last4?: string | null;
            /**
             * Type
             * @enum {string}
             */
            type: "card" | "link";
        };
        /** BillingPaymentMethodsResponse */
        BillingPaymentMethodsResponse: {
            /** Has More */
            has_more: boolean;
            /** Items */
            items: components["schemas"]["BillingPaymentMethodResponse"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** BillingPlansResponse */
        BillingPlansResponse: {
            /** Enabled */
            enabled: boolean;
            /** Livemode */
            livemode: boolean;
            /** Prices */
            prices: components["schemas"]["BillingPriceResponse"][];
        };
        /** BillingPortalForm */
        BillingPortalForm: {
            /**
             * Flow
             * @default overview
             * @enum {string}
             */
            flow: "overview" | "payment_method_update" | "customer_update";
            /**
             * Request Id
             * Format: uuid
             * @description Reuse this UUID when retrying the same setup request.
             */
            request_id: string;
        };
        /** BillingPriceResponse */
        BillingPriceResponse: {
            /**
             * Amount
             * @description Minor currency units; KRW has no decimal places.
             */
            amount: number;
            /**
             * Currency
             * @enum {string}
             */
            currency: "krw" | "usd";
            /**
             * Plan
             * @enum {string}
             */
            plan: "monthly" | "annual" | "pro_monthly" | "pro_annual";
        };
        /** BillingProfileForm */
        BillingProfileForm: {
            address: components["schemas"]["BillingAddress"];
            /** Email */
            email: string;
            /** Name */
            name: string;
            /**
             * Request Id
             * Format: uuid
             * @description Reuse this UUID when retrying the same setup request.
             */
            request_id: string;
        };
        /** BillingProfileResponse */
        BillingProfileResponse: {
            /** Address */
            address?: string[];
            address_fields?: components["schemas"]["BillingAddress"];
            /** Default Payment Method */
            default_payment_method?: string | null;
            /** Email */
            email?: string | null;
            /** Name */
            name?: string | null;
            /**
             * Portal Enabled
             * @default false
             */
            portal_enabled: boolean;
        };
        /** BillingSetupForm */
        BillingSetupForm: {
            /**
             * Request Id
             * Format: uuid
             * @description Reuse this UUID when retrying the same setup request.
             */
            request_id: string;
        };
        /** BillingSetupResponse */
        BillingSetupResponse: {
            /** Id */
            id: string;
            /** Url */
            url: string;
        };
        /** BillingSetupStatusResponse */
        BillingSetupStatusResponse: {
            /** Id */
            id: string;
            /** Registered */
            registered: boolean;
            /**
             * Status
             * @enum {string}
             */
            status: "open" | "complete" | "expired";
        };
        /** BillingSubscriptionResponse */
        BillingSubscriptionResponse: {
            /**
             * Can Manage
             * @default false
             */
            can_manage: boolean;
            /**
             * Cancel At Period End
             * @default false
             */
            cancel_at_period_end: boolean;
            /** Change Version */
            change_version?: string | null;
            /** Currency */
            currency?: string | null;
            /** Current Period End */
            current_period_end?: number | null;
            /**
             * Has Subscription
             * @default false
             */
            has_subscription: boolean;
            /**
             * Payment Required
             * @default false
             */
            payment_required: boolean;
            /** Payment Url */
            payment_url?: string | null;
            /** Pending Effective At */
            pending_effective_at?: number | null;
            /** Pending Plan */
            pending_plan?: ("free" | "monthly" | "annual" | "pro_monthly" | "pro_annual") | null;
            /**
             * Plan
             * @enum {string}
             */
            plan: "free" | "monthly" | "annual" | "pro_monthly" | "pro_annual" | "unknown";
            /** Status */
            status: string;
        };
        /** Body_oauth_token_login_api_v1_auth_token_post */
        Body_oauth_token_login_api_v1_auth_token_post: {
            /** Client Id */
            client_id?: string | null;
            /**
             * Client Secret
             * Format: password
             */
            client_secret?: string | null;
            /** Grant Type */
            grant_type?: string | null;
            /**
             * Password
             * Format: password
             */
            password: string;
            /**
             * Scope
             * @default
             */
            scope: string;
            /** Username */
            username: string;
        };
        /** Body_refresh_token_api_v1_auth_refresh_post */
        Body_refresh_token_api_v1_auth_refresh_post: {
            /** Refresh Token */
            refresh_token?: string | null;
            /** Session Id */
            session_id?: string | null;
            /** User Id */
            user_id?: number | null;
        };
        /** ConnectedEvent */
        ConnectedEvent: {
            /** Id */
            id: string;
            payload: components["schemas"]["ConnectedPayload"];
            /**
             * Ts
             * Format: date-time
             */
            ts: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "connected";
            /**
             * Version
             * @default v1
             */
            version: string;
        };
        /** ConnectedPayload */
        ConnectedPayload: {
            /** Channel */
            channel: string;
            /** User Id */
            user_id: number;
        };
        /** DeleteAccountCodeResponse */
        DeleteAccountCodeResponse: {
            /** Expires In */
            expires_in: number;
            /** Retry After */
            retry_after: number;
        };
        /** DeleteAccountForm */
        DeleteAccountForm: {
            /** Code */
            code: string;
            /** Email */
            email: string;
        };
        /** ForgotPasswordForm */
        ForgotPasswordForm: {
            /** Email */
            email: string;
        };
        /** ForgotPasswordResponse */
        ForgotPasswordResponse: {
            /** Message */
            message: string;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** HealthCheckResult */
        HealthCheckResult: {
            /**
             * Status
             * @constant
             */
            status: "ok";
        };
        /** IntegrationCheck */
        IntegrationCheck: {
            /**
             * Checked At
             * Format: date-time
             */
            checked_at: string;
            /**
             * Status
             * @enum {string}
             */
            status: "ok" | "failed" | "timeout" | "disabled";
        };
        /** InternalErrorResponse */
        InternalErrorResponse: {
            /**
             * Error
             * @constant
             */
            error: "INTERNAL_ERROR";
            /** Message */
            message: string;
        };
        /** KeyboardShortcuts */
        KeyboardShortcuts: {
            /** Opensettings */
            openSettings: string[];
            /** Togglesidebar */
            toggleSidebar: string[];
        };
        /** LoginForm */
        LoginForm: {
            /** Email */
            email: string;
            /** Password */
            password: string;
            /**
             * Remember Me
             * @default false
             */
            remember_me: boolean;
        };
        /** LoginResponse */
        LoginResponse: {
            /** Access Token */
            access_token: string;
            /** Refresh Token */
            refresh_token: string;
            /**
             * Token Type
             * @default bearer
             */
            token_type: string;
            user: components["schemas"]["UserResponse"];
        };
        /**
         * OAuthProvider
         * @enum {string}
         */
        OAuthProvider: "google" | "github";
        /** OAuthProviderPublicConfig */
        OAuthProviderPublicConfig: {
            provider: components["schemas"]["OAuthProvider"];
            /**
             * Start Path
             * @description Backend endpoint path to start OAuth login.
             */
            start_path: string;
        };
        /** OAuthProvidersResponse */
        OAuthProvidersResponse: {
            /** Providers */
            providers: components["schemas"]["OAuthProviderPublicConfig"][];
        };
        /** PingEvent */
        PingEvent: {
            /** Id */
            id: string;
            /** Payload */
            payload: {
                [key: string]: unknown;
            };
            /**
             * Ts
             * Format: date-time
             */
            ts: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "ping";
            /**
             * Version
             * @default v1
             */
            version: string;
        };
        /** ReadinessResponse */
        ReadinessResponse: {
            /** Checks */
            checks: {
                [key: string]: string;
            };
            /**
             * Status
             * @enum {string}
             */
            status: "ok" | "degraded";
        };
        /** RealtimeEvent */
        RealtimeEvent: {
            /** Id */
            id: string;
            /** Payload */
            payload: {
                [key: string]: unknown;
            };
            /**
             * Ts
             * Format: date-time
             */
            ts: string;
            /** Type */
            type: string;
            /**
             * Version
             * @default v1
             */
            version: string;
        };
        /** RealtimeStreamEvent */
        RealtimeStreamEvent:
            | components["schemas"]["ConnectedEvent"]
            | components["schemas"]["PingEvent"]
            | components["schemas"]["APIKeyEvent"];
        /** RefreshResponse */
        RefreshResponse: {
            /** Access Token */
            access_token: string;
            /** Refresh Token */
            refresh_token: string;
            /**
             * Token Type
             * @default bearer
             */
            token_type: string;
        };
        /** ResendVerificationForm */
        ResendVerificationForm: {
            /** Email */
            email: string;
        };
        /** ResendVerificationResponse */
        ResendVerificationResponse: {
            /** Message */
            message: string;
        };
        /** ResetPasswordForm */
        ResetPasswordForm: {
            /** Password */
            password: string;
            /** Token */
            token: string;
        };
        /** ResetPasswordResponse */
        ResetPasswordResponse: {
            /** Message */
            message: string;
        };
        /** SignupForm */
        SignupForm: {
            /** Email */
            email: string;
            /** Name */
            name: string;
            /** Password */
            password: string;
        };
        /** StartupCheck */
        StartupCheck: {
            /** Checked At */
            checked_at?: string | null;
            /**
             * Status
             * @enum {string}
             */
            status: "ok" | "configured" | "disabled" | "unverified";
        };
        /** UpdateProfileForm */
        UpdateProfileForm: {
            keyboard_shortcuts?: components["schemas"]["KeyboardShortcuts"] | null;
            /** Name */
            name?: string | null;
            /**
             * Profile Image Url
             * @deprecated
             * @description Use PUT/DELETE /auth/me/photo; legacy PATCH photo writes are rejected.
             */
            profile_image_url?: string | null;
        };
        /** UserResponse */
        UserResponse: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Email */
            email: string;
            /** Id */
            id: number;
            /** Is Verified */
            is_verified: boolean;
            keyboard_shortcuts?: components["schemas"]["KeyboardShortcuts"] | null;
            /** Name */
            name: string;
            /** Oauth Providers */
            oauth_providers?: string[];
            /** Profile Image Url */
            profile_image_url?: string | null;
            role: components["schemas"]["UserRole"];
        };
        /**
         * UserRole
         * @enum {string}
         */
        UserRole: "user" | "admin" | "manager";
        /** UserRoleStatsResponse */
        UserRoleStatsResponse: {
            /** Active Users */
            active_users: number;
            /** Admin Users */
            admin_users: number;
            /**
             * Manager Users
             * @default 0
             */
            manager_users: number;
            /** Total Users */
            total_users: number;
        };
        /** ValidationError */
        ValidationError: {
            /** Context */
            ctx?: Record<string, never>;
            /** Input */
            input?: unknown;
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
        };
        /** VerifyEmailForm */
        VerifyEmailForm: {
            /** Token */
            token: string;
        };
        /** VerifyEmailResponse */
        VerifyEmailResponse: {
            /** Message */
            message: string;
            user: components["schemas"]["UserResponse"];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    status_api_v1_admin_status_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminStatusResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "USER_NOT_FOUND",
                     *         "message": "User not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "ADMIN_STATUS_FAILED",
                     *         "message": "Unable to inspect server status."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AdminErrorResponse"];
                };
            };
        };
    };
    list_api_keys_api_v1_api_keys_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["APIKeysResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "USER_NOT_FOUND",
                     *         "message": "User not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    create_api_key_api_v1_api_keys_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["APIKeyCreateForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["APIKeyCreateResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "USER_NOT_FOUND",
                     *         "message": "User not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "API_KEY_NAME_ALREADY_EXISTS",
                     *         "message": "API key name already exists."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "API_KEY_CREATE_FAILED",
                     *         "message": "Failed to create API key."
                     *       }
                     *     }
                     */
                    "application/json":
                        | components["schemas"]["APIKeyErrorResponse"]
                        | components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    delete_api_key_api_v1_api_keys__api_key_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                api_key_id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["APIKeyResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    update_api_key_status_api_v1_api_keys__api_key_id__status_patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                api_key_id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["APIKeyStatusUpdateForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["APIKeyResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "API_KEY_UPDATE_FAILED",
                     *         "message": "Failed to update API key state."
                     *       }
                     *     }
                     */
                    "application/json":
                        | components["schemas"]["APIKeyErrorResponse"]
                        | components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    admin_user_role_stats_api_v1_auth_admin_user_role_stats_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserRoleStatsResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "USER_NOT_FOUND",
                     *         "message": "User not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    admin_users_api_v1_auth_admin_users_get: {
        parameters: {
            query?: {
                page?: number;
                page_size?: number;
                search?: string;
                role?: components["schemas"]["UserRole"] | null;
                is_active?: boolean | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminUserListResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "USER_NOT_FOUND",
                     *         "message": "User not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "ADMIN_USERS_FAILED",
                     *         "message": "Failed to load the user directory."
                     *       }
                     *     }
                     */
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    forgot_password_api_v1_auth_forgot_password_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ForgotPasswordForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ForgotPasswordResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "LOGIN_DISABLED",
                     *         "message": "Login is currently disabled."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    login_api_v1_auth_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description Two separate Set-Cookie headers: template_refresh_token and template_refresh_sid; HttpOnly, Path=/; HTTPS uses Secure and SameSite=None, HTTP uses SameSite=Lax. Persistent expiry is set only with remember_me=true. */
                    "Set-Cookie"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "INVALID_CREDENTIALS",
                     *         "message": "Incorrect email or password."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "LOGIN_DISABLED",
                     *         "message": "Login is currently disabled."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Locked */
            423: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "details": {
                     *           "remaining_seconds": 120
                     *         },
                     *         "error": "ACCOUNT_LOCKED",
                     *         "message": "Account is temporarily locked."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    logout_api_v1_auth_logout_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description Separate expiry headers for template_refresh_token and template_refresh_sid at Path=/. */
                    "Set-Cookie"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: string;
                    };
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "USER_NOT_FOUND",
                     *         "message": "User not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    me_api_v1_auth_me_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "USER_NOT_FOUND",
                     *         "message": "User not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    delete_me_api_v1_auth_me_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeleteAccountForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "ACCOUNT_DELETE_CODE_INVALID",
                     *         "message": "The deletion code is invalid, expired or locked. Request a new code after the cooldown."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "INVALID_TOKEN",
                     *         "message": "Invalid refresh token."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "INSUFFICIENT_ROLE",
                     *         "message": "User does not have enough permissions."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "USER_NOT_FOUND",
                     *         "message": "User not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "ACCOUNT_BILLING_REVIEW_REQUIRED",
                     *         "message": "Contact the operator to reconcile subscriptions before deleting this account."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "ACCOUNT_DELETE_FAILED",
                     *         "message": "Failed to delete account."
                     *       }
                     *     }
                     */
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    update_me_api_v1_auth_me_patch: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProfileForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "USER_NOT_FOUND",
                     *         "message": "User not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_UPDATE_FAILED",
                     *         "message": "Failed to update profile."
                     *       }
                     *     }
                     */
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    request_deletion_code_api_v1_auth_me_deletion_code_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeleteAccountCodeResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "INVALID_TOKEN",
                     *         "message": "Invalid refresh token."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "INSUFFICIENT_ROLE",
                     *         "message": "User does not have enough permissions."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "USER_NOT_FOUND",
                     *         "message": "User not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "ACCOUNT_DELETE_CODE_THROTTLED",
                     *         "message": "Wait before requesting another deletion code."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "ACCOUNT_DELETE_CODE_SEND_FAILED",
                     *         "message": "Unable to queue the deletion code. Try again later."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
        };
    };
    read_profile_photo_api_v1_auth_me_photo_get: {
        parameters: {
            query?: {
                version?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/webp": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_PHOTO_CONFLICT",
                     *         "message": "Profile image changed; refresh and try again."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_PHOTO_TOO_LARGE",
                     *         "message": "Profile image exceeds the upload limit."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_PHOTO_INVALID",
                     *         "message": "Invalid profile image."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_UPDATE_FAILED",
                     *         "message": "Failed to update profile."
                     *       }
                     *     }
                     */
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_PHOTO_UNAVAILABLE",
                     *         "message": "Profile image storage is unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
        };
    };
    upload_profile_photo_api_v1_auth_me_photo_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/octet-stream": string;
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_PHOTO_CONFLICT",
                     *         "message": "Profile image changed; refresh and try again."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_PHOTO_TOO_LARGE",
                     *         "message": "Profile image exceeds the upload limit."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_PHOTO_INVALID",
                     *         "message": "Invalid profile image."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_UPDATE_FAILED",
                     *         "message": "Failed to update profile."
                     *       }
                     *     }
                     */
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_PHOTO_UNAVAILABLE",
                     *         "message": "Profile image storage is unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
        };
    };
    delete_profile_photo_api_v1_auth_me_photo_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_PHOTO_CONFLICT",
                     *         "message": "Profile image changed; refresh and try again."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Content Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_PHOTO_TOO_LARGE",
                     *         "message": "Profile image exceeds the upload limit."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_PHOTO_INVALID",
                     *         "message": "Invalid profile image."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_UPDATE_FAILED",
                     *         "message": "Failed to update profile."
                     *       }
                     *     }
                     */
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "PROFILE_PHOTO_UNAVAILABLE",
                     *         "message": "Profile image storage is unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
        };
    };
    oauth_providers_api_v1_auth_oauth_providers_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OAuthProvidersResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "OAUTH_PROVIDER_NOT_ENABLED",
                     *         "message": "The requested OAuth provider is not enabled."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "LOGIN_DISABLED",
                     *         "message": "Login is currently disabled."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "OAUTH_PROVIDER_CONFIG_INVALID",
                     *         "message": "OAuth provider configuration is invalid."
                     *       }
                     *     }
                     */
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    oauth_callback_api_v1_auth_oauth__provider__callback_get: {
        parameters: {
            query?: {
                code?: string | null;
                state?: string | null;
                error?: string | null;
            };
            header?: never;
            path: {
                provider: components["schemas"]["OAuthProvider"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success redirects to the frontend and sets refresh cookies. Provider/domain failures redirect to the frontend failure path with error query parameters. */
            307: {
                headers: {
                    /** @description Redirect destination */
                    Location?: string;
                    /** @description Two separate Set-Cookie headers: template_refresh_token and template_refresh_sid; HttpOnly, Path=/; HTTPS uses Secure and SameSite=None, HTTP uses SameSite=Lax. Persistent expiry is set only with remember_me=true. */
                    "Set-Cookie"?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    oauth_start_api_v1_auth_oauth__provider__start_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                provider: components["schemas"]["OAuthProvider"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            307: {
                headers: {
                    /** @description Redirect destination */
                    Location?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "OAUTH_PROVIDER_NOT_ENABLED",
                     *         "message": "The requested OAuth provider is not enabled."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "LOGIN_DISABLED",
                     *         "message": "Login is currently disabled."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "OAUTH_PROVIDER_CONFIG_INVALID",
                     *         "message": "OAuth provider configuration is invalid."
                     *       }
                     *     }
                     */
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    refresh_token_api_v1_auth_refresh_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: {
                template_refresh_token?: string;
                template_refresh_sid?: string;
            };
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Body_refresh_token_api_v1_auth_refresh_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    /** @description Two separate Set-Cookie headers: template_refresh_token and template_refresh_sid; HttpOnly, Path=/; HTTPS uses Secure and SameSite=None, HTTP uses SameSite=Lax. Persistent expiry is set only with remember_me=true. */
                    "Set-Cookie"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RefreshResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "INVALID_TOKEN",
                     *         "message": "Invalid refresh token."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "LOGIN_DISABLED",
                     *         "message": "Login is currently disabled."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "USER_NOT_FOUND",
                     *         "message": "User not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    resend_verification_email_api_v1_auth_resend_verification_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResendVerificationForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResendVerificationResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "LOGIN_DISABLED",
                     *         "message": "Login is currently disabled."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    reset_password_api_v1_auth_reset_password_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetPasswordForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResetPasswordResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "INVALID_TOKEN",
                     *         "message": "Invalid refresh token."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "LOGIN_DISABLED",
                     *         "message": "Login is currently disabled."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "USER_NOT_FOUND",
                     *         "message": "User not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    signup_api_v1_auth_signup_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SignupForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "LOGIN_DISABLED",
                     *         "message": "Login is currently disabled."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "EMAIL_ALREADY_EXISTS",
                     *         "message": "User with this email already exists."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Internal Server Error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "SIGNUP_FAILED",
                     *         "message": "Failed to create the user account."
                     *       }
                     *     }
                     */
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    oauth_token_login_api_v1_auth_token_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/x-www-form-urlencoded": components["schemas"]["Body_oauth_token_login_api_v1_auth_token_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "INVALID_CREDENTIALS",
                     *         "message": "Incorrect email or password."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "LOGIN_DISABLED",
                     *         "message": "Login is currently disabled."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Locked */
            423: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "details": {
                     *           "remaining_seconds": 120
                     *         },
                     *         "error": "ACCOUNT_LOCKED",
                     *         "message": "Account is temporarily locked."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    verify_email_api_v1_auth_verify_email_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyEmailForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VerifyEmailResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "INVALID_TOKEN",
                     *         "message": "Invalid refresh token."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "LOGIN_DISABLED",
                     *         "message": "Login is currently disabled."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "USER_NOT_FOUND",
                     *         "message": "User not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    create_card_setup_api_v1_billing_card_setups_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BillingSetupForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingCardSetupResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    card_setup_status_api_v1_billing_card_setups__intent_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                intent_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingCardSetupStatus"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    create_checkout_api_v1_billing_checkout_sessions_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BillingCheckoutForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingSetupResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    checkout_status_api_v1_billing_checkout_sessions__session_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingCheckoutStatusResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    billing_config_api_v1_billing_config_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingConfigResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    billing_invoices_api_v1_billing_invoices_get: {
        parameters: {
            query?: {
                limit?: number;
                starting_after?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingInvoicesResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    invoice_detail_api_v1_billing_invoices__invoice_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                invoice_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingInvoiceDetail"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    list_payment_methods_api_v1_billing_payment_methods_get: {
        parameters: {
            query?: {
                method_type?: "card" | "link";
                limit?: number;
                starting_after?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingPaymentMethodsResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    manage_billing_method_api_v1_billing_payment_methods__method_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                method_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BillingMethodForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingProfileResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    plans_api_v1_billing_plans_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingPlansResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    billing_portal_api_v1_billing_portal_sessions_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BillingPortalForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingSetupResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    billing_profile_api_v1_billing_profile_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingProfileResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    update_billing_profile_api_v1_billing_profile_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BillingProfileForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingProfileResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    create_setup_api_v1_billing_setup_sessions_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BillingSetupForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingSetupResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    setup_status_api_v1_billing_setup_sessions__session_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingSetupStatusResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    subscription_api_v1_billing_subscription_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingSubscriptionResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    change_subscription_api_v1_billing_subscription_change_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BillingChangeForm"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingSubscriptionResponse"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    billing_webhook_api_v1_billing_webhook_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: string;
                    };
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_INVALID",
                     *         "message": "Invalid billing webhook."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_NOT_FOUND",
                     *         "message": "Billing resource not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_CHECKOUT_CONFLICT",
                     *         "message": "An existing subscription or another checkout requires attention."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_UNAVAILABLE",
                     *         "message": "Payment provider is temporarily unavailable."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "BILLING_WEBHOOK_UNAVAILABLE",
                     *         "message": "Billing webhook is not configured."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["BillingErrorResponse"];
                };
            };
        };
    };
    stream_events_api_v1_events_stream_get: {
        parameters: {
            query?: never;
            header?: {
                /** @description Accepted for diagnostics only; events are not replayed. */
                "last-event-id"?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description SSE frames; each data field contains a RealtimeStreamEvent JSON value. No replay is provided; re-fetch affected resources after reconnecting. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/event-stream": string;
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json":
                        | components["schemas"]["AuthErrorResponse"]
                        | components["schemas"]["APIKeyErrorResponse"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "detail": {
                     *         "error": "USER_NOT_FOUND",
                     *         "message": "User not found."
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["AuthErrorResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    config_config_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppConfigResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    health_live_health_live_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthCheckResult"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
    health_ready_health_ready_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReadinessResponse"];
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
            /** @description One or more required dependencies are unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReadinessResponse"];
                };
            };
        };
    };
    ping_ping_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Unexpected server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalErrorResponse"];
                };
            };
        };
    };
}
