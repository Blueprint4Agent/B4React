import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useProfilePhoto } from "../../../hooks/api/auth/useProfilePhoto";

const readPhoto = vi.fn();
vi.mock("../../../hooks/api/auth/useAuthApi", () => ({
    useAuthApi: () => ({ readProfilePhoto: readPhoto }),
}));
const managed = "/api/v1/auth/me/photo?version=revision1";

describe("private profile image lifecycle", () => {
    beforeEach(() => {
        readPhoto.mockReset();
        vi.stubGlobal(
            "URL",
            class extends URL {
                static createObjectURL = vi.fn(() => "blob:private-photo");
                static revokeObjectURL = vi.fn();
            },
        );
    });
    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it("resolves once per version and revokes on logout", async () => {
        readPhoto.mockResolvedValue(new Blob(["photo"]));
        const { result, rerender, unmount } = renderHook(
            ({ id, source }) => useProfilePhoto(id, source, 0),
            { initialProps: { id: 1 as number | undefined, source: managed as string | null } },
        );
        await waitFor(() => expect(result.current).toBe("blob:private-photo"));
        rerender({ id: 1, source: managed });
        expect(readPhoto).toHaveBeenCalledTimes(1);
        rerender({ id: undefined, source: null });
        expect(result.current).toBeNull();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:private-photo");
        unmount();
    });

    it("discards late responses after an account switch", async () => {
        let resolve!: (blob: Blob) => void;
        readPhoto.mockImplementation(
            () =>
                new Promise<Blob>((done) => {
                    resolve = done;
                }),
        );
        const { result, rerender } = renderHook(
            ({ id, source }) => useProfilePhoto(id, source, 0),
            {
                initialProps: { id: 1, source: managed },
            },
        );
        rerender({ id: 2, source: "https://example.com/legacy.png" });
        resolve(new Blob(["old-account"]));
        await waitFor(() => expect(result.current).toBe("https://example.com/legacy.png"));
        expect(URL.createObjectURL).not.toHaveBeenCalled();
        expect(readPhoto.mock.calls[0][1].aborted).toBe(true);
    });

    it("degrades to initials on storage failure and retries on auth recovery", async () => {
        readPhoto.mockRejectedValueOnce({ detail: { error: "PROFILE_PHOTO_UNAVAILABLE" } });
        const { result, rerender } = renderHook(({ epoch }) => useProfilePhoto(1, managed, epoch), {
            initialProps: { epoch: 0 },
        });
        await waitFor(() => expect(readPhoto).toHaveBeenCalledTimes(1));
        expect(result.current).toBeNull();
        readPhoto.mockResolvedValue(new Blob(["recovered"]));
        rerender({ epoch: 1 });
        await waitFor(() => expect(result.current).toBe("blob:private-photo"));
        expect(readPhoto).toHaveBeenCalledTimes(2);
    });
});
