import { memo, useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";
import { useAuthContext } from "../../hooks/useAuth";
import {
    useInquiries,
    type InquiryDetail,
    type InquiryStatus,
} from "../../hooks/api/inquiries/useInquiries";
import {
    Button,
    DropdownMenu,
    InlineMessage,
    InputField,
    TextareaField,
    PrimaryCard,
    Spinner,
    StatusBadge,
    Pagination,
} from "../../components/ui";
import { useAppConfig } from "../../hooks/useFeatures";
import { demoInquiries } from "./demoInquiries";
import { LoadingPage } from "../main/LoadingPage";

const Messages = memo(function Messages({ messages }: { messages: InquiryDetail["messages"] }) {
    const { t, i18n } = useTranslation();
    return (
        <ol className="inquiry-messages">
            {messages.map((message) => (
                <li className="settings-row inquiry-message" key={message.id}>
                    <div className="inquiry-message__meta">
                        <strong>{t(`support.author.${message.author_role}`)}</strong>
                        <time dateTime={message.created_at}>
                            {new Date(message.created_at).toLocaleString(i18n.language)}
                        </time>
                    </div>
                    <p>{message.body}</p>
                </li>
            ))}
        </ol>
    );
});
function Compose({
    busy,
    onSubmit,
}: {
    busy: boolean;
    onSubmit: (subject: string, body: string) => Promise<boolean>;
}) {
    const { t } = useTranslation();
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    return (
        <form
            className="inquiry-form"
            onSubmit={(event) => {
                event.preventDefault();
                void onSubmit(subject.trim(), body.trim()).then((ok) => {
                    if (ok) {
                        setSubject("");
                        setBody("");
                    }
                });
            }}
        >
            <InputField
                label={t("support.subject")}
                value={subject}
                onValueChange={setSubject}
                maxLength={160}
                required
                disabled={busy}
            />
            <TextareaField
                label={t("support.body")}
                value={body}
                onValueChange={setBody}
                maxLength={4000}
                rows={5}
                required
                disabled={busy}
            />
            <p className="admin-note">{t("support.privacy")}</p>
            <Button type="submit" disabled={busy || !subject.trim() || !body.trim()}>
                {t("support.send")}
            </Button>
        </form>
    );
}
function Reply({
    admin,
    busy,
    onSubmit,
}: {
    busy: boolean;
    admin: boolean;
    onSubmit: (body: string) => Promise<boolean>;
}) {
    const { t } = useTranslation();
    const [body, setBody] = useState("");
    return (
        <form
            className="inquiry-form"
            onSubmit={(event) => {
                event.preventDefault();
                void onSubmit(body.trim()).then((ok) => {
                    if (ok) setBody("");
                });
            }}
        >
            <TextareaField
                label={t(admin ? "support.replyBody" : "support.followUpBody")}
                value={body}
                onValueChange={setBody}
                maxLength={4000}
                rows={4}
                required
                disabled={busy}
            />
            <Button type="submit" disabled={busy || !body.trim()}>
                {t(admin ? "support.reply" : "support.followUp")}
            </Button>
        </form>
    );
}
export function InquirySettings({
    owner,
    admin = false,
    demo = false,
}: {
    owner: number;
    admin?: boolean;
    demo?: boolean;
}) {
    const { t, i18n } = useTranslation();
    const toast = useToast();
    const [params, setParams] = useSearchParams();
    const selectedValue = Number(params.get("inquiry"));
    const selected =
        Number.isSafeInteger(selectedValue) && selectedValue > 0 ? selectedValue : null;
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<InquiryStatus | undefined>();
    const [composing, setComposing] = useState(false);
    useEffect(() => {
        setComposing(false);
    }, [selected]);
    const live = useInquiries(owner, admin, page, status, selected, !demo);
    const samples = useMemo(() => demoInquiries(t), [t, i18n.resolvedLanguage]);
    const filteredSamples = samples.filter((item) => !status || item.status === status);
    const { busy, available, submit, reload } = live;
    const loading = !demo && live.loading;
    const error = !demo && live.error;
    const list = demo ? { items: filteredSamples, total: filteredSamples.length } : live.list;
    const detail = demo ? (samples.find((item) => item.id === selected) ?? null) : live.detail;
    const pages = Math.max(1, Math.ceil((list?.total ?? 0) / 20));
    useEffect(() => {
        if (list && page > pages) setPage(pages);
    }, [list, page, pages]);
    const select = (id: number | null) => {
        setComposing(false);
        setParams((previous) => {
            const next = new URLSearchParams(previous);
            if (id) next.set("inquiry", String(id));
            else next.delete("inquiry");
            return next;
        });
    };
    return (
        <>
            <header className="settings-content-card__header">
                <h1>{t(admin ? "support.adminTitle" : "support.title")}</h1>
                <p>
                    {t(
                        demo
                            ? "support.demoDescription"
                            : admin
                              ? "support.adminDescription"
                              : "support.description",
                    )}
                </p>
            </header>
            <div className="inbox-toolbar">
                {(selected || composing) && (
                    <Button disabled={busy} onClick={() => select(null)}>
                        {t("support.back")}
                    </Button>
                )}
                {!admin && !composing && !selected && (
                    <Button onClick={() => setComposing(true)} disabled={!available}>
                        {t("support.new")}
                    </Button>
                )}
                <Button onClick={reload} disabled={!available || loading || busy}>
                    {t("admin.refresh")}
                </Button>
                {!selected && !composing && (
                    <DropdownMenu
                        label={t("support.filter")}
                        triggerLabel={t(status ? `support.status.${status}` : "support.all")}
                        items={["all", "open", "in_progress", "closed"].map((id) => ({
                            id,
                            label: t(id === "all" ? "support.all" : `support.status.${id}`),
                        }))}
                        onSelect={(value) => {
                            setStatus(value === "all" ? undefined : (value as InquiryStatus));
                            setPage(1);
                        }}
                    />
                )}
            </div>
            {error && <InlineMessage>{t("support.error")}</InlineMessage>}
            {composing ? (
                <Compose
                    busy={busy || !available}
                    onSubmit={async (subject, body) => {
                        const result = await submit("create", { subject, body });
                        if (result) {
                            toast(t("support.sent"));
                            select(result.id);
                        }
                        return Boolean(result);
                    }}
                />
            ) : selected ? (
                detail ? (
                    <div className="inquiry-detail">
                        <div className="inquiry-detail__header">
                            <h2>{detail.subject}</h2>
                            <StatusBadge tone={detail.status === "closed" ? "inactive" : "info"}>
                                {t(`support.status.${detail.status}`)}
                            </StatusBadge>
                        </div>
                        {admin && (
                            <p className="admin-note">
                                {detail.requester_name} · {detail.requester_email}
                            </p>
                        )}
                        {admin && !demo && (
                            <div className="inbox-toolbar">
                                {(["open", "in_progress", "closed"] as const)
                                    .filter((value) => value !== detail.status)
                                    .map((value) => (
                                        <Button
                                            key={value}
                                            disabled={busy || !available}
                                            onClick={() => {
                                                void submit("status", { status: value });
                                            }}
                                        >
                                            {t(`support.action.${value}`)}
                                        </Button>
                                    ))}
                            </div>
                        )}
                        <Messages messages={detail.messages} />
                        {demo ? null : detail.status !== "closed" ? (
                            <Reply
                                key={detail.id}
                                admin={admin}
                                busy={busy || !available}
                                onSubmit={async (body) => Boolean(await submit("reply", { body }))}
                            />
                        ) : (
                            <p className="admin-note">{t("support.closed")}</p>
                        )}
                    </div>
                ) : (
                    !error && (
                        <div className="inbox-state">
                            {demo ? (
                                <p>{t("support.empty")}</p>
                            ) : (
                                <Spinner label={t("admin.loading")} />
                            )}
                        </div>
                    )
                )
            ) : loading && !list ? (
                <div className="inbox-state">
                    {demo ? <p>{t("support.empty")}</p> : <Spinner label={t("admin.loading")} />}
                </div>
            ) : list?.items.length ? (
                <>
                    <ul className="inquiry-list">
                        {list.items.map((item) => (
                            <li className="settings-row" key={item.id}>
                                <Button
                                    className="inquiry-list__link"
                                    disabled={busy}
                                    onClick={() => select(item.id)}
                                >
                                    {item.subject}
                                </Button>
                                <div className="inquiry-list__meta">
                                    <StatusBadge tone="info">
                                        {t(`support.status.${item.status}`)}
                                    </StatusBadge>
                                    {admin && <span>{item.requester_name}</span>}
                                    <time dateTime={item.updated_at}>
                                        {new Date(item.updated_at).toLocaleDateString(
                                            i18n.language,
                                        )}
                                    </time>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Pagination
                        currentPage={page}
                        totalPages={pages}
                        onPageChange={setPage}
                        ariaLabel={t("support.title")}
                        previousLabel={t("admin.previous")}
                        nextLabel={t("admin.next")}
                    />
                </>
            ) : (
                !error && (
                    <div className="inbox-state">
                        <p>{t("support.empty")}</p>
                    </div>
                )
            )}
        </>
    );
}
export function AdminInquiriesPage({ demo = false }: { demo?: boolean }) {
    const { data: config, loading: configLoading } = useAppConfig();
    const { user, loading } = useAuthContext();
    if (demo && configLoading) return <LoadingPage />;
    if (demo && !config?.demo_enabled) return <Navigate to="/home" replace />;
    if (!demo && loading) return <LoadingPage />;
    if (!demo && !user) return <Navigate to="/login" replace />;
    if (!demo && user?.role !== "admin") return <Navigate to="/home" replace />;
    return (
        <section className="settings-layout">
            <PrimaryCard className="settings-content-card">
                <InquirySettings
                    key={demo ? "demo" : user?.id}
                    owner={demo ? 0 : user!.id}
                    admin
                    demo={demo}
                />
            </PrimaryCard>
        </section>
    );
}
