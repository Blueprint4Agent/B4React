import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Ellipsis } from "lucide-react";

type DropdownItem = {
    id: string;
    label: string;
    icon?: ReactNode;
    tone?: "danger";
};

type DropdownMenuProps = {
    className?: string;
    compact?: boolean;
    disabled?: boolean;
    fieldLabel?: string;
    items: DropdownItem[];
    label?: string;
    onSelect?: (id: string) => void;
    triggerLabel: string;
};

export function DropdownMenu({
    className,
    compact = false,
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
    const portalRoot = modalRoot || (visible && compact ? document.body : null);
    const nextClassName = [
        "ui-dropdown",
        compact && "ui-dropdown--compact",
        fieldLabel && "ui-dropdown--field",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    useLayoutEffect(() => {
        if (!visible || !portalRoot) return;
        const trigger = triggerRef.current;
        const menu = menuRef.current;
        if (!trigger || !menu) return;
        const update = () => {
            const scrollTop = menu.scrollTop;
            const rect = trigger.getBoundingClientRect();
            const edge = 8;
            const gap = 4;
            const viewportWidth = document.documentElement.clientWidth;
            const viewportHeight = document.documentElement.clientHeight;
            const below = Math.max(0, viewportHeight - rect.bottom - gap - edge);
            const above = Math.max(0, rect.top - gap - edge);
            menu.style.width = compact ? "max-content" : `${rect.width}px`;
            const width = Math.min(
                compact ? menu.offsetWidth : rect.width,
                viewportWidth - edge * 2,
            );
            menu.style.width = `${width}px`;
            // Measure all content without removing the cap: expansion would reset scrollTop.
            const naturalHeight = menu.scrollHeight + menu.offsetHeight - menu.clientHeight;
            const up = naturalHeight > below && above > below;
            menu.style.maxHeight = `${up ? above : below}px`;
            const height = menu.offsetHeight;
            menu.style.left = `${Math.max(edge, Math.min(rect.left, viewportWidth - width - edge))}px`;
            menu.style.top = `${Math.max(edge, up ? rect.top - height - gap : rect.bottom + gap)}px`;
            menu.dataset.side = up ? "top" : "bottom";
            menu.scrollTop = scrollTop;
            // Dismiss when scrolling has fully hidden the anchor inside its modal body.
            const body = trigger.closest(".ui-modal__body")?.getBoundingClientRect();
            if (body && (rect.bottom <= body.top || rect.top >= body.bottom)) setOpen(false);
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(trigger);
        observer.observe(menu);
        const onScroll = (event: Event) => {
            // Internal list scrolling does not move the trigger or require repositioning.
            if (event.target instanceof Node && menu.contains(event.target)) return;
            update();
        };
        window.addEventListener("resize", update);
        window.addEventListener("scroll", onScroll, true);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", onScroll, true);
        };
    }, [visible, portalRoot, compact, items]);

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
            className={[
                "ui-dropdown__menu",
                portalRoot && "ui-dropdown__menu--floating",
                compact && "ui-dropdown__menu--actions",
            ]
                .filter(Boolean)
                .join(" ")}
            role="menu"
            aria-label={label}
        >
            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    className={[
                        "ui-dropdown__item",
                        item.tone === "danger" && "ui-dropdown__item--danger",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                    role="menuitem"
                    onClick={() => {
                        onSelect?.(item.id);
                        setOpen(false);
                        triggerRef.current?.focus({ preventScroll: true });
                    }}
                >
                    {item.icon && (
                        <span className="ui-dropdown__item-icon" aria-hidden="true">
                            {item.icon}
                        </span>
                    )}
                    <span>{item.label}</span>
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
                aria-label={
                    fieldLabel ? `${fieldLabel}: ${triggerLabel}` : compact ? label : undefined
                }
                aria-haspopup="menu"
                aria-expanded={visible}
                aria-controls={visible ? menuId : undefined}
                onClick={() => setOpen((prev) => !prev)}
            >
                {compact ? <Ellipsis aria-hidden="true" /> : <span>{triggerLabel}</span>}
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
            {menu && (portalRoot ? createPortal(menu, portalRoot) : menu)}
        </div>
    );
}
