import { useRef } from "react";
import { Pencil } from "lucide-react";
import { Button } from "../buttons/Button";
import { UserAvatar } from "../display/UserAvatar";

type EditableAvatarProps = {
    imageUrl?: string | null;
    name: string;
    label: string;
    busy?: boolean;
    onSelect: (file: File) => void;
};

export function EditableAvatar({
    imageUrl,
    name,
    label,
    busy = false,
    onSelect,
}: EditableAvatarProps) {
    const input = useRef<HTMLInputElement>(null);
    return (
        <div className="editable-avatar">
            <Button
                type="button"
                className="editable-avatar__trigger"
                aria-label={label}
                disabled={busy}
                onClick={() => input.current?.click()}
            >
                <UserAvatar imageUrl={imageUrl} label={name} />
                <span className="editable-avatar__edit" aria-hidden="true">
                    <Pencil />
                </span>
            </Button>
            <input
                ref={input}
                type="file"
                hidden
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={busy}
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onSelect(file);
                    event.target.value = "";
                }}
            />
        </div>
    );
}
