import { describe, expect, it } from "vitest";
import { getCoffeeSupportUrl } from "../../../utils/coffeeSupport";

describe("optional coffee support link", () => {
    it("only enables a configured account link in development", () => {
        expect(
            getCoffeeSupportUrl("development", "true", " https://buymeacoffee.com/example "),
        ).toBe("https://buymeacoffee.com/example");
        expect(
            getCoffeeSupportUrl("development", "true", "https://www.buymeacoffee.com/example/"),
        ).toBe("https://www.buymeacoffee.com/example/");
    });
    it.each(["production", "unknown", undefined])(
        "hides support for mode %s even when enabled",
        (mode) => {
            expect(
                getCoffeeSupportUrl(mode, "true", "https://buymeacoffee.com/example"),
            ).toBeNull();
        },
    );
    it.each(["false", "", undefined])("requires explicit opt-in: %s", (enabled) => {
        expect(
            getCoffeeSupportUrl("development", enabled, "https://buymeacoffee.com/example"),
        ).toBeNull();
    });
    it.each([
        undefined,
        "",
        "javascript:alert(1)",
        "http://buymeacoffee.com/example",
        "https://buymeacoffee.com.evil.test/example",
        "https://buymeacoffee.com/",
        "https://user:password@buymeacoffee.com/example",
        "https://buymeacoffee.com:8443/example",
        "https://buymeacoffee.com/example?redirect=elsewhere",
        "https://buymeacoffee.com/example#test",
    ])("rejects invalid public URLs: %s", (url) => {
        expect(getCoffeeSupportUrl("development", "true", url)).toBeNull();
    });
});
