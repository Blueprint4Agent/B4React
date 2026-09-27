import { expect, it } from "vitest";
import { formatColor, parseColor } from "../../../utils/color";
it("round trips color and alpha while rejecting invalid values", () => {
    for (const value of ["#000000", "#ffffff", "#123456", "#ef4444", "rgba(30, 30, 33, 0.92)"])
        expect(formatColor(parseColor(value)!)).toBe(value);
    for (const value of ["rgba(999, 0, 0, 1)", "url(test)", "#bad", "rgba(0, 0, 0, 2)"])
        expect(parseColor(value)).toBeNull();
});
