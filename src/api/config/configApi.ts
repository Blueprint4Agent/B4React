import type { paths } from "../generated/openapi";
import { apiClient } from "../http";

export type AppConfig = paths["/config"]["get"]["responses"][200]["content"]["application/json"];

export async function getConfig(): Promise<AppConfig> {
    const { data, error } = await apiClient.GET("/config");
    if (error || !data) {
        throw error ?? new Error("Failed to load config.");
    }
    if (data.app_mode !== "development" && data.app_mode !== "production") {
        throw new Error("Invalid application mode.");
    }
    if (data.app_mode === "production" && !data.login_enabled) {
        throw new Error("Production mode requires login.");
    }
    return data;
}
