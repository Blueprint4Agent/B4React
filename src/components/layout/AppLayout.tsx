import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppSidebar } from "./AppSidebar";

type AppLayoutProps = { children: ReactNode };

export function AppLayout({ children }: AppLayoutProps) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    return (
        <div className={expanded ? "app-shell app-shell--expanded" : "app-shell"}>
            {expanded ? (
                <button
                    className="app-sidebar-backdrop"
                    type="button"
                    aria-label={t("nav.sidebar.toggleClose")}
                    onClick={() => setExpanded(false)}
                />
            ) : null}
            <AppSidebar
                expanded={expanded}
                onToggleExpanded={() => setExpanded((value) => !value)}
            />
            <main className="app-main">
                <div className="app-main__content">{children}</div>
            </main>
        </div>
    );
}
