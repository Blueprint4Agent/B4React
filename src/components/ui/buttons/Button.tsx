import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    loading?: boolean;
    appearance?: "default" | "pill" | "pill-secondary";
};

export function Button({
    children,
    className,
    type = "button",
    loading = false,
    appearance = "default",
    disabled,
    ...props
}: ButtonProps) {
    const nextClassName = `ui-button${appearance !== "default" ? ` ui-button--${appearance}` : ""}${className ? ` ${className}` : ""}`;
    const isDisabled = Boolean(disabled || loading);

    return (
        <button type={type} className={nextClassName} disabled={isDisabled} {...props}>
            <span className="ui-button__content">
                {loading ? <span className="ui-button__spinner" aria-hidden="true" /> : null}
                <span className="ui-button__label">{children}</span>
            </span>
        </button>
    );
}
