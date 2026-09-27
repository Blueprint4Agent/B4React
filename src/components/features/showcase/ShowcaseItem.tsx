import { Children, isValidElement, createContext, useContext, type ReactNode } from "react";

export const ShowcaseQuery = createContext("");

export function ShowcaseItem({
    component,
    children,
    className,
}: {
    component: string;
    children: ReactNode;
    className?: string;
}) {
    const query = useContext(ShowcaseQuery);
    if (query && !component.toLocaleLowerCase().includes(query)) return null;
    return (
        <article
            className={`showcase-item${className ? ` ${className}` : ""}`}
            data-component={component}
        >
            <h3 className="showcase-item__name">{component}</h3>
            <div className="showcase-item__preview">{children}</div>
        </article>
    );
}

export function getShowcaseNames(children: ReactNode): string[] {
    return Children.toArray(children).flatMap((child) => {
        if (!isValidElement<{ component?: string; children?: ReactNode }>(child)) return [];
        return [
            ...(child.type === ShowcaseItem && child.props.component
                ? [child.props.component]
                : []),
            ...getShowcaseNames(child.props.children),
        ];
    });
}
