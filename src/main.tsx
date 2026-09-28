import { ToastProvider } from "./hooks/useToast";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./App";
import { DesktopTitleBar } from "./components/layout/DesktopTitleBar";
import { ConnectivityRecovery } from "./hooks/connectivity/ConnectivityRecovery";
import { ServerConnectivityProvider } from "./hooks/connectivity/useServerConnectivity";
import { AppConfigProvider } from "./hooks/AppConfigProvider";
import { AuthProvider } from "./hooks/useAuth";
import { initializeDesktopRuntime } from "./utils/desktopRuntime";
import "./i18n";
import "./styles/app.css";

initializeDesktopRuntime();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <ServerConnectivityProvider>
                <DesktopTitleBar />
                <ToastProvider>
                    <AppConfigProvider>
                        <AuthProvider>
                            <ConnectivityRecovery />
                            <App />
                        </AuthProvider>
                    </AppConfigProvider>
                </ToastProvider>
            </ServerConnectivityProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
