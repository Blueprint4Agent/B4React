import { ChevronRight, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, InlineMessage, Modal, Spinner, StatusBadge, Tooltip } from "../../ui";
import type { BillingInvoices } from "../../../api/billing/billingApi";
import type { useInvoiceHistory } from "../../../hooks/api/billing/useInvoiceHistory";

export function invoiceAmount(amount: number, currency: string) {
    const formatter = new Intl.NumberFormat(undefined, { style: "currency", currency });
    return formatter.format(
        amount / 10 ** (formatter.resolvedOptions().maximumFractionDigits ?? 2),
    );
}
export function InvoiceRows({
    items,
    onSelect,
}: {
    items: BillingInvoices["items"];
    onSelect: (id: string) => void;
}) {
    const { t } = useTranslation();
    return (
        <>
            {items.map((invoice) => (
                <div className="billing-invoice" key={invoice.id}>
                    <span>{invoice.number ?? t("billing.details.invoice")}</span>
                    <time>{new Date(invoice.created * 1000).toLocaleDateString()}</time>
                    <StatusBadge tone="info">
                        {t(`billing.details.status.${invoice.status}`, {
                            defaultValue: invoice.status,
                        })}
                    </StatusBadge>
                    <span>{invoiceAmount(invoice.amount, invoice.currency)}</span>
                    <Tooltip content={t("billing.historyDialog.details")}>
                        <Button
                            appearance="text"
                            aria-label={t("billing.historyDialog.details")}
                            onClick={() => onSelect(invoice.id)}
                        >
                            <ChevronRight aria-hidden="true" />
                        </Button>
                    </Tooltip>
                </div>
            ))}
        </>
    );
}
function openReceipt(url: string) {
    try {
        const parsed = new URL(url);
        if (
            parsed.protocol === "https:" &&
            !parsed.username &&
            !parsed.password &&
            !parsed.port &&
            ["invoice.stripe.com", "pay.stripe.com"].includes(parsed.hostname)
        )
            window.open(parsed.href, "_blank", "noopener,noreferrer");
    } catch {
        /* Ignore malformed provider links. */
    }
}
export function InvoiceHistoryDialog({
    history,
}: {
    history: ReturnType<typeof useInvoiceHistory>;
}) {
    const { t } = useTranslation();
    const detail = history.detail;
    return (
        <Modal
            open={history.visible}
            onClose={history.close}
            title={t(history.selected ? "billing.historyDialog.details" : "billing.history")}
            keyboardDismissible
            footer={
                history.selected ? (
                    <Button appearance="text" onClick={() => history.open()}>
                        {t("billing.historyDialog.back")}
                    </Button>
                ) : undefined
            }
        >
            {history.error && (
                <>
                    <InlineMessage>{t(history.error)}</InlineMessage>
                    <Button appearance="text" onClick={() => void history.retry()}>
                        {t("billing.native.retry")}
                    </Button>
                </>
            )}
            {history.loading && <Spinner label={t("billing.loading")} />}
            {history.selected ? (
                detail && (
                    <div className="invoice-detail">
                        <strong>{detail.number ?? detail.id}</strong>
                        <span>{new Date(detail.created * 1000).toLocaleString()}</span>
                        <StatusBadge tone="info">
                            {t(`billing.details.status.${detail.status}`, {
                                defaultValue: detail.status,
                            })}
                        </StatusBadge>
                        {detail.lines.map((line, i) => (
                            <div className="invoice-detail__line" key={i}>
                                <span>
                                    {line.description}
                                    {line.quantity ? ` × ${line.quantity}` : ""}
                                </span>
                                <span>{invoiceAmount(line.amount, detail.currency)}</span>
                            </div>
                        ))}
                        {detail.lines_has_more && <p>{t("billing.historyDialog.moreLines")}</p>}
                        <div className="invoice-detail__line">
                            <span>{t("billing.historyDialog.total")}</span>
                            <strong>{invoiceAmount(detail.total, detail.currency)}</strong>
                        </div>
                        <div className="invoice-detail__line">
                            <span>{t("billing.historyDialog.paid")}</span>
                            <span>{invoiceAmount(detail.amount_paid, detail.currency)}</span>
                        </div>
                        {detail.url && (
                            <Tooltip content={t("billing.details.receipt")}>
                                <Button appearance="text" onClick={() => openReceipt(detail.url!)}>
                                    <FileText aria-hidden="true" />
                                    {t("billing.details.receipt")}
                                </Button>
                            </Tooltip>
                        )}
                    </div>
                )
            ) : (
                <div className="billing-records">
                    <InvoiceRows items={history.invoices?.items ?? []} onSelect={history.open} />
                    {history.invoices && !history.invoices.items.length && !history.loading && (
                        <p>{t("billing.details.noInvoices")}</p>
                    )}
                    {history.invoices?.has_more && (
                        <Button
                            appearance="text"
                            loading={history.loading}
                            onClick={() => void history.more()}
                        >
                            {t("billing.historyDialog.more")}
                        </Button>
                    )}
                </div>
            )}
        </Modal>
    );
}
