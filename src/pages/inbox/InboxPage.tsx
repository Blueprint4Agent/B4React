import { memo, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../../hooks/useAuth";
import { useInbox, type InboxItem } from "../../hooks/api/inbox/useInbox";
import {
    FormCheckbox,
    Button,
    InlineMessage,
    Pagination,
    PrimaryCard,
    Spinner,
    StatusBadge,
} from "../../components/ui";
import { LoadingPage } from "../main/LoadingPage";
const InboxRow = memo(function InboxRow({
    item,
    busy,
    onRead,
}: {
    item: InboxItem;
    busy: boolean;
    onRead: (id: number) => Promise<void>;
}) {
    const { t, i18n } = useTranslation();
    const safePath =
        item.action_path?.startsWith("/") &&
        !item.action_path.startsWith("//") &&
        !item.action_path.includes("\\")
            ? item.action_path
            : null;
    return (
        <li className="settings-row inbox-row">
            <div className="inbox-row__copy">
                <h2>{t(`inbox.events.${item.kind}.title`, { defaultValue: item.title })}</h2>
                <p>
                    {t(`inbox.events.${item.kind}.body`, {
                        defaultValue: item.body,
                        plan: item.body,
                    })}
                </p>
                <time dateTime={item.created_at}>
                    {new Date(item.created_at).toLocaleString(i18n.language)}
                </time>
            </div>
            <div className="inbox-row__actions">
                {!item.read_at && <StatusBadge tone="info">{t("inbox.unread")}</StatusBadge>}
                {safePath && <Link to={safePath}>{t("inbox.open")}</Link>}
                {!item.read_at && (
                    <Button
                        disabled={busy}
                        onClick={() => {
                            void onRead(item.id);
                        }}
                    >
                        {t("inbox.read")}
                    </Button>
                )}
            </div>
        </li>
    );
});
export function InboxPage() {
    const { user, loading } = useAuthContext();
    if (loading) return <LoadingPage />;
    if (!user) return <Navigate to="/login" replace />;
    return <InboxContent key={user.id} owner={user.id} />;
}
function InboxContent({ owner }: { owner: number }) {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [unread, setUnread] = useState(false);
    const { data, loading, error, busy, available, markRead, reload } = useInbox(
        owner,
        page,
        unread,
    );
    const pages = Math.max(1, Math.ceil((data?.total ?? 0) / 20));
    useEffect(() => {
        if (data && page > pages) setPage(pages);
    }, [data, page, pages]);
    return (
        <section className="settings-layout">
            <PrimaryCard className="settings-content-card">
                <header className="settings-content-card__header">
                    <h1>{t("inbox.title")}</h1>
                    <p>{t("inbox.description")}</p>
                </header>
                <div className="inbox-toolbar">
                    <div className="inbox-row__actions">
                        <FormCheckbox
                            checked={unread}
                            label={t("inbox.unreadOnly")}
                            onCheckedChange={(value) => {
                                setUnread(value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <span>{t("inbox.count", { count: data?.summary.unread_count ?? 0 })}</span>
                    <Button disabled={!available || loading} onClick={reload}>
                        {t("admin.refresh")}
                    </Button>
                    <Button
                        disabled={!available || busy || !data?.summary.unread_count}
                        onClick={() => {
                            void markRead(data?.summary.latest_id ?? 0, true);
                        }}
                    >
                        {t("inbox.readAll")}
                    </Button>
                </div>
                {error && <InlineMessage>{t("inbox.error")}</InlineMessage>}
                {loading && !data ? (
                    <div className="inbox-state">
                        <Spinner label={t("admin.loading")} />
                    </div>
                ) : data?.items.length ? (
                    <ul className="inbox-list">
                        {data.items.map((item) => (
                            <InboxRow
                                key={item.id}
                                item={item}
                                busy={busy || !available}
                                onRead={markRead}
                            />
                        ))}
                    </ul>
                ) : (
                    !error && (
                        <div className="inbox-state">
                            <p>{t("inbox.empty")}</p>
                        </div>
                    )
                )}
                <Pagination
                    currentPage={page}
                    totalPages={pages}
                    onPageChange={setPage}
                    ariaLabel={t("inbox.title")}
                    previousLabel={t("admin.previous")}
                    nextLabel={t("admin.next")}
                />
            </PrimaryCard>
        </section>
    );
}
