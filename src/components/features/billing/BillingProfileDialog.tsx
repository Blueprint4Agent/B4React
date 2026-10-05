import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalButton, InputField, InlineMessage, DropdownMenu } from "../../ui";
import type { BillingProfile, BillingProfileForm } from "../../../api/billing/billingApi";

type Draft = Omit<BillingProfileForm, "request_id">;
type Props = {
    profile: BillingProfile | null;
    email: string;
    busy: boolean;
    error: string | null;
    onClose: () => void;
    onSave: (draft: Draft) => Promise<unknown>;
};
export function BillingProfileDialog({ profile, email, busy, error, onClose, onSave }: Props) {
    const { t, i18n } = useTranslation();
    const names = new Intl.DisplayNames([i18n.language], { type: "region" });
    const countries =
        "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW"
            .split(" ")
            .map((id) => ({ id, label: names.of(id) ?? id }));
    const [draft, setDraft] = useState<Draft>(() => ({
        email: profile?.email ?? email,
        name: profile?.name ?? "",
        address: {
            country: "",
            city: "",
            state: "",
            line1: "",
            line2: "",
            postal_code: "",
            ...profile?.address_fields,
        },
    }));
    return (
        <Modal
            open
            title={t("billing.native.editTitle")}
            size="compact"
            keyboardDismissible
            onClose={() => {
                if (!busy) onClose();
            }}
            footer={
                <>
                    <ModalButton variant="cancel" disabled={busy} onClick={onClose}>
                        {t("billing.manage.cancel")}
                    </ModalButton>
                    <ModalButton type="submit" form="billing-profile-form" loading={busy}>
                        {t("billing.native.save")}
                    </ModalButton>
                </>
            }
        >
            <form
                id="billing-profile-form"
                className="billing-profile-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!busy) void onSave(draft);
                }}
            >
                <InputField
                    label={t("billing.native.email")}
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={255}
                    value={draft.email}
                    onValueChange={(email) => setDraft({ ...draft, email })}
                    disabled={busy}
                />
                <InputField
                    label={t("billing.details.name")}
                    autoComplete="name"
                    required
                    maxLength={150}
                    value={draft.name}
                    onValueChange={(name) => setDraft({ ...draft, name })}
                    disabled={busy}
                />
                <div className="form-field">
                    <span>{t("billing.native.country")}</span>
                    <DropdownMenu
                        label={t("billing.native.country")}
                        triggerLabel={
                            draft.address.country
                                ? (names.of(draft.address.country) ?? draft.address.country)
                                : t("billing.native.selectCountry")
                        }
                        items={countries}
                        disabled={busy}
                        onSelect={(country) =>
                            setDraft({ ...draft, address: { ...draft.address, country } })
                        }
                    />
                </div>
                {(["state", "city", "line1", "line2", "postal_code"] as const).map((field) => (
                    <InputField
                        key={field}
                        label={t(`billing.native.${field}`)}
                        value={draft.address[field] ?? ""}
                        maxLength={field === "postal_code" ? 20 : 100}
                        autoComplete={
                            {
                                country: "country",
                                state: "address-level1",
                                city: "address-level2",
                                line1: "address-line1",
                                line2: "address-line2",
                                postal_code: "postal-code",
                            }[field]
                        }
                        onValueChange={(value) =>
                            setDraft({ ...draft, address: { ...draft.address, [field]: value } })
                        }
                        disabled={busy}
                    />
                ))}
                {error && <InlineMessage>{t(error)}</InlineMessage>}
            </form>
        </Modal>
    );
}
