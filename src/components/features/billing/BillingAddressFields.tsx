import { useEffect, useMemo, useState } from "react";
import { AddressElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import type {
    StripeAddressElement,
    StripeAddressElementOptions,
    StripeElementsOptions,
} from "@stripe/stripe-js";
import { useTranslation } from "react-i18next";
import type { BillingProfileForm } from "../../../api/billing/billingApi";

type AddressValue = Pick<BillingProfileForm, "name" | "address">;
type Props = {
    publicKey: string;
    draft: AddressValue;
    onReady: (element: StripeAddressElement) => void;
    onChange: (value: AddressValue) => void;
    onError: () => void;
};
const clients = new Map<string, ReturnType<typeof loadStripe>>();
function stripeClient(key: string) {
    if (!clients.has(key)) {
        const client = loadStripe(key)
            .then((stripe) => {
                if (!stripe) clients.delete(key);
                return stripe;
            })
            .catch(() => {
                clients.delete(key);
                return null;
            });
        clients.set(key, client);
    }
    return clients.get(key)!;
}

export default function BillingAddressFields({
    publicKey,
    draft,
    onReady,
    onChange,
    onError,
}: Props) {
    const { i18n } = useTranslation();
    const client = useMemo(() => stripeClient(publicKey), [publicKey]);
    useEffect(() => {
        let active = true;
        void client
            .then((stripe) => {
                if (!stripe && active) onError();
            })
            .catch(() => {
                if (active) onError();
            });
        return () => {
            active = false;
        };
    }, [client, onError]);
    const [options] = useState<StripeElementsOptions>(() => {
        const style = getComputedStyle(document.documentElement);
        const token = (name: string) => style.getPropertyValue(name).trim();
        return {
            locale: i18n.language.startsWith("ko") ? "ko" : "en",
            appearance: {
                theme:
                    document.documentElement.dataset.theme === "dark" ||
                    (document.documentElement.dataset.theme !== "light" &&
                        matchMedia("(prefers-color-scheme: dark)").matches)
                        ? "night"
                        : "stripe",
                variables: {
                    colorPrimary: token("--accent"),
                    colorBackground: token("--input-bg"),
                    colorText: token("--text"),
                    colorTextSecondary: token("--text-soft"),
                    colorDanger: token("--error-text"),
                    fontFamily: token("--font-family"),
                    fontSizeBase: token("--font-size"),
                    borderRadius: token("--radius-control"),
                    spacingUnit: token("--space-1"),
                },
                rules: {
                    ".Input": {
                        border: `1px solid ${token("--input-border")}`,
                        boxShadow: "none",
                        backgroundColor: token("--input-bg"),
                        color: token("--text"),
                    },
                },
            },
        };
    });
    const [addressOptions] = useState<StripeAddressElementOptions>(() => ({
        mode: "billing",
        autocomplete: { mode: "disabled" },
        defaultValues: {
            name: draft.name,
            address: { ...draft.address, country: draft.address.country ?? "" },
        },
    }));
    return (
        <Elements stripe={client} options={options}>
            <AddressElement
                options={addressOptions}
                onReady={onReady}
                onChange={(event) =>
                    onChange({
                        name: event.value.name,
                        address: { ...event.value.address, line2: event.value.address.line2 ?? "" },
                    })
                }
                onLoadError={onError}
            />
        </Elements>
    );
}
