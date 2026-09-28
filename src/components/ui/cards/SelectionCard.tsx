import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "../buttons/Button";

type SelectionCardProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & {
    selected: boolean;
    children: ReactNode;
};

/** Controlled option button; the consumer owns single- or multi-selection rules. */
export function SelectionCard({ selected, children, className, ...props }: SelectionCardProps) {
    return (
        <Button
            {...props}
            className={`selection-card${className ? ` ${className}` : ""}`}
            aria-pressed={selected}
        >
            {children}
        </Button>
    );
}
