import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { InputField } from "./InputField";
import { formatColor, parseColor, type Hsva } from "../../../utils/color";

type ColorPickerProps = {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
};
export function ColorPicker({ label, value, onValueChange, disabled = false }: ColorPickerProps) {
    const { t } = useTranslation();
    const id = useId();
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const palette = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [color, setColor] = useState<Hsva>(() => parseColor(value) ?? { h: 0, s: 0, v: 0, a: 1 });
    useEffect(() => {
        const parsed = parseColor(value);
        if (parsed)
            setColor((previous) => ({ ...parsed, h: parsed.s === 0 ? previous.h : parsed.h }));
    }, [value]);
    useLayoutEffect(() => {
        for (const element of [root.current, palette.current]) {
            const style = element?.style;
            style?.setProperty("--picker-color", formatColor(color));
            style?.setProperty("--picker-opaque", formatColor({ ...color, a: 1 }));
            style?.setProperty("--picker-hue", `hsl(${color.h} 100% 50%)`);
            style?.setProperty("--picker-x", `${color.s * 100}%`);
            style?.setProperty("--picker-y", `${(1 - color.v) * 100}%`);
        }
    }, [color, open]);
    useLayoutEffect(() => {
        if (!open) return;
        const position = () => {
            const anchor = root.current?.getBoundingClientRect();
            const popup = palette.current;
            if (!anchor || !popup) return;
            if (anchor.bottom < 0 || anchor.top > window.innerHeight) {
                setOpen(false);
                return;
            }
            popup.style.setProperty("--picker-width", `${Math.min(280, anchor.width)}px`);
            const width = popup.getBoundingClientRect().width;
            const height = popup.getBoundingClientRect().height;
            const left = Math.max(12, Math.min(anchor.left, window.innerWidth - width - 12));
            const below = anchor.bottom + 6;
            const top =
                below + height <= window.innerHeight - 12
                    ? below
                    : Math.max(12, anchor.top - height - 6);
            popup.style.setProperty("--picker-left", `${left}px`);
            popup.style.setProperty("--picker-top", `${top}px`);
        };
        const outside = (event: PointerEvent) => {
            if (
                !root.current?.contains(event.target as Node) &&
                !palette.current?.contains(event.target as Node)
            )
                setOpen(false);
        };
        position();
        const observer = new ResizeObserver(position);
        if (root.current) observer.observe(root.current);
        if (palette.current) observer.observe(palette.current);
        window.addEventListener("resize", position);
        document.addEventListener("scroll", position, true);
        document.addEventListener("pointerdown", outside);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", position);
            document.removeEventListener("scroll", position, true);
            document.removeEventListener("pointerdown", outside);
        };
    }, [open]);
    const change = (next: Hsva): void => {
        setColor(next);
        onValueChange(formatColor(next));
    };
    return (
        <div
            className="color-picker"
            ref={root}
            onKeyDown={(event) => {
                if (event.key === "Escape" && open) {
                    event.stopPropagation();
                    setOpen(false);
                    trigger.current?.focus();
                }
            }}
        >
            <div className="color-picker__field">
                <InputField
                    label={label}
                    value={value}
                    disabled={disabled}
                    onValueChange={onValueChange}
                />
                <button
                    className="color-picker__trigger"
                    type="button"
                    ref={trigger}
                    aria-label={t("colorPicker.open", { label })}
                    aria-expanded={open}
                    aria-controls={id}
                    disabled={disabled}
                    onClick={() => setOpen((current) => !current)}
                >
                    <span />
                </button>
            </div>
            {open &&
                createPortal(
                    <div
                        ref={palette}
                        id={id}
                        className="color-picker__palette color-picker__popover"
                        role="dialog"
                        aria-label={t("colorPicker.palette", { label })}
                    >
                        <div
                            className="color-picker__plane"
                            role="group"
                            tabIndex={disabled ? -1 : 0}
                            aria-label={t("colorPicker.plane")}
                            onKeyDown={(event) => {
                                if (
                                    disabled ||
                                    !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                                        event.key,
                                    )
                                )
                                    return;
                                event.preventDefault();
                                change({
                                    ...color,
                                    s: Math.max(
                                        0,
                                        Math.min(
                                            1,
                                            color.s +
                                                (event.key === "ArrowRight"
                                                    ? 0.01
                                                    : event.key === "ArrowLeft"
                                                      ? -0.01
                                                      : 0),
                                        ),
                                    ),
                                    v: Math.max(
                                        0,
                                        Math.min(
                                            1,
                                            color.v +
                                                (event.key === "ArrowUp"
                                                    ? 0.01
                                                    : event.key === "ArrowDown"
                                                      ? -0.01
                                                      : 0),
                                        ),
                                    ),
                                });
                            }}
                            onPointerDown={(event) => {
                                if (disabled) return;
                                event.currentTarget.setPointerCapture(event.pointerId);
                                const rect = event.currentTarget.getBoundingClientRect();
                                change({
                                    ...color,
                                    s: Math.max(
                                        0,
                                        Math.min(1, (event.clientX - rect.left) / rect.width),
                                    ),
                                    v: Math.max(
                                        0,
                                        Math.min(1, 1 - (event.clientY - rect.top) / rect.height),
                                    ),
                                });
                            }}
                            onPointerMove={(event) => {
                                if (
                                    disabled ||
                                    !event.currentTarget.hasPointerCapture(event.pointerId)
                                )
                                    return;
                                const rect = event.currentTarget.getBoundingClientRect();
                                change({
                                    ...color,
                                    s: Math.max(
                                        0,
                                        Math.min(1, (event.clientX - rect.left) / rect.width),
                                    ),
                                    v: Math.max(
                                        0,
                                        Math.min(1, 1 - (event.clientY - rect.top) / rect.height),
                                    ),
                                });
                            }}
                            onPointerUp={(event) => {
                                if (event.currentTarget.hasPointerCapture(event.pointerId))
                                    event.currentTarget.releasePointerCapture(event.pointerId);
                            }}
                        >
                            <span />
                        </div>
                        {(["h", "a"] as const).map((key) => (
                            <input
                                key={key}
                                className={`color-picker__slider color-picker__slider--${key}`}
                                type="range"
                                aria-label={t(`colorPicker.${key}`)}
                                min="0"
                                max={key === "h" ? 359 : 100}
                                value={Math.round(color[key] * (key === "h" ? 1 : 100))}
                                disabled={disabled}
                                onChange={(event) =>
                                    change({
                                        ...color,
                                        [key]: Number(event.target.value) / (key === "h" ? 1 : 100),
                                    })
                                }
                            />
                        ))}
                    </div>,
                    document.body,
                )}
        </div>
    );
}
