import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { useAuthContext } from "../../useAuth";
import type { BillingSubscription } from "./useBillingApi";

function createSnapshot() {
    let value: BillingSubscription | null = null;
    let pending: Promise<BillingSubscription> | null = null;
    let revision = 0;
    const listeners = new Set<() => void>();
    const replace = (next: BillingSubscription) => {
        revision += 1;
        value = next;
        listeners.forEach((listener) => listener());
    };
    return {
        get: () => value,
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        replace,
        read(fetchSnapshot: () => Promise<BillingSubscription>, force: boolean) {
            if (pending) return pending;
            if (!force && value) return Promise.resolve(value);
            const version = revision;
            const task = fetchSnapshot()
                .then((next) => {
                    // A mutation response received during this read is newer than its result.
                    if (revision === version) replace(next);
                    return value!;
                })
                .finally(() => {
                    if (pending === task) pending = null;
                });
            pending = task;
            return task;
        },
    };
}

const SnapshotContext = createContext<ReturnType<typeof createSnapshot> | null>(null);

export function SubscriptionSnapshotProvider({
    ownerId,
    children,
}: {
    ownerId?: number;
    children: ReactNode;
}) {
    const snapshot = useMemo(() => createSnapshot(), [ownerId]);
    return <SnapshotContext.Provider value={snapshot}>{children}</SnapshotContext.Provider>;
}

export function AccountSubscriptionProvider({ children }: { children: ReactNode }) {
    const { user } = useAuthContext();
    return (
        <SubscriptionSnapshotProvider ownerId={user?.id}>{children}</SubscriptionSnapshotProvider>
    );
}

export function useSubscriptionSnapshot(ownerId?: number) {
    const shared = useContext(SnapshotContext);
    // Standalone hook consumers still get owner-scoped state; application uses the provider.
    const local = useMemo(() => createSnapshot(), [ownerId]);
    const store = shared ?? local;
    const value = useSyncExternalStore(store.subscribe, store.get, store.get);
    return { value, store };
}
