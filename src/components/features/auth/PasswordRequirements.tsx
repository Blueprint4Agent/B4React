import { useTranslation } from "react-i18next";
import { ValidationCard } from "../../ui";

export function PasswordRequirements({ password }: { password: string }) {
    const { t } = useTranslation();
    const rules = [
        {
            label: t("signup.rules.password.length"),
            isValid: password.length >= 8 && password.length <= 24,
        },
        {
            label: t("signup.rules.password.upper"),
            isValid: /[A-Z]/.test(password),
        },
        {
            label: t("signup.rules.password.number"),
            isValid: /\d/.test(password),
        },
        {
            label: t("signup.rules.password.symbol"),
            isValid: /[^A-Za-z0-9]/.test(password),
        },
        {
            label: t("signup.rules.password.noSpace"),
            isValid: !/\s/.test(password) && password.length > 0,
        },
    ];
    return <ValidationCard title={t("signup.validation.password")} rules={rules} />;
}

export function PasswordConfirmationRequirements({
    password,
    confirmation,
}: {
    password: string;
    confirmation: string;
}) {
    const { t } = useTranslation();
    return (
        <ValidationCard
            title={t("signup.validation.confirm")}
            rules={[
                {
                    label: t("signup.rules.confirm.match"),
                    isValid: confirmation.length > 0 && confirmation === password,
                },
            ]}
        />
    );
}
