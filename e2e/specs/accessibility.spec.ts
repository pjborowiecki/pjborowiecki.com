import { expect, test } from "@playwright/test"

import { accessibilityViolations } from "../fixtures/accessibility"
import { gotoHydrated } from "../fixtures/hydration"

const PAGES = ["/", "/pl-PL"] as const

const PHONE = { height: 844, width: 390 } as const

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

test.describe("on a phone", () => {
  test.use({ viewport: PHONE })

  for (const path of PAGES) {
    test(`${path} meets WCAG 2.2 AA`, async ({ page }) => {
      const response = await gotoHydrated(page, path)
      expect(response?.status()).toBe(200)

      expect(await accessibilityViolations(page)).toStrictEqual([])
    })
  }
})
