import createClient from "openapi-fetch";

import { getAccessToken } from "../store/session";
import { getApiBase } from "../utils/apiBase";
import type { paths } from "./generated/openapi";

export type APIError = {
    detail?: {
        error?: string;
        message?: string;
        details?: Record<string, unknown>;
    };
};

export function getAuthHeader(): HeadersInit | undefined {
    const token = getAccessToken();
    if (!token) return undefined;
    return { Authorization: `Bearer ${token}` };
}

type RecoveryOwner = { recover: () => Promise<void>; epoch: number };
let recoveryOwner: RecoveryOwner | null = null;
let recoveryTask: Promise<void> | null = null;
let rejectedToken: string | null = null;

export function resetSessionRecovery() {
    if (recoveryOwner) recoveryOwner.epoch += 1;
    recoveryTask = null;
    rejectedToken = null;
}

/** AuthProvider installs the sole session owner; transport never owns user state. */
export function registerSessionRecovery(recover: () => Promise<void>) {
    const owner = { recover, epoch: 0 };
    recoveryOwner = owner;
    resetSessionRecovery();
    return () => {
        if (recoveryOwner === owner) {
            resetSessionRecovery();
            recoveryOwner = null;
        }
    };
}

export async function authenticatedFetch(request: Request): Promise<Response> {
    const owner = recoveryOwner;
    const epoch = owner?.epoch;
    const authorization = request.headers.get("Authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    const path = new URL(request.url).pathname;
    // /me and logout are controlled by AuthProvider; never recurse into its own refresh.
    const eligible =
        !!owner &&
        !!token &&
        !(path.endsWith("/auth/me") && request.method === "GET") &&
        !path.endsWith("/auth/logout");
    const replay = eligible ? request.clone() : null;
    const response = await fetch(request);
    if (!eligible || response.status !== 401 || !replay) return response;
    const body = await response
        .clone()
        .json()
        .catch(() => null);
    if (body?.detail?.error !== "INVALID_TOKEN") return response;
    const current = () => recoveryOwner === owner && owner.epoch === epoch;
    if (!current()) return response;
    if (getAccessToken() === token) {
        if (!recoveryTask && rejectedToken !== token) {
            rejectedToken = token;
            const task = owner
                .recover()
                .catch(() => undefined)
                .finally(() => {
                    if (recoveryTask === task) recoveryTask = null;
                });
            recoveryTask = task;
        }
        await recoveryTask;
    }
    const renewed = getAccessToken();
    if (!current() || !renewed || renewed === token || replay.signal.aborted) return response;
    replay.headers.set("Authorization", `Bearer ${renewed}`);
    // Use raw fetch so a rejected retry cannot start another recovery loop.
    const retried = await fetch(replay);
    if (current() && retried.status === 401) {
        const detail = await retried
            .clone()
            .json()
            .catch(() => null);
        if (detail?.detail?.error === "INVALID_TOKEN") rejectedToken = renewed;
    }
    return retried;
}

export const apiClient = createClient<paths>({
    baseUrl: getApiBase(),
    credentials: "include",
    fetch: authenticatedFetch,
});
