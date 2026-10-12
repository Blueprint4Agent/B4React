import { useEffect, useId, useRef } from "react";

type FormCheckboxProps = {
    checked: boolean;
    disabled?: boolean;
    indeterminate?: boolean;
    hideLabel?: boolean;
    className?: string;
    id?: string;
    label: string;
    onCheckedChange: (checked: boolean) => void;
};

export function FormCheckbox({
    checked,
    disabled = false,
    indeterminate = false,
    hideLabel = false,
    className,
    id,
    label,
    onCheckedChange,
}: FormCheckboxProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    }, [indeterminate]);
    const fieldId = useId();
    const inputId = id ?? fieldId;
    const nextClassName = className ? `checkbox ${className}` : "checkbox";

    return (
        <label className={nextClassName} htmlFor={inputId}>
            <input
                ref={inputRef}
                disabled={disabled}
                className="checkbox__input"
                id={inputId}
                type="checkbox"
                checked={checked}
                onChange={(event) => onCheckedChange(event.target.checked)}
            />
            <span className="checkbox__control" aria-hidden="true" />
            <span className={hideLabel ? "sr-only" : "checkbox__label"}>{label}</span>
        </label>
    );
}
