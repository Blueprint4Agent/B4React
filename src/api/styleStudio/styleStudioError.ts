export function styleStudioError(error: unknown): string {
    const code = error instanceof Error ? error.message : "io_error";
    return ["conflict", "invalid_input", "unsupported_styles", "forbidden", "unsafe_path"].includes(
        code,
    )
        ? `styleStudio.errors.${code}`
        : "styleStudio.errors.io_error";
}
