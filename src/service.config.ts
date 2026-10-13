export type AppLayoutMode = "sidebar" | "topnav" | "focused";

/** Fallback for older/unavailable providers. /config app_layout owns the deployment default. */
export const serviceConfig: { layout: AppLayoutMode } = {
    layout: "sidebar",
};
