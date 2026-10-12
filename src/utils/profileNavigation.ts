type SidebarLocation = { pathname: string; state?: unknown };

export function profileSidebarPath(location: SidebarLocation): string {
    if (location.pathname !== "/profile" && location.pathname !== "/notifications")
        return location.pathname;
    const state = location.state;
    const path =
        state && typeof state === "object" && "profileSidebarPath" in state
            ? state.profileSidebarPath
            : undefined;
    return path === "/settings" ||
        path === "/admin" ||
        path === "/admin/server" ||
        path === "/admin/inquiries" ||
        path === "/demo/admin" ||
        path === "/demo/admin/server"
        ? path
        : "/home";
}
