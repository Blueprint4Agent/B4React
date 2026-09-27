import { useEffect, useRef } from "react";

import { useAppConfig } from "../useFeatures";
import { useAuthContext } from "../useAuth";
import { useServerConnectivity } from "./useServerConnectivity";

export function ConnectivityRecovery() {
    const { reload } = useAppConfig();
    const { revalidateSession } = useAuthContext();
    const { isDesktop, status } = useServerConnectivity();
    const disconnectedRef = useRef(false);

    useEffect(() => {
        if (!isDesktop) {
            return;
        }
        if (status === "offline" || status === "reconnecting") {
            disconnectedRef.current = true;
            return;
        }
        if (status === "online" && disconnectedRef.current) {
            disconnectedRef.current = false;
            void reload()
                .then(() => revalidateSession())
                .catch(() => undefined);
        }
    }, [isDesktop, reload, revalidateSession, status]);

    return null;
}
