import { describe, expect, it } from "vitest";
import { normalizeLanguageId, resolveLanguage } from "../../../utils/language";

describe("project language defaults", () => {
    it("uses the project default before browser detection", () => {
        // Given/When/Then: a fresh English browser opens a Korean-default project.
        expect(resolveLanguage({ projectDefault: "ko", browserLanguages: ["en-US"] })).toBe("ko");
    });
    it("preserves a saved English choice over the project default", () => {
        // Given/When/Then: an explicit user choice survives the Korean project default.
        expect(resolveLanguage({ stored: "en-US", projectDefault: "ko" })).toBe("en");
    });
    it("preserves browser detection and English fallback without project settings", () => {
        // Given/When/Then: existing projects retain their original language behavior.
        expect(resolveLanguage({ browserLanguages: ["fr", "ko-KR", "en"] })).toBe("ko");
        expect(resolveLanguage({ browserLanguages: ["fr"] })).toBe("en");
        expect(resolveLanguage({})).toBe("en");
    });
    it("ignores invalid saved preferences", () => {
        // Given/When/Then: stale preferences cannot override a valid project setting.
        expect(resolveLanguage({ stored: "fr", projectDefault: "ko" })).toBe("ko");
        expect(normalizeLanguageId(null)).toBeNull();
    });
});
