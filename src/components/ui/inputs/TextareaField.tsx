import { useId, type TextareaHTMLAttributes } from "react";

type TextareaFieldProps = Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange"
> & {
    label: string;
    autoGrow?: boolean;
    value: string;
    onValueChange: (value: string) => void;
};

export function TextareaField({
    label,
    value,
    onValueChange,
    id,
    autoGrow = false,
    ...props
}: TextareaFieldProps) {
    const fieldId = useId();
    return (
        <label className="form-field" htmlFor={id ?? fieldId}>
            {label}
            <span className={autoGrow ? "textarea-autogrow" : undefined}>
                {autoGrow ? (
                    <span className="textarea-autogrow__mirror" aria-hidden="true">
                        {value + " "}
                    </span>
                ) : null}
                <textarea
                    aria-label={label}
                    {...props}
                    id={id ?? fieldId}
                    value={value}
                    onChange={(event) => onValueChange(event.target.value)}
                />
            </span>
        </label>
    );
}
