import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PrimaryCard } from "../ui";

export type MainPageMenuItem = {
    id: string;
    title: string;
    description?: string;
    to: string;
    icon?: ReactNode;
};

type MainPageTemplateProps = {
    title: string;
    description?: ReactNode;
    icon?: ReactNode;
    actions?: ReactNode;
    menuLabel: string;
    menuItems: readonly MainPageMenuItem[];
    menuLayout?: "list" | "grid";
    children?: ReactNode;
};

export function MainPageTemplate({
    title,
    description,
    icon,
    actions,
    menuLabel,
    menuItems,
    menuLayout = "list",
    children,
}: MainPageTemplateProps) {
    return (
        <section className="settings-layout main-page-template">
            <PrimaryCard className="settings-content-card">
                <header className="settings-content-card__header main-page-template__header">
                    <div className="main-page-template__intro">
                        <h1>
                            {icon ? (
                                <span
                                    className="settings-content-card__title-icon"
                                    aria-hidden="true"
                                >
                                    {icon}
                                </span>
                            ) : null}
                            {title}
                        </h1>
                        {description ? <p>{description}</p> : null}
                    </div>
                    {actions ? <div className="main-page-template__actions">{actions}</div> : null}
                </header>
                {menuItems.length > 0 ? (
                    <nav
                        className={`settings-general-content main-page-template__menu main-page-template__menu--${menuLayout}`}
                        aria-label={menuLabel}
                    >
                        {menuItems.map(
                            ({ id, title: itemTitle, description: detail, to, icon: itemIcon }) => (
                                <Link
                                    key={id}
                                    to={to}
                                    className="settings-row main-page-template__link"
                                >
                                    {itemIcon ? (
                                        <span
                                            className="main-page-template__icon"
                                            aria-hidden="true"
                                        >
                                            {itemIcon}
                                        </span>
                                    ) : null}
                                    <div className="main-page-template__copy">
                                        <h2>{itemTitle}</h2>
                                        {detail ? <p>{detail}</p> : null}
                                    </div>
                                    <ArrowUpRight
                                        className="main-page-template__arrow"
                                        aria-hidden="true"
                                    />
                                </Link>
                            ),
                        )}
                    </nav>
                ) : null}
                {children ? <div className="main-page-template__content">{children}</div> : null}
            </PrimaryCard>
        </section>
    );
}
