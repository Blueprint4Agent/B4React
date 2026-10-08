import { useRef } from "react";
import { Button } from "../buttons/Button";
type AvatarUploadFieldProps = {
    accept?: string;
    busy?: boolean;
    canClear?: boolean;
    helperText?: string;
    onClear: () => void;
    onSelectFile: (file: File | null) => void;
    selectButtonText: string;
    clearButtonText: string;
};

export function AvatarUploadField({
    accept = "image/png,image/jpeg,image/jpg,image/webp,image/gif",
    busy = false,
    canClear = false,
    helperText,
    onClear,
    onSelectFile,
    selectButtonText,
    clearButtonText,
}: AvatarUploadFieldProps) {
    const input = useRef<HTMLInputElement>(null);
    return (
        <div className="avatar-upload-field">
            <div className="avatar-upload-field__actions">
                <Button type="button" disabled={busy} onClick={() => input.current?.click()}>
                    {selectButtonText}
                </Button>
                <input
                    ref={input}
                    type="file"
                    hidden
                    accept={accept}
                    disabled={busy}
                    onChange={(event) => {
                        onSelectFile(event.target.files?.[0] ?? null);
                        event.currentTarget.value = "";
                    }}
                />
                <Button type="button" onClick={onClear} disabled={busy || !canClear}>
                    {clearButtonText}
                </Button>
            </div>
            {helperText ? <p className="avatar-upload-field__helper">{helperText}</p> : null}
        </div>
    );
}
