import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { RefreshCw, Shield } from "lucide-react";
import {
    Button,
    DropdownMenu,
    InlineMessage,
    InputField,
    Pagination,
    PrimaryCard,
    StatusBadge,
} from "../../components/ui";
import { useAuthContext } from "../../hooks/useAuth";
import { useAdminUsers, type AdminUserQuery } from "../../hooks/api/auth/useAdminUsers";
import { LoadingPage } from "../main/LoadingPage";

export function AdminPage() {
    const { user, loading } = useAuthContext();
    if (loading) return <LoadingPage />;
    if (user?.role !== "admin") return <Navigate to="/show-case" replace />;
    return <AdminUsers ownerId={user.id} />;
}

function AdminUsers({ ownerId }: { ownerId: number }) {
    const { t, i18n } = useTranslation();
    const [input, setInput] = useState("");
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("all");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const query = useMemo<AdminUserQuery>(
        () => ({
            page,
            page_size: 10,
            search,
            role: role === "admin" || role === "user" ? role : undefined,
            is_active: status === "all" ? undefined : status === "active",
        }),
        [page, search, role, status],
    );
    const { data, error, loading, available, reload } = useAdminUsers(ownerId, query);
    const date = (value: string | null): string =>
        value
            ? new Intl.DateTimeFormat(i18n.language, {
                  dateStyle: "medium",
                  timeStyle: "short",
              }).format(new Date(value))
            : t("admin.never");
    const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 10));
    useEffect(() => {
        if (data && page > totalPages) setPage(totalPages);
    }, [data, page, totalPages]);
    return (
        <section className="settings-layout admin-layout">
            <PrimaryCard className="settings-content-card admin-content">
                <header className="settings-content-card__header">
                    <h1>
                        <Shield className="settings-content-card__title-icon" aria-hidden="true" />
                        {t("admin.title")}
                    </h1>
                    <p>{t("admin.description")}</p>
                </header>
                <dl className="admin-summary">
                    {(
                        [
                            ["total", data?.summary.total_users],
                            ["activeTotal", data?.summary.active_users],
                            ["adminTotal", data?.summary.admin_users],
                        ] as const
                    ).map(([label, value]) => (
                        <div key={label}>
                            <dt>{t(`admin.${label}`)}</dt>
                            <dd>{value?.toLocaleString(i18n.language) ?? "—"}</dd>
                        </div>
                    ))}
                </dl>
                <form
                    className="admin-filters"
                    onSubmit={(event) => {
                        event.preventDefault();
                        setPage(1);
                        setSearch(input.trim());
                    }}
                >
                    <InputField
                        label={t("admin.search")}
                        value={input}
                        onValueChange={setInput}
                        maxLength={200}
                        type="search"
                    />
                    <Button type="submit" disabled={!available}>
                        {t("admin.searchAction")}
                    </Button>
                    <DropdownMenu
                        label={t("admin.filterRole")}
                        triggerLabel={t(role === "all" ? "admin.allRoles" : `admin.${role}`)}
                        items={["all", "admin", "user"].map((id) => ({
                            id,
                            label: t(id === "all" ? "admin.allRoles" : `admin.${id}`),
                        }))}
                        onSelect={(value) => {
                            setRole(value);
                            setPage(1);
                        }}
                    />
                    <DropdownMenu
                        label={t("admin.filterStatus")}
                        triggerLabel={t(status === "all" ? "admin.allStatuses" : `admin.${status}`)}
                        items={["all", "active", "inactive"].map((id) => ({
                            id,
                            label: t(id === "all" ? "admin.allStatuses" : `admin.${id}`),
                        }))}
                        onSelect={(value) => {
                            setStatus(value);
                            setPage(1);
                        }}
                    />
                    <Button type="button" disabled={!available || loading} onClick={reload}>
                        <RefreshCw aria-hidden="true" />
                        {t("admin.refresh")}
                    </Button>
                </form>
                {error ? <InlineMessage>{error}</InlineMessage> : null}
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
                                {[
                                    "identity",
                                    "role",
                                    "status",
                                    "providers",
                                    "joined",
                                    "lastLogin",
                                ].map((column) => (
                                    <th key={column} scope="col">
                                        {t(`admin.${column}`)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data?.items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.name}</strong>
                                        <span>{item.email}</span>
                                        <small>
                                            {t(
                                                item.is_verified
                                                    ? "admin.verified"
                                                    : "admin.unverified",
                                            )}
                                        </small>
                                    </td>
                                    <td>
                                        <StatusBadge
                                            tone={item.role === "admin" ? "info" : "inactive"}
                                        >
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
                                                    : ["email", "google", "github"].includes(
                                                            provider,
                                                        )
                                                      ? t(`recentAccounts.providers.${provider}`)
                                                      : provider,
                                            )
                                            .join(", ") || "—"}
                                    </td>
                                    <td>{date(item.created_at)}</td>
                                    <td>{date(item.last_login_at)}</td>
                                </tr>
                            ))}
                            {!data?.items.length ? (
                                <tr>
                                    <td colSpan={6} className="admin-table-empty">
                                        {loading
                                            ? t("admin.loading")
                                            : error
                                              ? t("admin.loadError")
                                              : t("admin.empty")}
                                    </td>
                                </tr>
                            ) : null}
                            {data?.items.length
                                ? Array.from(
                                      { length: Math.max(0, 10 - data.items.length) },
                                      (_, index) => (
                                          <tr key={`empty-${index}`} aria-hidden="true">
                                              <td colSpan={6}>&nbsp;</td>
                                          </tr>
                                      ),
                                  )
                                : null}
                        </tbody>
                    </table>
                </div>
                <footer className="admin-footer">
                    <span aria-live="polite">
                        {loading
                            ? t("admin.loading")
                            : t("admin.count", { count: data?.total ?? 0 })}
                    </span>
                    <Pagination
                        currentPage={data ? Math.min(page, totalPages) : page}
                        totalPages={data ? totalPages : Math.max(1, page)}
                        ariaLabel={t("admin.pagination")}
                        previousLabel={t("admin.previous")}
                        nextLabel={t("admin.next")}
                        onPageChange={setPage}
                    />
                </footer>
                <p className="admin-note">
                    {t("admin.readOnly")} {t("admin.timezone")}
                </p>
            </PrimaryCard>
        </section>
    );
}
