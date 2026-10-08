import { useEffect, useState } from "react";
import { useAuthApi } from "./useAuthApi";

/** One private image per auth snapshot; account/version changes cancel stale reads. */
export function useProfilePhoto(
    userId: number | undefined,
    source: string | null,
    refreshEpoch: number,
): string | null {
    const { readProfilePhoto } = useAuthApi();
    const [resolved, setResolved] = useState<{ id: number; source: string; url: string } | null>(
        null,
    );
    const managed = source?.startsWith("/api/v1/auth/me/photo?version=") === true;
    useEffect(() => {
        if (!managed || !source || userId === undefined) return;
        const controller = new AbortController();
        let objectUrl: string | null = null;
        const version = source.slice(source.indexOf("=") + 1);
        void readProfilePhoto(version, controller.signal)
            .then((blob) => {
                if (controller.signal.aborted) return;
                objectUrl = URL.createObjectURL(blob);
                setResolved({ id: userId, source, url: objectUrl });
            })
            .catch(() => {
                if (!controller.signal.aborted) setResolved(null);
            });
        return () => {
            controller.abort();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [managed, source, userId, refreshEpoch, readProfilePhoto]);
    if (!managed) return source;
    return resolved && resolved.id === userId && resolved.source === source ? resolved.url : null;
}
