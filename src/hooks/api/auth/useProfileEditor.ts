import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../../useAuth";
import { useToast } from "../../useToast";
import { useAuthApi } from "./useAuthApi";

export function useProfileEditor() {
    const { user, updateProfile, uploadPhoto, deletePhoto } = useAuthContext();
    const { extractApiDetail, resolveAuthErrorMessage } = useAuthApi();
    const { t } = useTranslation();
    const toast = useToast();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<"name" | "bio" | "location" | null>(null);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const epoch = useRef(0);
    const pending = useRef(false);
    useEffect(() => {
        ++epoch.current;
        setOpen(false);
        setEditing(null);
        setName("");
        setBio("");
        setLocation("");
        setError("");
        setBusy(false);
        pending.current = false;
        return () => {
            ++epoch.current;
        };
    }, [user?.id]);
    const perform = async (action: () => Promise<void>, close = false) => {
        if (pending.current || !user) return;
        const current = epoch.current;
        pending.current = true;
        setBusy(true);
        setError("");
        try {
            await action();
            if (current !== epoch.current) return;
            toast(t("toast.profileSuccess"));
            if (close) {
                setOpen(false);
                setEditing(null);
            }
        } catch (failure) {
            if (current === epoch.current)
                setError(
                    resolveAuthErrorMessage(t, extractApiDetail(failure), "toast.profileError"),
                );
        } finally {
            if (current === epoch.current) {
                pending.current = false;
                setBusy(false);
            }
        }
    };
    return {
        open,
        editing,
        startInline: (field: "name" | "bio" | "location") => {
            if (pending.current) return;
            setName(user?.name ?? "");
            setBio(user?.bio ?? "");
            setLocation(user?.location ?? "");
            setError("");
            setEditing(field);
        },
        cancelInline: () => {
            if (!pending.current) {
                setEditing(null);
                setError("");
            }
        },
        saveInline: () => {
            if (!editing || (editing === "name" && name.trim().length < 2)) return;
            const value =
                editing === "name"
                    ? name.trim()
                    : editing === "bio"
                      ? bio.trim() || null
                      : location || null;
            void perform(() => updateProfile({ [editing]: value }), true);
        },
        name,
        bio,
        location,
        busy,
        error,
        setName,
        setBio: (value: string) => setBio(Array.from(value).slice(0, 100).join("")),
        setLocation,
        show: () => {
            setEditing(null);
            setName(user?.name ?? "");
            setBio(user?.bio ?? "");
            setLocation(user?.location ?? "");
            setError("");
            setOpen(true);
        },
        close: () => {
            if (!pending.current) {
                setOpen(false);
                setError("");
            }
        },
        save: () => {
            if (name.trim().length >= 2)
                void perform(
                    () =>
                        updateProfile({
                            name: name.trim(),
                            bio: bio.trim() || null,
                            location: location.trim() || null,
                        }),
                    true,
                );
        },
        removePhoto: () => void perform(deletePhoto),
        selectPhoto: (file: File) => {
            if (pending.current) return;
            if (
                !["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"].includes(
                    file.type,
                )
            ) {
                setError(t("settings.profile.photoTypeError"));
                return;
            }
            if (file.size > 8 * 1024 * 1024) {
                setError(t("settings.profile.photoSizeError"));
                return;
            }
            void perform(() => uploadPhoto(file));
        },
    };
}
