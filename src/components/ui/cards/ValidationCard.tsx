import { Check, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";

export type ValidationRule = {
    isValid: boolean;
    label: string;
};

type ValidationCardProps = {
    rules: ValidationRule[];
    title: string;
};

export function ValidationCard({ rules, title }: ValidationCardProps) {
    const { t } = useTranslation();
    const isComplete = rules.length > 0 && rules.every((rule) => rule.isValid);

    return (
        <div
            className={`validation-card ${isComplete ? "validation-card--ok" : "validation-card--no"}`}
        >
            <div className="validation-card__title">{title}</div>
            <div className="validation-card__list">
                {rules.map((rule) => (
                    <div className="validation-card__item" key={rule.label}>
                        <span
                            className={`validation-card__mark ${
                                rule.isValid
                                    ? "validation-card__mark--ok"
                                    : "validation-card__mark--no"
                            }`}
                            aria-hidden="true"
                        >
                            {rule.isValid ? (
                                <Check className="validation-card__icon" strokeWidth={1.8} />
                            ) : (
                                <Circle className="validation-card__icon" strokeWidth={1.8} />
                            )}
                        </span>
                        <span className="validation-card__label">
                            {rule.label}
                            <span className="sr-only">
                                {" "}
                                —{" "}
                                {t(rule.isValid ? "authDialog.ruleMet" : "authDialog.rulePending")}
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
