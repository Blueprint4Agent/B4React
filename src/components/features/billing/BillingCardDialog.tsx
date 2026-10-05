import { useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import { useTranslation } from "react-i18next";
import { Modal, ModalButton, InlineMessage, Spinner } from "../../ui";
import type { BillingCardSetup } from "../../../api/billing/billingApi";
const clients = new Map<string, ReturnType<typeof loadStripe>>();
function stripeClient(key: string) {
    if (!clients.has(key)) clients.set(key, loadStripe(key));
    return clients.get(key)!;
}
type Props = {
    setup: BillingCardSetup;
    publicKey: string;
    error: string | null;
    onClose: () => void;
    onRegistered: (id: string) => Promise<boolean>;
};
export default function BillingCardDialog(props: Props) {
    const [dark] = useState(
        () =>
            document.documentElement.dataset.theme === "dark" ||
            (document.documentElement.dataset.theme !== "light" &&
                matchMedia("(prefers-color-scheme: dark)").matches),
    );
    const options = useMemo(
        () => ({
            clientSecret: props.setup.client_secret,
            appearance: { theme: dark ? ("night" as const) : ("stripe" as const) },
            locale: "auto" as const,
        }),
        [props.setup.client_secret, dark],
    );
    return (
        <Elements stripe={stripeClient(props.publicKey)} options={options}>
            <CardForm {...props} />
        </Elements>
    );
}
function CardForm({ setup, error, onClose, onRegistered }: Props) {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const [busy, setBusy] = useState(false);
    const [ready, setReady] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    async function submit() {
        if (!stripe || !elements || busy) return;
        setBusy(true);
        setMessage(null);
        try {
            if (confirmed) {
                if (!(await onRegistered(setup.id))) setMessage(t("billing.native.verifyPending"));
                return;
            }
            const returnUrl = new URL(window.location.href);
            returnUrl.search = "";
            returnUrl.hash = "";
            returnUrl.searchParams.set("section", "billing");
            returnUrl.searchParams.set("billing_card_setup", setup.id);
            const result = await stripe.confirmSetup({
                elements,
                confirmParams: { return_url: returnUrl.href },
                redirect: "if_required",
            });
            if (result.error) setMessage(result.error.message ?? t("billing.errors.unknown"));
            else if (result.setupIntent?.status === "succeeded") {
                setConfirmed(true);
                if (!(await onRegistered(setup.id))) setMessage(t("billing.native.verifyPending"));
            } else setMessage(t("billing.native.verifyPending"));
        } catch {
            setMessage(t("billing.errors.unknown"));
        } finally {
            setBusy(false);
        }
    }
    return (
        <Modal
            open
            size="compact"
            title={t("billing.native.addCard")}
            description={t("billing.registrationOnly")}
            keyboardDismissible
            onClose={() => {
                if (!busy) onClose();
            }}
            footer={
                <>
                    <ModalButton variant="cancel" disabled={busy} onClick={onClose}>
                        {t("billing.manage.cancel")}
                    </ModalButton>
                    <ModalButton
                        loading={busy}
                        disabled={!stripe || !ready}
                        onClick={() => void submit()}
                    >
                        {t("billing.native.saveCard")}
                    </ModalButton>
                </>
            }
        >
            {!ready && <Spinner label={t("billing.loading")} hideLabel />}
            <PaymentElement
                onReady={() => setReady(true)}
                onLoadError={() => setMessage(t("billing.errors.unknown"))}
                options={{ layout: "tabs" }}
            />
            {(message || error) && <InlineMessage>{message ?? t(error!)}</InlineMessage>}
        </Modal>
    );
}
