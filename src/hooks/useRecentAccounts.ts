import { useEffect, useState } from "react";
import {
    readRecentAccounts,
    RECENT_ACCOUNTS_EVENT,
    RECENT_ACCOUNTS_KEY,
} from "../utils/recentAccounts";
export function useRecentAccounts() {
    const [accounts, setAccounts] = useState(readRecentAccounts);
    useEffect(() => {
        const refresh = () => setAccounts(readRecentAccounts());
        const onStorage = (event: StorageEvent) => {
            if (!event.key || event.key === RECENT_ACCOUNTS_KEY) refresh();
        };
        window.addEventListener(RECENT_ACCOUNTS_EVENT, refresh);
        window.addEventListener("storage", onStorage);
        return () => {
            window.removeEventListener(RECENT_ACCOUNTS_EVENT, refresh);
            window.removeEventListener("storage", onStorage);
        };
    }, []);
    return accounts;
}
