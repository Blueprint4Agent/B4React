import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Check, ChevronRight, CreditCard, Plus, ReceiptText, Trash2, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Button,
    InlineMessage,
    Spinner,
    DropdownMenu,
    StatusBadge,
    StatusCard,
    ModalButton,
    Modal,
} from "../../components/ui";
import { useSubscription } from "../../hooks/api/billing/useSubscription";
import { useBilling } from "../../hooks/api/billing/useBilling";

import {
    PlanChangeDialog,
    type PlanChangeSelection,
} from "../../components/features/billing/PlanChangeDialog";
import { useToast } from "../../hooks/useToast";

import { BillingProfileDialog } from "../../components/features/billing/BillingProfileDialog";
import type { BillingCardSetup } from "../../api/billing/billingApi";
const BillingCardDialog = lazy(() => import("../../components/features/billing/BillingCardDialog"));

type Props = { ownerId: number; email: string };
export function BillingSettingsPage({ ownerId, email }: Props) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const showToast = useToast();
    const [editingProfile, setEditingProfile] = useState(false);
    const [cardSetup, setCardSetup] = useState<BillingCardSetup | null>(null);
    const [removeMethod, setRemoveMethod] = useState<string | null>(null);
    useEffect(() => {
        setEditingProfile(false);
        setCardSetup(null);
        setRemoveMethod(null);
    }, [ownerId]);
    const cancellationHandled = useRef(false);
    const checkoutCancelled = params.get("billing_checkout") === "cancelled";
    const setupCancelled = params.get("billing_setup") === "cancelled";
    useEffect(() => {
        if (!checkoutCancelled && !setupCancelled) {
            cancellationHandled.current = false;
            return;
        }
        if (cancellationHandled.current) return;
        cancellationHandled.current = true;
        showToast(
            t(
                checkoutCancelled
                    ? "billing.checkoutNotices.cancelled"
                    : "billing.notices.cancelled",
            ),
        );
        setParams(
            (previous) => {
                const next = new URLSearchParams(previous);
                for (const key of ["billing_checkout", "billing_setup"]) {
                    if (next.get(key) === "cancelled") next.delete(key);
                }
                next.set("section", "billing");
                return next;
            },
            { replace: true },
        );
    }, [checkoutCancelled, setupCancelled, setParams, showToast, t]);
    const billing = useBilling(
        ownerId,
        setupCancelled ? null : params.get("billing_setup"),
        params.get("billing_card_setup"),
    );
    useEffect(() => {
        if (!params.has("billing_card_setup")) return;
        if (
            !["setup_intent_client_secret", "setup_intent", "redirect_status"].some((key) =>
                params.has(key),
            )
        )
            return;
        setParams(
            (previous) => {
                const next = new URLSearchParams(previous);
                for (const key of ["setup_intent_client_secret", "setup_intent", "redirect_status"])
                    next.delete(key);
                return next;
            },
            { replace: true },
        );
    }, [params, setParams]);
    const subscription = useSubscription(
        ownerId,
        checkoutCancelled ? null : params.get("billing_checkout"),
        !!billing.config?.enabled,
    );
    const handledSuccess = useRef(new Set<string>());
    useEffect(() => {
        const confirmations = [
            {
                key: "billing_checkout",
                confirmed: subscription.notice === "paid",
                message: "billing.checkoutNotices.paid",
            },
            {
                key: "billing_setup",
                confirmed: billing.notice === "registered",
                message: "billing.notices.registered",
            },
            {
                key: "billing_card_setup",
                confirmed: billing.notice === "registered",
                message: "billing.notices.registered",
            },
        ];
        const completed = confirmations.filter(({ key, confirmed }) => {
            const session = params.get(key);
            return (
                confirmed &&
                session &&
                session !== "cancelled" &&
                !handledSuccess.current.has(`${ownerId}:${key}:${session}`)
            );
        });
        if (!completed.length) return;
        for (const { key, message } of completed) {
            handledSuccess.current.add(`${ownerId}:${key}:${params.get(key)}`);
            showToast(t(message));
        }
        setParams(
            (previous) => {
                const next = new URLSearchParams(previous);
                for (const { key } of completed) {
                    if (next.get(key) === params.get(key)) next.delete(key);
                }
                next.set("section", "billing");
                return next;
            },
            { replace: true },
        );
    }, [ownerId, params, subscription.notice, billing.notice, setParams, showToast, t]);
    const [confirmation, setConfirmation] = useState<PlanChangeSelection | null>(null);
    useEffect(() => setConfirmation(null), [ownerId]);
    const requestChange = (plan: "free" | "keep") => {
        const snapshot = subscription.subscription;
        if (snapshot?.can_manage && snapshot.change_version && snapshot.current_period_end)
            setConfirmation({
                plan,
                version: snapshot.change_version,
                effectiveAt: snapshot.current_period_end,
            });
    };
    const confirmChange = async () => {
        if (confirmation && (await subscription.change(confirmation.plan, confirmation.version))) {
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
    const openPortal = async (flow: "overview" | "customer_update" | "payment_method_update") => {
        const url = await billing.openPortal(flow);
        if (url) window.location.assign(url);
    };
    const selectedPlan = params.get("plan");
    const paidSelected = selectedPlan === "monthly" || selectedPlan === "annual";
    const addMethod = async () => {
        const setup = await billing.startCard();
        if (setup) setCardSetup(setup);
    };
    const pageErrors = [
        ...new Set(
            [
                editingProfile || cardSetup || removeMethod ? null : billing.error,
                confirmation ? null : subscription.error,
            ]
                .filter((key): key is string => !!key)
                .map((key) => t(key)),
        ),
    ];
    return (
        <>
            <header className="settings-content-card__header">
                <h1>{t("billing.title")}</h1>
                <p>{t("billing.subtitle")}</p>
            </header>
            <div className="settings-general-content billing-settings">
                {pageErrors.length > 0 && (
                    <div className="billing-feedback">
                        <StatusCard
                            tone="error"
                            message={pageErrors.join(" ")}
                            action={
                                <Button
                                    appearance="text"
                                    disabled={
                                        billing.loading ||
                                        subscription.loading ||
                                        !billing.available
                                    }
                                    onClick={() => {
                                        void billing.reload();
                                        void subscription.reload();
                                    }}
                                >
                                    {t("billing.native.retry")}
                                </Button>
                            }
                        />
                    </div>
                )}
                <section
                    className="settings-row billing-plan-summary"
                    aria-label={t("billing.currentPlan")}
                >
                    <div>
                        <div className="billing-summary-heading">
                            <span className="billing-eyebrow">{t("billing.currentPlan")}</span>
                            {billing.config?.enabled && !billing.config.livemode && (
                                <StatusBadge tone="info">{t("billing.sandbox")}</StatusBadge>
                            )}
                        </div>
                        <h2>
                            {subscription.subscription ? (
                                t(`billing.plans.${subscription.subscription.plan}.name`)
                            ) : billing.loading || subscription.loading ? (
                                <Spinner size="sm" label={t("billing.loading")} hideLabel />
                            ) : (
                                t("billing.subscriptionStatus.unknown")
                            )}
                        </h2>
                        {!(
                            subscription.subscription?.has_subscription &&
                            subscription.subscription.status === "active"
                        ) && (
                            <p>
                                {subscription.subscription?.has_subscription
                                    ? t(
                                          `billing.subscriptionStatus.${subscription.subscription.status}`,
                                          { defaultValue: t("billing.subscriptionStatus.unknown") },
                                      )
                                    : subscription.subscription?.plan === "free"
                                      ? t("billing.freeSummary")
                                      : billing.loading || subscription.loading
                                        ? null
                                        : t("billing.subscriptionStatus.unknown")}
                            </p>
                        )}
                        {subscription.subscription?.pending_plan && (
                            <p>
                                {t("billing.manage.pending", {
                                    plan: t(
                                        `billing.plans.${subscription.subscription.pending_plan}.name`,
                                    ),
                                    date: new Date(
                                        (subscription.subscription.pending_effective_at ?? 0) *
                                            1000,
                                    ).toLocaleDateString(),
                                })}
                            </p>
                        )}
                        {subscription.subscription?.current_period_end &&
                            !subscription.subscription.pending_plan && (
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
                        {t(
                            subscription.subscription?.has_subscription
                                ? "billing.details.changePlan"
                                : "billing.changePlan",
                        )}
                    </Button>
                </section>
                {subscription.notice && subscription.notice !== "paid" && (
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
                {billing.notice && billing.notice !== "registered" && (
                    <InlineMessage tone="info">
                        {t(`billing.notices.${billing.notice}`)}
                    </InlineMessage>
                )}
                {billing.config?.enabled === false && (
                    <InlineMessage tone="info">{t("billing.disabled")}</InlineMessage>
                )}
                <section className="billing-section" aria-labelledby="billing-history-title">
                    <header className="section-action-header">
                        <h2 id="billing-history-title">{t("billing.history")}</h2>
                        <Button
                            appearance="text"
                            disabled={
                                !billing.profile?.portal_enabled ||
                                billing.busy ||
                                !billing.available
                            }
                            onClick={() => void openPortal("overview")}
                        >
                            {t("billing.details.viewAll")}
                            <ChevronRight aria-hidden="true" />
                        </Button>
                    </header>
                    <div className="settings-row billing-records">
                        {billing.loading ? (
                            <Spinner label={t("billing.loading")} hideLabel />
                        ) : billing.invoices?.items.length ? (
                            billing.invoices.items.map((invoice) => (
                                <div className="billing-invoice" key={invoice.id}>
                                    <span>{invoice.number ?? t("billing.details.invoice")}</span>
                                    <time>
                                        {new Date(invoice.created * 1000).toLocaleDateString()}
                                    </time>
                                    <StatusBadge tone="info">
                                        {t(`billing.details.status.${invoice.status}`, {
                                            defaultValue: invoice.status,
                                        })}
                                    </StatusBadge>
                                    <span>
                                        {new Intl.NumberFormat(undefined, {
                                            style: "currency",
                                            currency: invoice.currency,
                                        }).format(
                                            invoice.currency === "krw"
                                                ? invoice.amount
                                                : invoice.amount / 100,
                                        )}
                                    </span>
                                    {invoice.url && (
                                        <Button
                                            appearance="text"
                                            aria-label={t("billing.details.receipt")}
                                            onClick={() => {
                                                const url = new URL(invoice.url!);
                                                if (
                                                    url.protocol === "https:" &&
                                                    [
                                                        "invoice.stripe.com",
                                                        "pay.stripe.com",
                                                    ].includes(url.hostname)
                                                )
                                                    window.open(
                                                        url.href,
                                                        "_blank",
                                                        "noopener,noreferrer",
                                                    );
                                            }}
                                        >
                                            <ChevronRight aria-hidden="true" />
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="billing-empty">
                                <ReceiptText aria-hidden="true" />
                                <p>{t("billing.details.noInvoices")}</p>
                            </div>
                        )}
                    </div>
                </section>
                <section className="billing-section" aria-labelledby="billing-info-title">
                    <header className="section-action-header">
                        <h2 id="billing-info-title">{t("billing.info")}</h2>
                        <Button
                            appearance="text"
                            disabled={
                                !billing.config?.enabled ||
                                billing.loading ||
                                billing.busy ||
                                !billing.available
                            }
                            onClick={() => {
                                billing.clearError();
                                setEditingProfile(true);
                            }}
                        >
                            {t("billing.details.edit")}
                        </Button>
                    </header>
                    <div className="settings-row billing-records">
                        {billing.loading ? (
                            <Spinner label={t("billing.loading")} hideLabel />
                        ) : (
                            <>
                                <div className="billing-detail">
                                    <span className="billing-eyebrow">
                                        {t("billing.accountEmail")}
                                    </span>
                                    <p>{billing.profile?.email ?? email}</p>
                                </div>
                                <div className="billing-detail">
                                    <span className="billing-eyebrow">
                                        {t("billing.details.name")}
                                    </span>
                                    <p>{billing.profile?.name ?? t("billing.details.notSet")}</p>
                                </div>
                                <div className="billing-detail">
                                    <span className="billing-eyebrow">
                                        {t("billing.details.address")}
                                    </span>
                                    <p>
                                        {billing.profile?.address?.length
                                            ? billing.profile.address.join(", ")
                                            : t("billing.details.notSet")}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </section>
                <section className="billing-section" aria-labelledby="billing-methods-title">
                    <header className="section-action-header">
                        <h2 id="billing-methods-title">{t("billing.methods")}</h2>
                        <div className="billing-section__actions">
                            <Button
                                appearance="text"
                                loading={billing.busy}
                                disabled={
                                    !billing.available ||
                                    !billing.config?.enabled ||
                                    !billing.config?.publishable_key ||
                                    billing.loading
                                }
                                onClick={() => void addMethod()}
                            >
                                <Plus aria-hidden="true" />
                                {t("billing.native.addCard")}
                            </Button>
                        </div>
                    </header>
                    {!billing.config?.publishable_key && billing.config?.enabled && (
                        <InlineMessage tone="info">
                            {t("billing.native.cardUnavailable")}
                        </InlineMessage>
                    )}
                    {billing.loading ? (
                        <div className="settings-row billing-loading">
                            <Spinner label={t("billing.loading")} hideLabel />
                        </div>
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
                    {billing.methods.card.items.length + billing.methods.link.items.length > 0 && (
                        <div className="settings-row billing-method-list">
                            {(["card", "link"] as const)
                                .filter(
                                    (type) =>
                                        billing.methods[type].items.length > 0 ||
                                        billing.methods[type].has_more,
                                )
                                .map((type) => (
                                    <div key={type} className="billing-method-group">
                                        {billing.methods[type].items.map((method) => (
                                            <article className="billing-method" key={method.id}>
                                                <span className="billing-method__icon">
                                                    {type === "card" ? (
                                                        <CreditCard aria-hidden="true" />
                                                    ) : (
                                                        <img
                                                            className="billing-link-logo"
                                                            src="/payment-brands/link.svg"
                                                            alt=""
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                </span>
                                                <div>
                                                    <h3>
                                                        {type === "link"
                                                            ? "Link"
                                                            : method.brand
                                                              ? method.brand
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                method.brand.slice(1)
                                                              : t("billing.card")}
                                                    </h3>
                                                    <p>
                                                        {type === "link"
                                                            ? t("billing.native.linkWallet")
                                                            : `•••• ${method.last4 ?? ""} · ${t(
                                                                  "billing.expiry",
                                                                  {
                                                                      month: String(
                                                                          method.exp_month ?? "",
                                                                      ).padStart(2, "0"),
                                                                      year: method.exp_year ?? "",
                                                                  },
                                                              )}`}
                                                    </p>
                                                </div>
                                                <div className="billing-method-actions">
                                                    {billing.profile?.default_payment_method ===
                                                        method.id && (
                                                        <StatusBadge tone="info">
                                                            {t("billing.details.default")}
                                                        </StatusBadge>
                                                    )}
                                                    <DropdownMenu
                                                        compact
                                                        label={t("billing.details.manageMethod")}
                                                        triggerLabel="···"
                                                        disabled={
                                                            billing.loading ||
                                                            billing.busy ||
                                                            !billing.available
                                                        }
                                                        items={[
                                                            ...(billing.profile
                                                                ?.default_payment_method !==
                                                            method.id
                                                                ? [
                                                                      {
                                                                          id: "default",
                                                                          icon: <Check />,
                                                                          label: t(
                                                                              "billing.native.setDefault",
                                                                          ),
                                                                      },
                                                                  ]
                                                                : []),
                                                            {
                                                                id: "remove",
                                                                icon: <Trash2 />,
                                                                tone: "danger",
                                                                label: t("billing.native.remove"),
                                                            },
                                                        ]}
                                                        onSelect={(action) => {
                                                            billing.clearError();
                                                            if (action === "remove")
                                                                setRemoveMethod(method.id);
                                                            else
                                                                void billing
                                                                    .manageMethod(
                                                                        method.id,
                                                                        "default",
                                                                    )
                                                                    .then((result) => {
                                                                        if (result)
                                                                            showToast(
                                                                                t(
                                                                                    "billing.native.defaultSaved",
                                                                                ),
                                                                            );
                                                                    });
                                                        }}
                                                    />
                                                </div>
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
                                                    type:
                                                        type === "card"
                                                            ? t("billing.card")
                                                            : "Link",
                                                })}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </section>
                {subscription.subscription && (
                    <section
                        className={
                            subscription.subscription.has_subscription
                                ? "settings-account-delete"
                                : "settings-row billing-plan-footer"
                        }
                    >
                        <div>
                            <h2>
                                {t(
                                    subscription.subscription.has_subscription
                                        ? "billing.details.cancelPlan"
                                        : "billing.noSubscription",
                                )}
                            </h2>
                            <p>
                                {t(
                                    subscription.subscription.has_subscription
                                        ? "billing.details.cancelHint"
                                        : "billing.noSubscriptionHint",
                                )}
                            </p>
                        </div>
                        {subscription.subscription.has_subscription && (
                            <ModalButton
                                variant={
                                    subscription.subscription.pending_plan ? "cancel" : "danger"
                                }
                                disabled={
                                    !subscription.subscription.can_manage ||
                                    subscription.busy ||
                                    !subscription.available
                                }
                                onClick={() =>
                                    requestChange(
                                        subscription.subscription?.pending_plan ? "keep" : "free",
                                    )
                                }
                            >
                                {t(
                                    subscription.subscription.pending_plan
                                        ? "billing.manage.undo"
                                        : "billing.details.cancel",
                                )}
                            </ModalButton>
                        )}
                    </section>
                )}
            </div>
            {billing.config?.enabled && (
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
            {editingProfile && (
                <BillingProfileDialog
                    publicKey={billing.config?.publishable_key}
                    profile={billing.profile}
                    email={email}
                    busy={billing.busy}
                    error={billing.error}
                    onClose={() => setEditingProfile(false)}
                    onSave={async (draft) => {
                        if (await billing.saveProfile(draft)) {
                            setEditingProfile(false);
                            showToast(t("billing.native.profileSaved"));
                        }
                    }}
                />
            )}
            {cardSetup && billing.config?.publishable_key && (
                <Suspense fallback={<Spinner label={t("billing.loading")} hideLabel />}>
                    <BillingCardDialog
                        setup={cardSetup}
                        publicKey={billing.config.publishable_key}
                        error={billing.error}
                        onClose={() => setCardSetup(null)}
                        onRegistered={async (id) => {
                            const result = await billing.finishCard(id);
                            if (result?.registered) {
                                setCardSetup(null);
                                showToast(t("billing.notices.registered"));
                                return true;
                            }
                            return false;
                        }}
                    />
                </Suspense>
            )}
            <Modal
                open={!!removeMethod}
                size="compact"
                title={t("billing.native.removeTitle")}
                description={t("billing.native.removeHint")}
                onClose={() => {
                    if (!billing.busy) setRemoveMethod(null);
                }}
                footer={
                    <>
                        <ModalButton
                            variant="cancel"
                            disabled={billing.busy}
                            onClick={() => setRemoveMethod(null)}
                        >
                            {t("billing.manage.cancel")}
                        </ModalButton>
                        <ModalButton
                            variant="danger"
                            loading={billing.busy}
                            onClick={async () => {
                                if (
                                    removeMethod &&
                                    (await billing.manageMethod(removeMethod, "remove"))
                                ) {
                                    setRemoveMethod(null);
                                    showToast(t("billing.native.removed"));
                                }
                            }}
                        >
                            {t("billing.native.remove")}
                        </ModalButton>
                    </>
                }
            >
                {removeMethod && billing.error && <InlineMessage>{t(billing.error)}</InlineMessage>}
            </Modal>
            <PlanChangeDialog
                selection={confirmation}
                busy={subscription.busy}
                error={subscription.error}
                onClose={() => setConfirmation(null)}
                onConfirm={() => void confirmChange()}
            />
        </>
    );
}
