import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button, DropdownMenu, InlineMessage, Spinner } from "../../components/ui";
import { useSubscription } from "../../hooks/api/billing/useSubscription";
import { useAuthContext } from "../../hooks/useAuth";

const plans = ["free", "monthly", "annual"] as const;
export function PlansPage() {
    const { t } = useTranslation();
    const { user } = useAuthContext();
    const billing = useSubscription(user?.id, null, true, true);
    const currentPlan = billing.subscription?.plan;
    const navigate = useNavigate();
    const location = useLocation();
    const returnTo = (location.state as { returnTo?: unknown } | null)?.returnTo;
    const close = () =>
        navigate(
            typeof returnTo === "string" &&
                /^\/(?:settings|show-case|admin)(?:\?.*)?$/.test(returnTo)
                ? returnTo
                : user
                  ? "/settings?section=billing"
                  : "/show-case",
            { replace: true, state: location.state },
        );
    const [params, setParams] = useSearchParams();
    const selected =
        params.get("plan") === "annual"
            ? "annual"
            : params.get("plan") === "free"
              ? "free"
              : "monthly";
    const currency = params.get("currency") === "usd" ? "usd" : "krw";
    const update = (key: string, value: string) =>
        setParams(
            (previous) => {
                const next = new URLSearchParams(previous);
                next.set(key, value);
                return next;
            },
            { replace: true, state: location.state },
        );
    const priceFor = (plan: (typeof plans)[number]) => {
        const price = billing.catalog?.prices.find(
            (item) => item.plan === plan && item.currency === currency,
        );
        if (plan !== "free" && !price) return t("billing.plans.soon");
        const amount = plan === "free" ? 0 : price!.amount;
        return currency === "krw"
            ? `₩${amount.toLocaleString("en-US")}`
            : `US$${(amount / 100).toFixed(amount === 0 ? 0 : 2)}`;
    };
    const choose = async (plan: (typeof plans)[number]) => {
        if (!user) {
            navigate("/login");
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
                <p>{t("billing.plans.subtitle")}</p>
            </header>
            {billing.error && <InlineMessage>{t(billing.error)}</InlineMessage>}
            {billing.error && (
                <Button appearance="pill-secondary" onClick={() => void billing.reload()}>
                    {t("billing.retry")}
                </Button>
            )}
            <div className="plans-currency">
                <DropdownMenu
                    disabled={billing.busy}
                    label={t("billing.plans.currency")}
                    triggerLabel={currency === "krw" ? "KRW ₩" : "USD $"}
                    items={[
                        { id: "krw", label: "KRW ₩" },
                        { id: "usd", label: "USD $" },
                    ]}
                    onSelect={(value) => update("currency", value)}
                />
            </div>
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
                                    plan === "free" ||
                                    billing.loading ||
                                    billing.busy ||
                                    !billing.available ||
                                    !billing.catalog?.enabled ||
                                    !!billing.error ||
                                    !billing.subscription ||
                                    billing.subscription.has_subscription)
                            }
                            loading={billing.busy && selected === plan}
                            onClick={() => void choose(plan)}
                        >
                            {t(
                                plan === currentPlan
                                    ? "billing.currentPlan"
                                    : !user
                                      ? "billing.signIn"
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
        </section>
    );
}
