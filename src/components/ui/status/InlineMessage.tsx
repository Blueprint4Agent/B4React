import { StatusCard } from "./StatusCard";

type InlineMessageTone = "error" | "warning" | "info";

type InlineMessageProps = {
    children: string;
    tone?: InlineMessageTone;
};

export function InlineMessage({ children, tone = "error" }: InlineMessageProps) {
    return (
        <div className={`ui-inline-message ui-inline-message--${tone}`}>
            <StatusCard message={children} tone={tone} compact />
        </div>
    );
}
