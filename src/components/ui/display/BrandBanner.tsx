import { useTranslation } from "react-i18next";
import { BrandMark } from "./BrandMark";

type BrandBannerProps = {
    tone?: "auto" | "light" | "dark";
};

export function BrandBanner({ tone = "auto" }: BrandBannerProps) {
    const { t } = useTranslation();
    return (
        <span className="brand-banner" data-brand-tone={tone}>
            <BrandMark tone={tone} />
            <span className="brand-banner__wordmark">{t("nav.brand")}</span>
        </span>
    );
}
