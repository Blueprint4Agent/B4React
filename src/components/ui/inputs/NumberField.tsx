import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../buttons/Button";
import { InputField } from "./InputField";

type NumberFieldProps = {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    disabled?: boolean;
};
export function NumberField({
    label,
    value,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    unit,
    disabled = false,
}: NumberFieldProps) {
    const { t } = useTranslation();
    const current = value.trim() === "" ? min : Number(value);
    const change = (direction: number): void => {
        const next = Math.max(
            min,
            Math.min(max, (Number.isFinite(current) ? current : min) + step * direction),
        );
        onValueChange(String(Number(next.toFixed(3))));
    };
    return (
        <div className="number-field">
            <InputField
                label={label}
                type="number"
                value={value}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                onValueChange={onValueChange}
            />
            <div className="number-field__controls">
                {unit && <span className="number-field__unit">{unit}</span>}
                <Button
                    className="number-field__step"
                    aria-label={t("numberField.decrease", { label })}
                    disabled={disabled || current <= min}
                    onClick={() => change(-1)}
                >
                    <Minus size={12} aria-hidden="true" />
                </Button>
                <Button
                    className="number-field__step"
                    aria-label={t("numberField.increase", { label })}
                    disabled={disabled || current >= max}
                    onClick={() => change(1)}
                >
                    <Plus size={12} aria-hidden="true" />
                </Button>
            </div>
        </div>
    );
}
