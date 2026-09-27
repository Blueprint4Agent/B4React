import type { ReactNode } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppSidebar } from "./AppSidebar";

type AppLayoutProps = { children: ReactNode };

export function AppLayout({ children }: AppLayoutProps) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const isSettings = useLocation().pathname === "/settings";
    return (
        <div
            className={
                isSettings
                    ? "app-shell app-shell--settings"
                    : expanded
                      ? "app-shell app-shell--expanded"
                      : "app-shell"
            }
        >
            {expanded && !isSettings ? (
                <button
                    className="app-sidebar-backdrop"
                    type="button"
                    aria-label={t("nav.sidebar.toggleClose")}
                    onClick={() => setExpanded(false)}
                />
            ) : null}
            {!isSettings ? (
                <AppSidebar
                    expanded={expanded}
                    onToggleExpanded={() => setExpanded((value) => !value)}
                />
            ) : null}
            <main className="app-main">
                <div className="app-main__content">{children}</div>
            </main>
        </div>
    );
}
