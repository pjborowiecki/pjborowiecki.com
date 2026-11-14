import { expect, test } from "@playwright/test"

import { gotoHydrated } from "../fixtures/hydration"

import { accessibilityViolations } from "../fixtures/accessibility"

const PAGES = ["/", "/pl-PL"] as const

for (const path of PAGES) {
  test(`${path} meets WCAG 2.2 AA`, async ({ page }) => {
    const response = await gotoHydrated(page, path)
    expect(response?.status()).toBe(200)

    expect(await accessibilityViolations(page)).toStrictEqual([])
  })

  test(`${path} meets WCAG 2.2 AA with reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    const response = await gotoHydrated(page, path)
    expect(response?.status()).toBe(200)

    expect(await accessibilityViolations(page)).toStrictEqual([])
  })
}
