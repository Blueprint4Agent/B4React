import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button, DropdownMenu } from "../../components/ui";
import { useAuthContext } from "../../hooks/useAuth";

const plans = ["free", "monthly", "annual"] as const;
export function PlansPage() {
    const { t } = useTranslation();
    const { user } = useAuthContext();
    // Registration-only template: paid subscriptions are not yet available.
    const currentPlan = user ? "free" : null;
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
    const prices =
        currency === "krw"
            ? { free: "₩0", monthly: "₩3,990", annual: "₩39,900" }
            : { free: "US$0", monthly: "US$3.99", annual: "US$39.99" };
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
            <div className="plans-currency">
                <DropdownMenu
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
                                {t(plan === "free" ? "billing.plans.basic" : "billing.plans.soon")}
                            </span>
                        </div>
                        <p className="plan-card__description">
                            {t(`billing.plans.${plan}.description`)}
                        </p>
                        <p className="plan-card__price">
                            {prices[plan]}
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
                            disabled={plan === currentPlan}
                            aria-pressed={plan === currentPlan ? undefined : selected === plan}
                            onClick={() => update("plan", plan)}
                        >
                            {t(
                                plan === currentPlan
                                    ? "billing.currentPlan"
                                    : selected === plan
                                      ? "billing.plans.selected"
                                      : "billing.plans.select",
                                { plan: t(`billing.plans.${plan}.name`) },
                            )}
                        </Button>
                    </article>
                ))}
            </div>
            <p className="plans-disclaimer">{t("billing.plans.unavailable")}</p>
        </section>
    );
}
