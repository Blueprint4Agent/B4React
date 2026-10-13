export type AppLayoutMode = "sidebar" | "topnav" | "focused";

/** Service-wide defaults. Change layout and rebuild to publish a different shell. */
export const serviceConfig: { layout: AppLayoutMode } = {
    layout: "sidebar",
};
