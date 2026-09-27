import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type DropdownItem = {
    id: string;
    label: string;
};

type DropdownMenuProps = {
    className?: string;
    disabled?: boolean;
    fieldLabel?: string;
    items: DropdownItem[];
    label?: string;
    onSelect?: (id: string) => void;
    triggerLabel: string;
};

export function DropdownMenu({
    className,
    disabled = false,
    fieldLabel,
    items,
    label = "Dropdown menu",
    onSelect,
    triggerLabel,
}: DropdownMenuProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const nextClassName = ["ui-dropdown", fieldLabel && "ui-dropdown--field", className]
        .filter(Boolean)
        .join(" ");

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <div className={nextClassName} ref={rootRef}>
            {fieldLabel && <span className="ui-dropdown__field-label">{fieldLabel}</span>}
            <button
                type="button"
                className="ui-dropdown__trigger"
                disabled={disabled}
                aria-label={fieldLabel ? `${fieldLabel}: ${triggerLabel}` : undefined}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
            >
                <span>{triggerLabel}</span>
                <span
                    className={
                        open
                            ? "ui-dropdown__trigger-icon ui-dropdown__trigger-icon--open"
                            : "ui-dropdown__trigger-icon"
                    }
                    aria-hidden="true"
                >
                    <ChevronDown />
                </span>
            </button>
            {open && !disabled ? (
                <div className="ui-dropdown__menu" role="menu" aria-label={label}>
                    {items.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className="ui-dropdown__item"
                            role="menuitem"
                            onClick={() => {
                                onSelect?.(item.id);
                                setOpen(false);
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
