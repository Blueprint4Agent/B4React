type SidebarLocation = { pathname: string; state?: unknown };

export function profileSidebarPath(location: SidebarLocation): string {
    if (location.pathname !== "/profile") return location.pathname;
    const state = location.state;
    const path =
        state && typeof state === "object" && "profileSidebarPath" in state
            ? state.profileSidebarPath
            : undefined;
    return path === "/settings" || path === "/admin" || path === "/admin/server" ? path : "/home";
}
