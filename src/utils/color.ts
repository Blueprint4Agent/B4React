export type Hsva = { h: number; s: number; v: number; a: number };
export function parseColor(value: string): Hsva | null {
    const hex = /^#([\da-f]{6})$/i.exec(value);
    const rgba = /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(0(?:\.\d+)?|1(?:\.0+)?)\)$/.exec(
        value,
    );
    if (!hex && !rgba) return null;
    const rgb = hex
        ? [0, 2, 4].map((offset) => parseInt(hex[1].slice(offset, offset + 2), 16))
        : rgba!.slice(1, 4).map(Number);
    if (rgb.some((channel) => channel > 255)) return null;
    const [r, g, b] = rgb.map((channel) => channel / 255);
    const max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        delta = max - min;
    const hue =
        delta === 0
            ? 0
            : max === r
              ? ((g - b) / delta) % 6
              : max === g
                ? (b - r) / delta + 2
                : (r - g) / delta + 4;
    return {
        h: (hue * 60 + 360) % 360,
        s: max === 0 ? 0 : delta / max,
        v: max,
        a: rgba ? Number(rgba[4]) : 1,
    };
}
export function formatColor({ h, s, v, a }: Hsva): string {
    const c = v * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = v - c;
    const rgb = (
        h < 60
            ? [c, x, 0]
            : h < 120
              ? [x, c, 0]
              : h < 180
                ? [0, c, x]
                : h < 240
                  ? [0, x, c]
                  : h < 300
                    ? [x, 0, c]
                    : [c, 0, x]
    ).map((channel) => Math.round((channel + m) * 255));
    return a < 1
        ? `rgba(${rgb.join(", ")}, ${Number(a.toFixed(3))})`
        : `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}
