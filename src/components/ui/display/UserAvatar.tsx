import { useState } from "react";
type UserAvatarProps = {
    className?: string;
    imageUrl?: string | null;
    label: string;
};

export function UserAvatar({ className, imageUrl, label }: UserAvatarProps) {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const nextClassName = className ? `user-avatar ${className}` : "user-avatar";

    if (imageUrl && imageUrl !== failedUrl) {
        return (
            <span className={nextClassName} aria-hidden="true">
                <img src={imageUrl} alt="" onError={() => setFailedUrl(imageUrl)} />
            </span>
        );
    }

    return (
        <span className={nextClassName} aria-hidden="true">
            <span>{label.slice(0, 1).toUpperCase()}</span>
        </span>
    );
}
