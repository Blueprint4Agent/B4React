import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "../../ui";
import type { AdminUserList } from "../../../hooks/api/auth/useAdminUsers";

type AdminUserTableProps = {
    items: AdminUserList["items"] | undefined;
    loading: boolean;
    hasError: boolean;
};

export const AdminUserTable = memo(function AdminUserTable({
    items,
    loading,
    hasError,
}: AdminUserTableProps) {
    const { t, i18n } = useTranslation();
    const formatter = useMemo(
        () =>
            new Intl.DateTimeFormat(i18n.language, {
                dateStyle: "medium",
                timeStyle: "short",
            }),
        [i18n.language],
    );
    const date = (value: string | null): string =>
        value ? formatter.format(new Date(value)) : t("admin.never");
    return (
        <div
            className="admin-table-region"
            role="region"
            aria-label={t("admin.users")}
            tabIndex={0}
            aria-busy={loading}
        >
            <table className="admin-table">
                <caption className="sr-only">{t("admin.users")}</caption>
                <thead>
                    <tr>
                        {["identity", "role", "status", "providers", "joined", "lastLogin"].map(
                            (column) => (
                                <th key={column} scope="col">
                                    {t(`admin.${column}`)}
                                </th>
                            ),
                        )}
                    </tr>
                </thead>
                <tbody>
                    {items?.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <strong>{item.name}</strong>
                                <span>{item.email}</span>
                                <small>
                                    {t(item.is_verified ? "admin.verified" : "admin.unverified")}
                                </small>
                            </td>
                            <td>
                                <StatusBadge tone={item.role === "admin" ? "info" : "inactive"}>
                                    {t(`admin.${item.role}`)}
                                </StatusBadge>
                            </td>
                            <td>
                                <StatusBadge tone={item.is_active ? "active" : "inactive"}>
                                    {t(item.is_active ? "admin.active" : "admin.inactive")}
                                </StatusBadge>
                            </td>
                            <td>
                                {item.login_providers
                                    .map((provider) =>
                                        provider === "bootstrap"
                                            ? t("admin.bootstrap")
                                            : ["email", "google", "github"].includes(provider)
                                              ? t(`recentAccounts.providers.${provider}`)
                                              : provider,
                                    )
                                    .join(", ") || "—"}
                            </td>
                            <td>{date(item.created_at)}</td>
                            <td>{date(item.last_login_at)}</td>
                        </tr>
                    ))}
                    {!items?.length ? (
                        <tr>
                            <td colSpan={6} className="admin-table-empty">
                                {loading
                                    ? t("admin.loading")
                                    : hasError
                                      ? t("admin.loadError")
                                      : t("admin.empty")}
                            </td>
                        </tr>
                    ) : null}
                    {items?.length
                        ? Array.from({ length: Math.max(0, 10 - items.length) }, (_, index) => (
                              <tr key={`empty-${index}`} aria-hidden="true">
                                  <td colSpan={6}>&nbsp;</td>
                              </tr>
                          ))
                        : null}
                </tbody>
            </table>
        </div>
    );
});
