import type { Locator, Page } from "@playwright/test";

/** Optional review artifacts; automatic failure screenshots stay in Playwright config. */
export async function captureVisual(
    page: Page | Locator,
    options: Parameters<Page["screenshot"]>[0],
) {
    if (process.env.B4F_CAPTURE_VISUALS === "1") await page.screenshot(options);
}
