import { OAuthProviderIcon } from "./OAuthProviderIcon";
import { Button } from "../../ui";
import { getApiUrl } from "../../../utils/apiBase";

type OAuthProviderButtonProps = {
    provider: "google" | "github";
    label: string;
    startPath: string;
    disabled?: boolean;
    onStart?: () => void;
    onPreview?: () => void;
};

export function OAuthProviderButton({
    provider,
    label,
    startPath,
    disabled = false,
    onStart,
    onPreview,
}: OAuthProviderButtonProps) {
    const onClick = () => {
        if (onPreview) {
            onPreview();
            return;
        }
        onStart?.();
        const oauthStartUrl = getApiUrl(startPath);
        window.location.assign(oauthStartUrl);
    };

    return (
        <Button appearance="pill-secondary" type="button" disabled={disabled} onClick={onClick}>
            <span className="oauth-provider-button__content">
                <OAuthProviderIcon provider={provider} />
                <span className="oauth-provider-button__label">{label}</span>
            </span>
        </Button>
    );
}
