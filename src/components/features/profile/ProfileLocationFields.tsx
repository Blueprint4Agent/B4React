import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DropdownMenu } from "../../ui";
import { profileLocationOptions } from "../../../utils/profileLocation";

export function ProfileLocationFields({
    value,
    busy,
    onChange,
}: {
    value: string;
    busy: boolean;
    onChange: (value: string) => void;
}) {
    const { t, i18n } = useTranslation();
    const language = i18n.resolvedLanguage ?? "en";
    const country = value.split(":")[0];
    const options = useMemo(() => profileLocationOptions(language, country), [language, country]);
    return (
        <>
            <DropdownMenu
                floating
                fieldLabel={t("settings.profile.country")}
                label={t("settings.profile.country")}
                triggerLabel={
                    options.countryItems.find((item) => item.id === country)?.label ??
                    t("settings.profile.notSet")
                }
                items={[{ id: "", label: t("settings.profile.notSet") }, ...options.countryItems]}
                disabled={busy}
                onSelect={(id) => onChange(id ? `${id}:` : "")}
            />
            <DropdownMenu
                floating
                fieldLabel={t("settings.profile.region")}
                label={t("settings.profile.region")}
                triggerLabel={
                    options.regionItems.find((item) => item.id === value)?.label ??
                    t("settings.profile.selectRegion")
                }
                items={options.regionItems}
                disabled={busy || !country}
                onSelect={onChange}
            />
        </>
    );
}
