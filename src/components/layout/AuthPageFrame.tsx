import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, PanelCard } from "../ui";

type AuthPageFrameProps = {
    embedded?: boolean;
    title: string;
    subtitle?: string;
    children: ReactNode;
    onClose?: () => void;
};

export function AuthPageFrame({
    embedded = false,
    title,
    subtitle,
    children,
    onClose,
}: AuthPageFrameProps) {
    const navigate = useNavigate();
    if (embedded)
        return (
            <Modal
                open
                title={title}
                description={subtitle}
                onClose={onClose ?? (() => navigate("/show-case", { replace: true }))}
                className="auth-dialog"
                returnFocusSelector=".profile-menu__trigger"
                keyboardDismissible
            >
                <div className="auth-dialog-content">
                    <PanelCard className="auth-panel">{children}</PanelCard>
                </div>
            </Modal>
        );
    return (
        <main className="page auth-page">
            <PanelCard className="auth-panel" title={title} subtitle={subtitle}>
                {children}
            </PanelCard>
        </main>
    );
}
