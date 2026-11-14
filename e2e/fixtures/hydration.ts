import type { Page, Response } from "@playwright/test"

const APP_READY_TIMEOUT_MS = 30_000

const waitForHydration = async (page: Page): Promise<void> => {
  await page.waitForFunction(
    () => {
      const hydration: unknown = Reflect.get(window, "$_TSR")
      if (typeof hydration === "object" && hydration !== null && (!("hydrated" in hydration) || hydration.hydrated !== true)) {
        return false
      }
      for (const node of document.querySelectorAll('div[id^="S:"]')) {
        if (globalThis.getComputedStyle(node).display === "none") {
          return false
        }
      }

      return true
    },
    undefined,
    { timeout: APP_READY_TIMEOUT_MS },
  )
}

export const gotoHydrated = async (page: Page, path: string): Promise<Response | null> => {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" })
  await page.locator("body").waitFor({ state: "visible" })
  await waitForHydration(page)

  return response
}
