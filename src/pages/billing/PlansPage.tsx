import { openSubscriptionPayment } from "../../utils/billingPlans";
import { useEffect, useState } from "react";
import {
    PlanChangeDialog,
    type PlanChangeSelection,
} from "../../components/features/billing/PlanChangeDialog";
import { useToast } from "../../hooks/useToast";
import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button, InlineMessage, SegmentedControl, Spinner } from "../../components/ui";
import { useSubscription } from "../../hooks/api/billing/useSubscription";
import { useAuthContext } from "../../hooks/useAuth";

const plans = ["free", "plus", "pro"] as const;
import { planFor, type BillingInterval } from "../../utils/billingPlans";
import type { BillingSubscription } from "../../api/billing/billingApi";
export function PlansPage() {
    const { t } = useTranslation();
    const { user } = useAuthContext();
    const billing = useSubscription(user?.id, null, true, true);
    const [confirmation, setConfirmation] = useState<PlanChangeSelection | null>(null);
    const showToast = useToast();
    useEffect(() => setConfirmation(null), [user?.id]);
    const confirmChange = async () => {
        if (!confirmation) return;
        const changed = await billing.change(confirmation.plan, confirmation.version);
        if (changed) {
            showToast(
                t(
                    confirmation.plan === "keep"
                        ? "billing.manage.restored"
                        : confirmation.immediate
                          ? "billing.manage.upgraded"
                          : "billing.manage.saved",
                ),
            );
            setConfirmation(null);
        }
    };
    useEffect(() => {
        if (billing.subscription?.payment_required) setConfirmation(null);
    }, [billing.subscription?.payment_required]);
    const currentPlan = billing.subscription?.plan;
    const navigate = useNavigate();
    const location = useLocation();
    const returnTo = (location.state as { returnTo?: unknown } | null)?.returnTo;
    const close = () =>
        navigate(
            typeof returnTo === "string" &&
                /^\/(?:settings|show-case|admin|home)(?:\?.*)?$/.test(returnTo)
                ? returnTo
                : user
                  ? "/settings?section=billing"
                  : "/home",
            { replace: true, state: location.state },
        );
    const [params, setParams] = useSearchParams();
    const intervalFor = (tier: "free" | "plus" | "pro"): BillingInterval => {
        const requested = params.get(`${tier}_interval`);
        if (requested === "monthly" || requested === "annual") return requested;
        const previousPlan = params.get("plan");
        return params.get("interval") === "annual" ||
            (tier === "plus" && previousPlan === "annual") ||
            (tier === "pro" && previousPlan === "pro_annual")
            ? "annual"
            : "monthly";
    };
    const selected = params.get("plan") ?? planFor("plus", intervalFor("plus"));
    const billingCurrency = billing.subscription?.currency === "usd" ? "usd" : "krw";
    const requestedCurrency = params.get("currency");
    const currency =
        requestedCurrency === "usd" || requestedCurrency === "krw"
            ? requestedCurrency
            : billingCurrency;
    const update = (key: string, value: string) =>
        setParams(
            (previous) => {
                const next = new URLSearchParams(previous);
                next.set(key, value);
                return next;
            },
            { replace: true, state: location.state },
        );
    const formatAmount = (amount: number, priceCurrency = currency) =>
        new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: priceCurrency,
            maximumFractionDigits: priceCurrency === "krw" ? 0 : 2,
        }).format(priceCurrency === "krw" ? amount : amount / 100);
    const priceFor = (plan: BillingSubscription["plan"], priceCurrency = currency) => {
        const price = billing.catalog?.prices.find(
            (item) => item.plan === plan && item.currency === priceCurrency,
        );
        return plan === "free"
            ? formatAmount(0, priceCurrency)
            : price
              ? formatAmount(price.amount, priceCurrency)
              : t("billing.plans.soon");
    };
    const choose = async (plan: Exclude<BillingSubscription["plan"], "unknown">) => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (billing.subscription?.has_subscription) {
            const snapshot = billing.subscription;
            if (snapshot.can_manage && snapshot.change_version && snapshot.current_period_end)
                setConfirmation({
                    plan,
                    version: snapshot.change_version,
                    effectiveAt: snapshot.current_period_end,
                    immediate:
                        plan.startsWith("pro_") &&
                        (snapshot.plan === "monthly" || snapshot.plan === "annual"),
                    price:
                        plan === "free"
                            ? undefined
                            : `${priceFor(plan, billingCurrency)} ${t(`billing.plans.${plan}.period`)}`,
                });
            return;
        }
        if (plan === "free") return;
        update("plan", plan);
        const url = await billing.checkout(plan, currency);
        if (url) window.location.assign(url);
    };
    return (
        <section className="plans-page">
            <Button
                appearance="pill-secondary"
                className="plans-close"
                aria-label={t("billing.closePlans")}
                onClick={close}
            >
                <X aria-hidden="true" />
            </Button>
            <header className="plans-header">
                <h1>{t("billing.plans.title")}</h1>
            </header>
            {billing.subscription?.payment_required && (
                <div className="billing-feedback">
                    <InlineMessage tone="info">{t("billing.manage.paymentRequired")}</InlineMessage>
                    {billing.subscription.payment_url && (
                        <Button
                            appearance="text"
                            onClick={() =>
                                openSubscriptionPayment(billing.subscription?.payment_url)
                            }
                        >
                            {t("billing.manage.completePayment")}
                        </Button>
                    )}
                </div>
            )}
            {billing.subscription?.has_subscription &&
                !billing.subscription.can_manage &&
                !billing.subscription.payment_required && (
                    <InlineMessage tone="info">{t("billing.manage.unavailable")}</InlineMessage>
                )}
            {billing.error && <InlineMessage>{t(billing.error)}</InlineMessage>}
            {billing.error && (
                <Button appearance="pill-secondary" onClick={() => void billing.reload()}>
                    {t("billing.retry")}
                </Button>
            )}
            <SegmentedControl
                className="plans-currency"
                label={t("billing.plans.currency")}
                options={[
                    { value: "usd", label: "$", accessibleLabel: t("billing.plans.usd") },
                    { value: "krw", label: "₩", accessibleLabel: t("billing.plans.krw") },
                ]}
                value={currency}
                onChange={(value) => update("currency", value)}
                disabled={billing.busy}
            />
            <div className="plans-grid" role="group" aria-label={t("billing.plans.choose")}>
                {plans.map((tier) => {
                    const interval = intervalFor(tier);
                    const plan = planFor(tier, interval);
                    const price = billing.catalog?.prices.find(
                        (item) => item.plan === plan && item.currency === currency,
                    );
                    const monthlyPrice = billing.catalog?.prices.find(
                        (item) =>
                            item.plan === planFor(tier, "monthly") && item.currency === currency,
                    );
                    const annual = tier !== "free" && interval === "annual";
                    const discount =
                        annual && price && monthlyPrice
                            ? Math.max(
                                  0,
                                  Math.round((1 - price.amount / (monthlyPrice.amount * 12)) * 100),
                              )
                            : 0;
                    return (
                        <article
                            key={tier}
                            className={`plan-card${selected === plan && plan !== currentPlan ? " plan-card--selected" : ""}`}
                        >
                            <div className="plan-card__top">
                                <h2>{t(`billing.plans.${tier}.name`)}</h2>
                                {tier !== "free" && (
                                    <SegmentedControl
                                        label={`${t(`billing.plans.${tier}.name`)} ${t("billing.plans.interval")}`}
                                        value={interval}
                                        onChange={(value) => update(`${tier}_interval`, value)}
                                        disabled={billing.busy}
                                        options={[
                                            {
                                                value: "monthly",
                                                label: t("billing.plans.monthlyLabel"),
                                            },
                                            {
                                                value: "annual",
                                                label: t("billing.plans.annualLabel"),
                                            },
                                        ]}
                                    />
                                )}
                            </div>
                            <p className="plan-card__description">
                                {t(`billing.plans.${tier}.description`)}
                            </p>
                            <p className="plan-card__price">
                                {user && billing.loading && !billing.catalog ? (
                                    <Spinner label={t("billing.loading")} hideLabel />
                                ) : annual && price ? (
                                    <>
                                        {discount > 0 && monthlyPrice && (
                                            <del>{formatAmount(monthlyPrice.amount)}</del>
                                        )}
                                        {formatAmount(price.amount / 12)}
                                    </>
                                ) : (
                                    priceFor(plan)
                                )}
                                <span>
                                    {t(
                                        tier === "free"
                                            ? "billing.plans.free.period"
                                            : "billing.plans.perMonth",
                                    )}
                                </span>
                            </p>
                            <p className="plan-card__billing-note">
                                {annual && price
                                    ? t("billing.plans.annualTotal", {
                                          amount: priceFor(plan),
                                          discount,
                                      })
                                    : tier !== "free"
                                      ? t("billing.plans.monthlyBilling")
                                      : ""}
                            </p>
                            <ul>
                                {["one", "two", "three"].map((item) => (
                                    <li key={item}>
                                        <Check aria-hidden="true" />
                                        <span>{t(`billing.plans.${tier}.${item}`)}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button
                                appearance={
                                    selected === plan && plan !== currentPlan
                                        ? "pill"
                                        : "pill-secondary"
                                }
                                disabled={
                                    !!user &&
                                    (plan === currentPlan ||
                                        (plan === "free" &&
                                            !billing.subscription?.has_subscription) ||
                                        billing.loading ||
                                        billing.busy ||
                                        !billing.available ||
                                        !billing.catalog?.enabled ||
                                        (plan !== "free" && !price) ||
                                        !!billing.error ||
                                        !billing.subscription ||
                                        (billing.subscription.has_subscription &&
                                            !billing.subscription.can_manage) ||
                                        billing.subscription.pending_plan === plan)
                                }
                                loading={billing.busy && selected === plan}
                                onClick={() => void choose(plan)}
                            >
                                {t(
                                    plan === currentPlan
                                        ? "billing.currentPlan"
                                        : !user
                                          ? "billing.signIn"
                                          : billing.subscription?.has_subscription
                                            ? "billing.manage.switch"
                                            : "billing.subscribe",
                                    { plan: t(`billing.plans.${plan}.name`) },
                                )}
                            </Button>
                        </article>
                    );
                })}
            </div>
            <p className="plans-disclaimer">
                {t(
                    billing.catalog?.enabled
                        ? "billing.checkoutDisclosure"
                        : "billing.plans.unavailable",
                )}
            </p>
            {billing.catalog?.enabled && (
                <a
                    className="billing-stripe-badge"
                    href="https://stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        className="payment-brand--light"
                        src="/payment-brands/powered-by-stripe-black.svg"
                        alt="Powered by Stripe"
                    />
                    <img
                        className="payment-brand--dark"
                        src="/payment-brands/powered-by-stripe-white.svg"
                        alt="Powered by Stripe"
                    />
                </a>
            )}
            <PlanChangeDialog
                selection={confirmation}
                busy={billing.busy}
                error={billing.error}
                onClose={() => setConfirmation(null)}
                onConfirm={() => void confirmChange()}
            />
        </section>
    );
}
