type BrandMarkProps = {
    className?: string;
    variant?: "plain" | "tile";
    tone?: "auto" | "light" | "dark";
};

export function BrandMark({ className, variant = "plain", tone = "auto" }: BrandMarkProps) {
    return (
        <span
            className={["brand-mark", `brand-mark--${variant}`, className]
                .filter(Boolean)
                .join(" ")}
            data-brand-tone={tone}
            aria-hidden="true"
        >
            <img
                className="brand-mark__asset brand-mark__asset--light"
                src={__PROJECT_BRAND__?.logo_url ?? "/icons/b4a-mark.svg"}
                alt=""
            />
            <img
                className="brand-mark__asset brand-mark__asset--dark"
                src={
                    __PROJECT_BRAND__?.logo_dark_url ??
                    __PROJECT_BRAND__?.logo_url ??
                    "/icons/b4a-mark-dark.svg"
                }
                alt=""
            />
        </span>
    );
}
