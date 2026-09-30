import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuId = useId();
    const visible = open && !disabled;
    const modalRoot = visible ? rootRef.current?.closest<HTMLElement>(".ui-modal") : null;
    const nextClassName = ["ui-dropdown", fieldLabel && "ui-dropdown--field", className]
        .filter(Boolean)
        .join(" ");

    useLayoutEffect(() => {
        if (!visible || !modalRoot) return;
        const trigger = triggerRef.current;
        const menu = menuRef.current;
        if (!trigger || !menu) return;
        const update = () => {
            const rect = trigger.getBoundingClientRect();
            const edge = 8;
            const gap = 4;
            const viewportWidth = document.documentElement.clientWidth;
            const viewportHeight = document.documentElement.clientHeight;
            const below = Math.max(0, viewportHeight - rect.bottom - gap - edge);
            const above = Math.max(0, rect.top - gap - edge);
            const width = Math.min(rect.width, viewportWidth - edge * 2);
            menu.style.width = `${width}px`;
            // Measure natural content before choosing the side; an earlier cap must not bias it.
            menu.style.maxHeight = "none";
            const naturalHeight = menu.offsetHeight;
            const up = naturalHeight > below && above > below;
            menu.style.maxHeight = `${up ? above : below}px`;
            const height = menu.offsetHeight;
            menu.style.left = `${Math.max(edge, Math.min(rect.left, viewportWidth - width - edge))}px`;
            menu.style.top = `${Math.max(edge, up ? rect.top - height - gap : rect.bottom + gap)}px`;
            menu.dataset.side = up ? "top" : "bottom";
            // Dismiss when scrolling has fully hidden the anchor inside its modal body.
            const body = trigger.closest(".ui-modal__body")?.getBoundingClientRect();
            if (body && (rect.bottom <= body.top || rect.top >= body.bottom)) setOpen(false);
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(trigger);
        observer.observe(menu);
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [visible, modalRoot, items]);

    useEffect(() => {
        if (!visible) return;

        const onPointerDown = (event: MouseEvent) => {
            if (
                !rootRef.current?.contains(event.target as Node) &&
                !menuRef.current?.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                setOpen(false);
                triggerRef.current?.focus({ preventScroll: true });
            }
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [visible]);

    const menu = visible ? (
        <div
            ref={menuRef}
            id={menuId}
            className={
                modalRoot ? "ui-dropdown__menu ui-dropdown__menu--floating" : "ui-dropdown__menu"
            }
            role="menu"
            aria-label={label}
        >
            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    className="ui-dropdown__item"
                    role="menuitem"
                    onClick={() => {
                        onSelect?.(item.id);
                        setOpen(false);
                        triggerRef.current?.focus({ preventScroll: true });
                    }}
                >
                    {item.label}
                </button>
            ))}
        </div>
    ) : null;

    return (
        <div className={nextClassName} ref={rootRef}>
            {fieldLabel && <span className="ui-dropdown__field-label">{fieldLabel}</span>}
            <button
                type="button"
                ref={triggerRef}
                className="ui-dropdown__trigger"
                disabled={disabled}
                aria-label={fieldLabel ? `${fieldLabel}: ${triggerLabel}` : undefined}
                aria-haspopup="menu"
                aria-expanded={visible}
                aria-controls={visible ? menuId : undefined}
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
            {menu && (modalRoot ? createPortal(menu, modalRoot) : menu)}
        </div>
    );
}
