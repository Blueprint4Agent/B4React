import { useCallback, useEffect, useRef, useState } from "react";
import {
    applyStyles,
    readStyles,
    type StyleChange,
    type StyleSnapshot,
    type StyleValues,
    type StyleScope,
} from "../../../api/styleStudio/styleStudioApi";
import { styleStudioError } from "../../../api/styleStudio/styleStudioError";
export type { StyleScope, StyleValues } from "../../../api/styleStudio/styleStudioApi";

export function useStyleStudioApi() {
    const [snapshot, setSnapshot] = useState<StyleSnapshot | null>(null);
    const [draft, setDraft] = useState<StyleValues | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const active = useRef(true);
    const inFlight = useRef(false);
    const load = useCallback(async () => {
        if (inFlight.current) return;
        inFlight.current = true;
        setBusy(true);
        setError("");
        setSaved(false);
        try {
            const data = await readStyles();
            if (active.current) {
                setSnapshot(data);
                setDraft(data.values);
            }
        } catch (failure) {
            if (active.current) setError(styleStudioError(failure));
        } finally {
            inFlight.current = false;
            if (active.current) setBusy(false);
        }
    }, []);
    useEffect(() => {
        active.current = true;
        void load();
        return () => {
            active.current = false;
        };
    }, [load]);
    const changes: StyleChange[] =
        snapshot && draft
            ? (Object.keys(draft) as StyleScope[]).flatMap((scope) =>
                  Object.entries(draft[scope])
                      .filter(([key, value]) => value !== snapshot.values[scope][key])
                      .map(([key, value]) => ({ scope, key, value })),
              )
            : [];
    const edit = (scope: StyleScope, key: string, value: string): void => {
        setDraft((current) =>
            current ? { ...current, [scope]: { ...current[scope], [key]: value } } : current,
        );
        setSaved(false);
    };
    const reset = (): void => {
        setDraft(snapshot?.values ?? null);
        setError("");
        setSaved(false);
    };
    const apply = async (): Promise<void> => {
        if (!snapshot || !changes.length || inFlight.current) return;
        inFlight.current = true;
        setBusy(true);
        setError("");
        try {
            const data = await applyStyles(snapshot.revision, changes);
            if (active.current) {
                setSnapshot(data);
                setDraft(data.values);
                setSaved(true);
            }
        } catch (failure) {
            if (active.current) setError(styleStudioError(failure));
        } finally {
            inFlight.current = false;
            if (active.current) setBusy(false);
        }
    };
    return { snapshot, draft, busy, error, saved, changes, edit, reset, load, apply };
}
