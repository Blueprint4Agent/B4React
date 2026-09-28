import { useEffect, useMemo } from "react";
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
} from "../../components/ui";
import { useAuthContext } from "../../hooks/useAuth";
import { useAdminUsers, type AdminUserQuery } from "../../hooks/api/auth/useAdminUsers";
import { AdminUserTable } from "../../components/features/admin/AdminUserTable";
import { useCollectionQuery } from "../../hooks/collections/useCollectionQuery";
import { getPagination, MAX_SEARCH_LENGTH } from "../../utils/collections";
import { LoadingPage } from "../main/LoadingPage";

export function AdminPage() {
    const { user, loading } = useAuthContext();
    if (loading) return <LoadingPage />;
    if (user?.role !== "admin") return <Navigate to="/show-case" replace />;
    return <AdminUsers ownerId={user.id} />;
}

function AdminUsers({ ownerId }: { ownerId: number }) {
    const { t, i18n } = useTranslation();
    const { input, setInput, search, filters, setFilters, page, setPage, pageSize, submitSearch } =
        useCollectionQuery({ initialFilters: { role: "all", status: "all" }, pageSize: 10 });
    const { role, status } = filters;
    const query = useMemo<AdminUserQuery>(
        () => ({
            page,
            page_size: pageSize,
            search,
            role: role === "admin" || role === "user" ? role : undefined,
            is_active: status === "all" ? undefined : status === "active",
        }),
        [page, pageSize, search, role, status],
    );
    const { data, error, loading, available, reload } = useAdminUsers(ownerId, query);
    const totalPages = data
        ? getPagination(data.total, pageSize, page).totalPages
        : Math.max(1, page);
    useEffect(() => {
        if (data && page > totalPages) setPage(totalPages);
    }, [data, page, totalPages, setPage]);
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
                        submitSearch();
                    }}
                >
                    <InputField
                        label={t("admin.search")}
                        value={input}
                        onValueChange={setInput}
                        maxLength={MAX_SEARCH_LENGTH}
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
                            setFilters({ ...filters, role: value });
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
                            setFilters({ ...filters, status: value });
                        }}
                    />
                    <Button type="button" disabled={!available || loading} onClick={reload}>
                        <RefreshCw aria-hidden="true" />
                        {t("admin.refresh")}
                    </Button>
                </form>
                {error ? <InlineMessage>{error}</InlineMessage> : null}
                <AdminUserTable items={data?.items} loading={loading} hasError={Boolean(error)} />
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
