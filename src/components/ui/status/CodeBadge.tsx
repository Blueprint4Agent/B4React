type CodeBadgeProps = {
    children: string;
    className?: string;
};

export function CodeBadge({ children, className }: CodeBadgeProps) {
    return <code className={`ui-code-badge${className ? ` ${className}` : ""}`}>{children}</code>;
}
