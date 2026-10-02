import {
    CreditCard,
    Sparkles,
    ExternalLink,
    Plus,
    ReceiptText,
    RefreshCw,
    ShieldCheck,
    Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, InlineMessage } from "../../components/ui";
import { useSubscription } from "../../hooks/api/billing/useSubscription";
import { useBilling } from "../../hooks/api/billing/useBilling";

type Props = { ownerId: number; email: string };
export function BillingSettingsPage({ ownerId, email }: Props) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const billing = useBilling(ownerId, params.get("billing_setup"));
    const subscription = useSubscription(
        ownerId,
        params.get("billing_checkout"),
        !!billing.config?.enabled,
    );
    const selectedPlan = params.get("plan");
    const paidSelected = selectedPlan === "monthly" || selectedPlan === "annual";
    const addMethod = async () => {
        const url = await billing.createSetup();
        if (url) window.location.assign(url);
    };
    return (
        <>
            <header className="settings-content-card__header">
                <h1>{t("billing.title")}</h1>
                <p>{t("billing.subtitle")}</p>
            </header>
            <div className="settings-general-content billing-settings">
                <section
                    className="settings-row billing-plan-summary"
                    aria-label={t("billing.currentPlan")}
                >
                    <div>
                        <span className="billing-eyebrow">{t("billing.currentPlan")}</span>
                        <h2>
                            {subscription.subscription
                                ? t(`billing.plans.${subscription.subscription.plan}.name`)
                                : t(
                                      subscription.loading
                                          ? "billing.loading"
                                          : "billing.subscriptionStatus.unknown",
                                  )}
                        </h2>
                        <p>
                            {subscription.subscription?.has_subscription
                                ? t(
                                      `billing.subscriptionStatus.${subscription.subscription.status}`,
                                      { defaultValue: t("billing.subscriptionStatus.unknown") },
                                  )
                                : subscription.subscription?.plan === "free"
                                  ? t("billing.freeSummary")
                                  : t("billing.subscriptionStatus.unknown")}
                        </p>
                        {subscription.subscription?.current_period_end && (
                            <p>
                                {t(
                                    subscription.subscription.cancel_at_period_end
                                        ? "billing.endsAt"
                                        : "billing.renewsAt",
                                    {
                                        date: new Date(
                                            subscription.subscription.current_period_end * 1000,
                                        ).toLocaleDateString(),
                                    },
                                )}
                            </p>
                        )}
                    </div>
                    <Button appearance="pill-secondary" onClick={() => navigate("/plans")}>
                        <Sparkles aria-hidden="true" />
                        {t("billing.changePlan")}
                    </Button>
                </section>
                {subscription.error && <InlineMessage>{t(subscription.error)}</InlineMessage>}
                {subscription.notice && (
                    <InlineMessage tone="info">
                        {t(`billing.checkoutNotices.${subscription.notice}`)}
                    </InlineMessage>
                )}
                {paidSelected && (
                    <InlineMessage tone="info">
                        {t("billing.selectedPlan", {
                            plan: t(`billing.plans.${selectedPlan}.name`),
                        })}
                    </InlineMessage>
                )}
                {!billing.available && (
                    <InlineMessage tone="warning">{t("billing.offline")}</InlineMessage>
                )}
                {billing.error && (
                    <div className="billing-feedback">
                        <InlineMessage>{t(billing.error)}</InlineMessage>
                    </div>
                )}
                {billing.notice && (
                    <InlineMessage tone="info">
                        {t(`billing.notices.${billing.notice}`)}
                    </InlineMessage>
                )}
                {billing.config?.enabled === false && (
                    <InlineMessage tone="info">{t("billing.disabled")}</InlineMessage>
                )}
                {billing.config?.enabled && !billing.config.livemode && (
                    <p className="billing-test-note">
                        <ShieldCheck aria-hidden="true" />
                        {t("billing.testMode")}
                    </p>
                )}
                <section className="billing-section" aria-labelledby="billing-history-title">
                    <header>
                        <h2 id="billing-history-title">{t("billing.history")}</h2>
                        <span className="billing-muted-label">{t("billing.plans.soon")}</span>
                    </header>
                    <div className="settings-row billing-empty">
                        <ReceiptText aria-hidden="true" />
                        <div>
                            <strong>{t("billing.historyEmpty")}</strong>
                            <p>{t("billing.historyHint")}</p>
                        </div>
                    </div>
                </section>
                <section className="billing-section" aria-labelledby="billing-info-title">
                    <header>
                        <h2 id="billing-info-title">{t("billing.info")}</h2>
                    </header>
                    <div className="settings-row billing-info-row">
                        <div>
                            <span className="billing-eyebrow">{t("billing.accountEmail")}</span>
                            <p>{email}</p>
                        </div>
                        <p>{t("billing.infoHint")}</p>
                    </div>
                </section>
                <section className="billing-section" aria-labelledby="billing-methods-title">
                    <header>
                        <h2 id="billing-methods-title">{t("billing.methods")}</h2>
                        <div className="billing-section__actions">
                            <Button
                                appearance="pill-secondary"
                                disabled={!billing.available || billing.loading}
                                onClick={() => {
                                    void billing.reload();
                                    void subscription.reload();
                                }}
                            >
                                <RefreshCw aria-hidden="true" />
                                {t("billing.retry")}
                            </Button>
                            <Button
                                appearance="pill-secondary"
                                loading={billing.busy}
                                disabled={
                                    !billing.available ||
                                    !billing.config?.enabled ||
                                    billing.loading
                                }
                                onClick={() => void addMethod()}
                            >
                                <Plus aria-hidden="true" />
                                {t("billing.addMethod")}
                            </Button>
                        </div>
                    </header>
                    {billing.loading ? (
                        <p className="settings-row billing-loading" role="status">
                            {t("billing.loading")}
                        </p>
                    ) : null}
                    {!billing.loading &&
                        !billing.error &&
                        billing.config?.enabled &&
                        billing.methods.card.items.length === 0 &&
                        billing.methods.link.items.length === 0 && (
                            <div className="settings-row billing-empty">
                                <Wallet aria-hidden="true" />
                                <div>
                                    <strong>{t("billing.noMethods")}</strong>
                                    <p>{t("billing.registrationOnly")}</p>
                                </div>
                            </div>
                        )}
                    {(["card", "link"] as const).map((type) => (
                        <div key={type} className="billing-method-group">
                            {billing.methods[type].items.map((method) => (
                                <article className="settings-row billing-method" key={method.id}>
                                    <span className="billing-method__icon">
                                        {type === "card" ? (
                                            <CreditCard aria-hidden="true" />
                                        ) : (
                                            <Wallet aria-hidden="true" />
                                        )}
                                    </span>
                                    <div>
                                        <h3>
                                            {type === "link"
                                                ? "Link"
                                                : `${method.brand?.toUpperCase() ?? t("billing.card")} •••• ${method.last4 ?? ""}`}
                                        </h3>
                                        <p>
                                            {type === "link"
                                                ? t("billing.linkSaved")
                                                : t("billing.expiry", {
                                                      month: String(
                                                          method.exp_month ?? "",
                                                      ).padStart(2, "0"),
                                                      year: method.exp_year ?? "",
                                                  })}
                                        </p>
                                    </div>
                                    <span className="billing-muted-label">
                                        {t("billing.saved")}
                                    </span>
                                </article>
                            ))}
                            {billing.methods[type].has_more && (
                                <Button
                                    appearance="pill-secondary"
                                    loading={billing.moreBusy === type}
                                    disabled={
                                        !billing.available ||
                                        billing.loading ||
                                        billing.moreBusy !== null
                                    }
                                    onClick={() => void billing.loadMore(type)}
                                >
                                    {t("billing.loadMore", {
                                        type: type === "card" ? t("billing.card") : "Link",
                                    })}
                                </Button>
                            )}
                        </div>
                    ))}
                    <p className="billing-provider-note">
                        <ExternalLink aria-hidden="true" />
                        {t("billing.providerNote")}
                    </p>
                </section>
                {subscription.subscription && (
                    <section className="billing-plan-footer">
                        <ShieldCheck aria-hidden="true" />
                        <div>
                            <h2>
                                {t(
                                    subscription.subscription?.has_subscription
                                        ? "billing.subscriptionManaged"
                                        : "billing.noSubscription",
                                )}
                            </h2>
                            <p>
                                {t(
                                    subscription.subscription?.has_subscription
                                        ? "billing.subscriptionManagedHint"
                                        : "billing.noSubscriptionHint",
                                )}
                            </p>
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
