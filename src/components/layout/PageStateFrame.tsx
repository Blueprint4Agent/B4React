import type { ReactNode } from "react";
import { PanelCard } from "../ui";

type PageStateFrameProps = {
    title: string;
    description: string;
    illustration: ReactNode;
    children?: ReactNode;
    actions?: ReactNode;
};

export function PageStateFrame({
    title,
    description,
    illustration,
    children,
    actions,
}: PageStateFrameProps) {
    return (
        <section className="page-state">
            <PanelCard
                className="page-state__panel"
                title={title}
                subtitle={description}
                top={<div className="page-state__illustration">{illustration}</div>}
            >
                {children ? <div className="page-state__content">{children}</div> : null}
                {actions ? <div className="page-state__actions">{actions}</div> : null}
            </PanelCard>
        </section>
    );
}
