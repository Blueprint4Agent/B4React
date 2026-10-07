import { Database, MemoryStick, RefreshCw } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Button,
    InlineMessage,
    PrimaryCard,
    StatusBadge,
    Spinner,
    PanelCard,
    CodeBadge,
} from "../../components/ui";
import { useAuthContext } from "../../hooks/useAuth";
import { useAdminStatus } from "../../hooks/api/admin/useAdminStatus";
import { OAuthProviderIcon } from "../../components/features/auth/OAuthProviderIcon";
import { LoadingPage } from "../main/LoadingPage";

export function AdminServerPage() {
    const { user, loading } = useAuthContext();
    if (loading) return <LoadingPage />;
    if (user?.role !== "admin") return <Navigate to="/home" replace />;
    return <ServerStatus key={user.id} owner={user.id} />;
}

function ServerStatus({ owner }: { owner: number }) {
    const { t, i18n } = useTranslation();
    const { data, loading, failed, stale, available, reload } = useAdminStatus(owner);
    const env = data?.environment;
    const rows = env
        ? ([
              ["app", "APP_MODE", env.app_mode],
              ["email", "EMAIL_ENABLED", env.email_enabled],
              ["login", "LOGIN_ENABLED", env.login_enabled],
              ["oauth", "OAUTH_ENABLED", env.oauth_enabled],
              [
                  "billing",
                  "STRIPE_ENABLED",
                  env.billing_enabled ? true : env.billing_configured ? "incomplete" : "disabled",
              ],
              ["admin", "", "admin_only"],
              ["developer", "APP_MODE", env.developer_enabled],
              ["cache", "REDIS_IN_MEMORY", env.redis_in_memory ? "memory" : "redis"],
          ] as const)
        : [];
    return (
        <section className="settings-layout">
            <PrimaryCard className="settings-content-card">
                <header className="settings-content-card__header main-page-template__header">
                    <div className="main-page-template__intro">
                        <div className="server-status-title">
                            <h1>{t("serverStatus.title")}</h1>
                            <span className="server-status-checked">
                                {data
                                    ? t("serverStatus.checked", {
                                          time: new Date(data.checked_at).toLocaleTimeString(
                                              i18n.language,
                                          ),
                                      })
                                    : null}
                            </span>
                        </div>
                        <p>{t("serverStatus.description")}</p>
                    </div>
                    <Button onClick={reload} disabled={loading || !available}>
                        {t("admin.refresh")}
                        {loading ? (
                            <Spinner size="sm" label={t("serverStatus.loading")} hideLabel />
                        ) : (
                            <RefreshCw aria-hidden="true" />
                        )}
                    </Button>
                </header>
                <div className="server-status-content" aria-busy={loading}>
                    <div className="server-status-meta" role="status">
                        <div className="server-status-overview">
                            <span>{t("serverStatus.overall")}</span>
                            {loading && !data ? (
                                <Spinner size="sm" label={t("serverStatus.loading")} hideLabel />
                            ) : (
                                <StatusBadge
                                    tone={
                                        stale || !data
                                            ? "inactive"
                                            : data.status === "ok"
                                              ? "active"
                                              : "danger"
                                    }
                                >
                                    <span
                                        className={`server-status-dot server-status-dot--${stale || !data ? "stale" : data.status === "ok" ? "ok" : "failed"}`}
                                        aria-hidden="true"
                                    />
                                    {t(
                                        `serverStatus.${stale ? "stale" : data ? data.status : loading ? "loading" : "unavailable"}`,
                                    )}
                                </StatusBadge>
                            )}
                        </div>
                    </div>
                    {failed || !available ? (
                        <InlineMessage>{t("serverStatus.loadError")}</InlineMessage>
                    ) : null}
                    <div className="server-status-connections">
                        {data?.connections.map((connection) => (
                            <div
                                className="settings-row server-status-connection"
                                key={connection.id}
                            >
                                <span className="server-stack-icon" aria-hidden="true">
                                    {connection.technology === "memory" ? (
                                        <MemoryStick />
                                    ) : connection.technology === "database" ? (
                                        <Database />
                                    ) : (
                                        <img
                                            src={`/stack-brands/${connection.technology}.svg`}
                                            alt=""
                                        />
                                    )}
                                </span>
                                <div className="server-status-copy">
                                    <h2>{t(`serverStatus.technology.${connection.technology}`)}</h2>
                                    <div className="server-connection-description">
                                        <p>{t(`serverStatus.connection.${connection.id}`)}</p>
                                        {connection.id === "database" ||
                                        connection.technology === "redis" ? (
                                            <CodeBadge className="server-connection-address">
                                                {connection.host
                                                    ? `${connection.host.includes(":") ? `[${connection.host}]` : connection.host}${connection.port ? `:${connection.port}` : ""}`
                                                    : t(
                                                          connection.technology === "sqlite"
                                                              ? "serverStatus.localFile"
                                                              : "serverStatus.localSocket",
                                                      )}
                                            </CodeBadge>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="server-status-result">
                                    <span
                                        className="server-status-latency"
                                        aria-label={t("serverStatus.latency")}
                                    >
                                        <small>{t("serverStatus.latency")}</small>
                                        <span>
                                            {connection.latency_ms !== null && !stale
                                                ? `${connection.latency_ms} ms`
                                                : "—"}
                                        </span>
                                    </span>
                                    <StatusBadge
                                        tone={
                                            stale
                                                ? "inactive"
                                                : connection.status === "ok"
                                                  ? "active"
                                                  : "danger"
                                        }
                                    >
                                        <span
                                            className={`server-status-dot server-status-dot--${stale ? "stale" : connection.status}`}
                                            aria-hidden="true"
                                        />
                                        {t(`serverStatus.${stale ? "stale" : connection.status}`)}
                                    </StatusBadge>
                                </div>
                            </div>
                        ))}
                    </div>
                    {env ? (
                        <section className="server-environment" aria-labelledby="environment-title">
                            <header>
                                <h2 id="environment-title">{t("serverStatus.environment")}</h2>
                                <p>{t("serverStatus.environmentNote")}</p>
                            </header>
                            <PanelCard className="server-environment-panel">
                                <dl className="server-environment-list">
                                    {rows.map(([id, variable, value]) => (
                                        <div className="server-environment-row" key={id}>
                                            <dt>
                                                <div className="server-environment-name">
                                                    <strong>
                                                        {t(`serverStatus.feature.${id}`)}
                                                    </strong>
                                                    {id === "oauth" &&
                                                    env.oauth_providers.length > 0 ? (
                                                        <ul
                                                            className="server-oauth-providers"
                                                            aria-label={t(
                                                                "serverStatus.feature.oauth",
                                                            )}
                                                        >
                                                            {env.oauth_providers.map((provider) => (
                                                                <li key={provider}>
                                                                    {provider === "google" ||
                                                                    provider === "github" ? (
                                                                        <OAuthProviderIcon
                                                                            provider={provider}
                                                                        />
                                                                    ) : null}
                                                                    <span>
                                                                        {provider === "google"
                                                                            ? "Google"
                                                                            : provider === "github"
                                                                              ? "GitHub"
                                                                              : provider}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : null}
                                                </div>
                                                {variable ? (
                                                    <small>
                                                        <CodeBadge>{variable}</CodeBadge>
                                                    </small>
                                                ) : (
                                                    <small>{t("serverStatus.accessPolicy")}</small>
                                                )}
                                            </dt>
                                            <dd>
                                                <span className="server-environment-value">
                                                    {t(
                                                        `serverStatus.mode.${typeof value === "boolean" ? (value ? "enabled" : "disabled") : value}`,
                                                    )}
                                                    {variable && data?.environment_values ? (
                                                        <CodeBadge>
                                                            {String(
                                                                data.environment_values[variable],
                                                            )}
                                                        </CodeBadge>
                                                    ) : null}
                                                </span>
                                                {data?.integration_checks?.[id] ? (
                                                    <span
                                                        className="server-integration-check"
                                                        title={t("serverStatus.checked", {
                                                            time: new Date(
                                                                data.integration_checks[id]
                                                                    .checked_at,
                                                            ).toLocaleTimeString(i18n.language),
                                                        })}
                                                    >
                                                        <StatusBadge
                                                            tone={
                                                                stale ||
                                                                data.integration_checks[id]
                                                                    .status === "disabled"
                                                                    ? "inactive"
                                                                    : data.integration_checks[id]
                                                                            .status === "ok"
                                                                      ? "active"
                                                                      : "danger"
                                                            }
                                                        >
                                                            <span
                                                                className={`server-status-dot server-status-dot--${stale ? "stale" : data.integration_checks[id].status}`}
                                                                aria-hidden="true"
                                                            />
                                                            {t(
                                                                `serverStatus.${stale ? "stale" : data.integration_checks[id].status === "disabled" ? "mode.disabled" : data.integration_checks[id].status}`,
                                                            )}
                                                        </StatusBadge>
                                                    </span>
                                                ) : null}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </PanelCard>
                        </section>
                    ) : null}
                    <p className="server-status-note">{t("serverStatus.refreshNote")}</p>
                </div>
            </PrimaryCard>
        </section>
    );
}
