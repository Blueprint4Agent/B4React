import { Button } from "../buttons/Button";

type SegmentedControlProps = {
    label: string;
    options: readonly { value: string; label: string; accessibleLabel?: string }[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
};

export function SegmentedControl({
    label,
    options,
    value,
    onChange,
    disabled = false,
    className,
}: SegmentedControlProps) {
    return (
        <div
            className={`ui-segmented-control${className ? ` ${className}` : ""}`}
            role="group"
            aria-label={label}
        >
            {options.map((option) => (
                <Button
                    key={option.value}
                    appearance={value === option.value ? "pill" : "pill-secondary"}
                    aria-label={option.accessibleLabel}
                    aria-pressed={value === option.value}
                    disabled={disabled}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </Button>
            ))}
        </div>
    );
}
