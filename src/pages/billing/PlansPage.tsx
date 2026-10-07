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

const plans = ["free", "monthly", "annual"] as const;
export function PlansPage() {
    const { t } = useTranslation();
    const { user } = useAuthContext();
    const billing = useSubscription(user?.id, null, true, true);
    const [confirmation, setConfirmation] = useState<PlanChangeSelection | null>(null);
    const showToast = useToast();
    useEffect(() => setConfirmation(null), [user?.id]);
    const confirmChange = async () => {
        if (!confirmation) return;
        if (await billing.change(confirmation.plan, confirmation.version)) {
            showToast(
                t(
                    confirmation.plan === "keep"
                        ? "billing.manage.restored"
                        : "billing.manage.saved",
                ),
            );
            setConfirmation(null);
        }
    };
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
    const selected =
        params.get("plan") === "annual"
            ? "annual"
            : params.get("plan") === "free"
              ? "free"
              : "monthly";
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
    const priceFor = (plan: (typeof plans)[number], priceCurrency = currency) => {
        const price = billing.catalog?.prices.find(
            (item) => item.plan === plan && item.currency === priceCurrency,
        );
        if (plan !== "free" && !price) return t("billing.plans.soon");
        const amount = plan === "free" ? 0 : price!.amount;
        return priceCurrency === "krw"
            ? `₩${amount.toLocaleString("en-US")}`
            : `US$${(amount / 100).toFixed(amount === 0 ? 0 : 2)}`;
    };
    const choose = async (plan: (typeof plans)[number]) => {
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
            {billing.subscription?.has_subscription && !billing.subscription.can_manage && (
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
                {plans.map((plan) => (
                    <article
                        key={plan}
                        className={`plan-card${selected === plan && plan !== currentPlan ? " plan-card--selected" : ""}`}
                    >
                        <div className="plan-card__top">
                            <h2>{t(`billing.plans.${plan}.name`)}</h2>
                            <span className="plan-card__badge">
                                {t(
                                    plan === "free"
                                        ? "billing.plans.basic"
                                        : billing.catalog?.livemode
                                          ? "billing.recurring"
                                          : "billing.sandbox",
                                )}
                            </span>
                        </div>
                        <p className="plan-card__description">
                            {t(`billing.plans.${plan}.description`)}
                        </p>
                        <p className="plan-card__price">
                            {user && billing.loading && !billing.catalog ? (
                                <Spinner label={t("billing.loading")} hideLabel />
                            ) : (
                                priceFor(plan)
                            )}
                            <span>{t(`billing.plans.${plan}.period`)}</span>
                        </p>
                        <ul>
                            {["one", "two", "three"].map((item) => (
                                <li key={item}>
                                    <Check aria-hidden="true" />
                                    <span>{t(`billing.plans.${plan}.${item}`)}</span>
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
                                    (plan === "free" && !billing.subscription?.has_subscription) ||
                                    billing.loading ||
                                    billing.busy ||
                                    !billing.available ||
                                    !billing.catalog?.enabled ||
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
                ))}
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
