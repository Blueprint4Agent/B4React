import { Component, Suspense, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";
import { PageStateFrame } from "./PageStateFrame";
import { Button } from "../ui";

type RouteErrorBoundaryProps = { children: ReactNode; errorFallback: ReactNode };
class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    render() {
        return this.state.failed ? this.props.errorFallback : this.props.children;
    }
}

function RouteLoadError() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    return (
        <PageStateFrame
            title={t("routeLoad.title")}
            description={t("routeLoad.description")}
            illustration={
                <span className="page-state__symbol">
                    <TriangleAlert aria-hidden="true" />
                </span>
            }
            actions={
                <>
                    <Button onClick={() => window.location.reload()}>
                        {t("routeLoad.reload")}
                    </Button>
                    <Button onClick={() => navigate("/home", { replace: true })}>
                        {t("nav.home")}
                    </Button>
                </>
            }
        />
    );
}

type RouteBoundaryProps = { children: ReactNode; fallback: ReactNode };
export function RouteBoundary({ children, fallback }: RouteBoundaryProps) {
    const { pathname } = useLocation();
    return (
        <RouteErrorBoundary key={pathname} errorFallback={<RouteLoadError />}>
            <Suspense fallback={fallback}>{children}</Suspense>
        </RouteErrorBoundary>
    );
}
