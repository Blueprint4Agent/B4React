import type { ReactNode } from "react";
import { CircleAlert, Info, TriangleAlert } from "lucide-react";

type StatusCardProps = {
    title?: string;
    message: string;
    tone: "error" | "warning" | "info";
    compact?: boolean;
    children?: ReactNode;
};

export function StatusCard({ title, message, tone, compact = false, children }: StatusCardProps) {
    const className = compact
        ? `status-card status-card--${tone} status-card--compact`
        : `status-card status-card--${tone}`;
    const Icon = tone === "error" ? CircleAlert : tone === "warning" ? TriangleAlert : Info;
    return (
        <div className={className} role={tone === "info" ? "status" : "alert"}>
            <Icon className="status-card__icon" aria-hidden="true" />
            <div className="status-card__content">
                {title ? <div className="status-card__title">{title}</div> : null}
                <div className="status-card__message">{message}</div>
                {children}
            </div>
        </div>
    );
}

export function ErrorCard({ title, message, children, compact }: Omit<StatusCardProps, "tone">) {
    return (
        <StatusCard title={title} message={message} tone="error" compact={compact}>
            {children}
        </StatusCard>
    );
}

export function WarningCard({ title, message, children, compact }: Omit<StatusCardProps, "tone">) {
    return (
        <StatusCard title={title} message={message} tone="warning" compact={compact}>
            {children}
        </StatusCard>
    );
}

export function InfoCard({ title, message, children, compact }: Omit<StatusCardProps, "tone">) {
    return (
        <StatusCard title={title} message={message} tone="info" compact={compact}>
            {children}
        </StatusCard>
    );
}
