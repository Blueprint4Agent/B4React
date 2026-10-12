import { memo, useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCheck, Eye, RefreshCw, Trash2 } from "lucide-react";
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
    Modal,
    ModalButton,
} from "../../components/ui";
import { LoadingPage } from "../main/LoadingPage";
const InboxRow = memo(function InboxRow({
    item,
    selected,
    busy,
    onSelect,
    onOpen,
}: {
    item: InboxItem;
    selected: boolean;
    busy: boolean;
    onSelect: (id: number, checked: boolean) => void;
    onOpen: (item: InboxItem) => void;
}) {
    const { t, i18n } = useTranslation();
    const title = t(`inbox.events.${item.kind}.title`, { defaultValue: item.title });
    return (
        <tr className={selected ? "inbox-table__selected" : undefined}>
            <td>
                <FormCheckbox
                    checked={selected}
                    disabled={busy}
                    hideLabel
                    label={t("inbox.selectItem", { title })}
                    onCheckedChange={(checked) => onSelect(item.id, checked)}
                />
            </td>
            <td className="inbox-table__copy">
                <strong>{title}</strong>
                <p>
                    {t(`inbox.events.${item.kind}.body`, {
                        defaultValue: item.body,
                        plan: item.body,
                    })}
                </p>
            </td>
            <td>
                <StatusBadge tone={item.read_at ? "inactive" : "info"}>
                    {t(item.read_at ? "inbox.readState" : "inbox.unread")}
                </StatusBadge>
            </td>
            <td>
                <time dateTime={item.created_at}>
                    {new Date(item.created_at).toLocaleString(i18n.language, {
                        dateStyle: "medium",
                        timeStyle: "short",
                    })}
                </time>
            </td>
            <td>
                <Button
                    className="inbox-detail-trigger"
                    disabled={busy}
                    onClick={() => onOpen(item)}
                >
                    <Eye aria-hidden="true" />
                    <span>{t("inbox.open")}</span>
                </Button>
            </td>
        </tr>
    );
});
export function InboxPage() {
    const { user, loading } = useAuthContext();
    if (loading) return <LoadingPage />;
    if (!user) return <Navigate to="/login" replace />;
    return <InboxContent key={user.id} owner={user.id} />;
}
function InboxContent({ owner }: { owner: number }) {
    const { t, i18n } = useTranslation();
    const [page, setPage] = useState(1);
    const [unread, setUnread] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [detail, setDetail] = useState<InboxItem | null>(null);
    const [deleting, setDeleting] = useState<number[] | null>(null);
    const { data, loading, error, busy, available, markRead, updateSelected, reload } = useInbox(
        owner,
        page,
        unread,
    );
    const pages = Math.max(1, Math.ceil((data?.total ?? 0) / 20));
    const items = data?.items ?? [];
    const selectedIds = items.filter((item) => selected.has(item.id)).map((item) => item.id);
    const allSelected = items.length > 0 && selectedIds.length === items.length;
    const blocked = busy || loading || !available;
    useEffect(() => {
        setSelected(new Set());
    }, [page, unread]);
    useEffect(() => {
        if (data && page > pages) setPage(pages);
    }, [data, page, pages]);
    const toggle = useCallback(
        (id: number, checked: boolean) =>
            setSelected((previous) => {
                const next = new Set(previous);
                if (checked) next.add(id);
                else next.delete(id);
                return next;
            }),
        [],
    );
    const open = useCallback(
        (item: InboxItem) => {
            setDetail(item);
            if (!item.read_at) void markRead(item.id);
        },
        [markRead],
    );
    return (
        <section className="settings-layout inbox-page">
            <PrimaryCard className="settings-content-card">
                <header className="settings-content-card__header">
                    <h1>{t("inbox.title")}</h1>
                    <p>{t("inbox.description")}</p>
                </header>
                <div className="admin-filters inbox-toolbar">
                    <FormCheckbox
                        checked={unread}
                        disabled={busy}
                        label={t("inbox.unreadOnly")}
                        onCheckedChange={(value) => {
                            setUnread(value);
                            setPage(1);
                        }}
                    />
                    <span className="admin-note">
                        {t("inbox.count", { count: data?.summary.unread_count ?? 0 })}
                    </span>
                    <div className="inbox-toolbar__actions">
                        <Button disabled={blocked} onClick={reload}>
                            <RefreshCw aria-hidden="true" />
                            {t("admin.refresh")}
                        </Button>
                        <Button
                            disabled={blocked || !data?.summary.unread_count}
                            onClick={() => {
                                void markRead(data?.summary.latest_id ?? 0, true);
                            }}
                        >
                            <CheckCheck aria-hidden="true" />
                            {t("inbox.readAll")}
                        </Button>
                    </div>
                </div>
                <div className="inbox-selection">
                    <span className="admin-note">
                        {t("inbox.selected", { count: selectedIds.length })}
                    </span>
                    <Button
                        disabled={
                            blocked || !items.some((item) => selected.has(item.id) && !item.read_at)
                        }
                        onClick={() => {
                            void updateSelected(selectedIds).then((ok) => {
                                if (ok) setSelected(new Set());
                            });
                        }}
                    >
                        <CheckCheck aria-hidden="true" />
                        {t("inbox.readSelected")}
                    </Button>
                    <Button
                        disabled={blocked || !selectedIds.length}
                        onClick={() => setDeleting(selectedIds)}
                    >
                        <Trash2 aria-hidden="true" />
                        {t("inbox.deleteSelected")}
                    </Button>
                </div>
                {error && <InlineMessage>{t("inbox.error")}</InlineMessage>}
                <div
                    className="admin-table-region inbox-table-region"
                    role="region"
                    aria-label={t("inbox.title")}
                    aria-busy={loading}
                    tabIndex={0}
                >
                    {loading && !data ? (
                        <div className="inbox-state">
                            <Spinner label={t("admin.loading")} />
                        </div>
                    ) : !items.length ? (
                        <div className="inbox-state">
                            <p>{t(error ? "inbox.error" : "inbox.empty")}</p>
                        </div>
                    ) : (
                        <table className="admin-table inbox-table">
                            <caption className="sr-only">{t("inbox.title")}</caption>
                            <thead>
                                <tr>
                                    <th scope="col">
                                        <FormCheckbox
                                            checked={allSelected}
                                            indeterminate={selectedIds.length > 0 && !allSelected}
                                            disabled={blocked}
                                            hideLabel
                                            label={t("inbox.selectPage")}
                                            onCheckedChange={(checked) =>
                                                setSelected(
                                                    checked
                                                        ? new Set(items.map((item) => item.id))
                                                        : new Set(),
                                                )
                                            }
                                        />
                                    </th>
                                    <th scope="col">{t("inbox.content")}</th>
                                    <th scope="col">{t("inbox.status")}</th>
                                    <th scope="col">{t("inbox.received")}</th>
                                    <th scope="col">
                                        <span className="sr-only">{t("inbox.actions")}</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <InboxRow
                                        key={item.id}
                                        item={item}
                                        selected={selected.has(item.id)}
                                        busy={blocked}
                                        onSelect={toggle}
                                        onOpen={open}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <Pagination
                    currentPage={page}
                    totalPages={pages}
                    onPageChange={setPage}
                    ariaLabel={t("inbox.title")}
                    previousLabel={t("admin.previous")}
                    nextLabel={t("admin.next")}
                />
                <Modal
                    open={Boolean(detail)}
                    onClose={() => setDetail(null)}
                    keyboardDismissible
                    title={
                        detail
                            ? t(`inbox.events.${detail.kind}.title`, { defaultValue: detail.title })
                            : t("inbox.title")
                    }
                    footer={
                        <>
                            <ModalButton variant="cancel" onClick={() => setDetail(null)}>
                                {t("inbox.close")}
                            </ModalButton>
                        </>
                    }
                >
                    {detail && (
                        <>
                            <time className="admin-note" dateTime={detail.created_at}>
                                {new Date(detail.created_at).toLocaleString(i18n.language)}
                            </time>
                            <p className="inbox-detail-body">
                                {t(`inbox.events.${detail.kind}.body`, {
                                    defaultValue: detail.body,
                                    plan: detail.body,
                                })}
                            </p>
                        </>
                    )}
                    {error && (
                        <>
                            <InlineMessage>{t("inbox.error")}</InlineMessage>
                            <Button
                                disabled={busy || !detail}
                                onClick={() => {
                                    if (detail) void markRead(detail.id);
                                }}
                            >
                                {t("inbox.read")}
                            </Button>
                        </>
                    )}
                </Modal>
                <Modal
                    open={Boolean(deleting)}
                    onClose={() => {
                        if (!busy) setDeleting(null);
                    }}
                    keyboardDismissible
                    title={t("inbox.deleteTitle")}
                    description={t("inbox.deleteConfirm", { count: deleting?.length ?? 0 })}
                    footer={
                        <>
                            <ModalButton
                                variant="cancel"
                                disabled={busy}
                                onClick={() => setDeleting(null)}
                            >
                                {t("inbox.cancel")}
                            </ModalButton>
                            <ModalButton
                                variant="danger"
                                loading={busy}
                                disabled={!available || !deleting?.length}
                                onClick={() => {
                                    if (deleting)
                                        void updateSelected(deleting, true).then((ok) => {
                                            if (ok) {
                                                setDeleting(null);
                                                setSelected(new Set());
                                            }
                                        });
                                }}
                            >
                                {t("inbox.delete")}
                            </ModalButton>
                        </>
                    }
                >
                    {error && <InlineMessage>{t("inbox.error")}</InlineMessage>}
                </Modal>
            </PrimaryCard>
        </section>
    );
}
