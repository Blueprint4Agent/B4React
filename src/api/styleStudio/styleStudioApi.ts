// Local Vite development protocol, deliberately separate from the FastAPI contract.
export type StyleScope = "shared" | "light" | "dark";
export type StyleValues = Record<StyleScope, Record<string, string>>;
export type StyleSnapshot = {
    root: string;
    file: string;
    revision: string;
    values: StyleValues;
    preview?: Record<"light" | "dark", Record<string, string>>;
    backup?: string | null;
};
export type StyleChange = { scope: StyleScope; key: string; value: string };
async function request(action: "read" | "apply", body: object): Promise<StyleSnapshot> {
    const response = await fetch(`/__b4f/style-studio/${action}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Style-Studio-Token": __STYLE_STUDIO_TOKEN__,
        },
        body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "io_error");
    return data as StyleSnapshot;
}
export const readStyles = (): Promise<StyleSnapshot> => request("read", {});
export const applyStyles = (revision: string, changes: StyleChange[]): Promise<StyleSnapshot> =>
    request("apply", { revision, changes });
