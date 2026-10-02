import { ArrowLeft, Check, CreditCard, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, InlineMessage } from "../../components/ui";
import { useAuthContext } from "../../hooks/useAuth";

const plans = ["free", "monthly", "annual"] as const;
export function PlansPage() {
    const { t } = useTranslation();
    const { user } = useAuthContext();
    const navigate = useNavigate();
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
            { replace: true },
        );
    const prices =
        currency === "krw"
            ? { free: "₩0", monthly: "₩3,990", annual: "₩39,900" }
            : { free: "US$0", monthly: "US$3.99", annual: "US$39.99" };
    return (
        <section className="plans-page">
            <Button
                appearance="pill-secondary"
                className="plans-back"
                onClick={() => navigate(user ? "/settings?section=billing" : "/show-case")}
            >
                <ArrowLeft aria-hidden="true" />
                {t("billing.back")}
            </Button>
            <header className="plans-header">
                <span className="billing-eyebrow">{t("billing.plans.eyebrow")}</span>
                <h1>{t("billing.plans.title")}</h1>
                <p>{t("billing.plans.subtitle")}</p>
            </header>
            <div className="plans-currency">
                <span>{t("billing.plans.currency")}</span>
                <div role="group" aria-label={t("billing.plans.currency")}>
                    {(["krw", "usd"] as const).map((value) => (
                        <Button
                            key={value}
                            appearance={currency === value ? "pill" : "pill-secondary"}
                            aria-pressed={currency === value}
                            onClick={() => update("currency", value)}
                        >
                            {value === "krw" ? "KRW ₩" : "USD $"}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="plans-grid" role="group" aria-label={t("billing.plans.choose")}>
                {plans.map((plan) => (
                    <article
                        key={plan}
                        className={`plan-card${selected === plan ? " plan-card--selected" : ""}`}
                    >
                        <div className="plan-card__top">
                            <h2>{t(`billing.plans.${plan}.name`)}</h2>
                            <span className="plan-card__badge">
                                {t(plan === "free" ? "billing.plans.basic" : "billing.plans.soon")}
                            </span>
                        </div>
                        <div className="plan-card__icon">
                            {plan === "free" ? (
                                <Check aria-hidden="true" />
                            ) : (
                                <Sparkles aria-hidden="true" />
                            )}
                        </div>
                        <p className="plan-card__headline">{t(`billing.plans.${plan}.headline`)}</p>
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
                            appearance={selected === plan ? "pill" : "pill-secondary"}
                            aria-pressed={selected === plan}
                            onClick={() => update("plan", plan)}
                        >
                            {t(
                                selected === plan
                                    ? "billing.plans.selected"
                                    : "billing.plans.select",
                                { plan: t(`billing.plans.${plan}.name`) },
                            )}
                        </Button>
                    </article>
                ))}
            </div>
            <section className="plans-checkout" aria-label={t("billing.plans.next")}>
                <div>
                    <h2>
                        {t(
                            selected === "free"
                                ? "billing.plans.freeNext"
                                : "billing.plans.paidNext",
                        )}
                    </h2>
                    <p>
                        {t(
                            selected === "free"
                                ? "billing.plans.freeHint"
                                : "billing.registrationOnly",
                        )}
                    </p>
                </div>
                <Button
                    appearance="pill"
                    onClick={() =>
                        navigate(
                            !user
                                ? "/login"
                                : selected === "free"
                                  ? "/show-case"
                                  : `/settings?section=billing&plan=${selected}`,
                        )
                    }
                >
                    {selected !== "free" && <CreditCard aria-hidden="true" />}
                    {t(
                        !user
                            ? "billing.signIn"
                            : selected === "free"
                              ? "billing.plans.continueFree"
                              : "billing.addMethod",
                    )}
                </Button>
            </section>
            <InlineMessage tone="info">{t("billing.plans.unavailable")}</InlineMessage>
        </section>
    );
}
