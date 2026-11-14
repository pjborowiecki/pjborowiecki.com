import { type Page, expect, test } from "@playwright/test"

import { gotoHydrated } from "../fixtures/hydration"

const VIOLATIONS_ATTRIBUTE = "data-csp-violations"
const SCROLL_TO_END = 100_000
const SETTLE_MS = 500

const recordPolicyViolations = async (page: Page): Promise<void> => {
  await page.addInitScript((attribute) => {
    document.addEventListener("securitypolicyviolation", (event) => {
      const root = document.documentElement
      root.setAttribute(attribute, `${root.getAttribute(attribute) ?? ""}${event.violatedDirective} ${event.blockedURI}\n`)
    })
  }, VIOLATIONS_ATTRIBUTE)
}

for (const path of ["/", "/pl-PL"]) {
  test(`runs every script of the prerendered page ${path} under its policy`, async ({ page }) => {
    await recordPolicyViolations(page)
    await gotoHydrated(page, path)
    await page.mouse.wheel(0, SCROLL_TO_END)
    await page.waitForTimeout(SETTLE_MS)

    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute("content", /^script-src 'self' /u)
    await expect(page.locator("html")).not.toHaveAttribute(VIOLATIONS_ATTRIBUTE)
  })
}

test("runs every script of a page rendered on request under the policy in its header", async ({ page }) => {
  await recordPolicyViolations(page)

  const response = await page.goto("/no-such-page")
  await page.waitForLoadState("networkidle")

  expect(response?.headers()["content-security-policy"]).toMatch(/; script-src 'self' .*'sha256-/u)
  await expect(page.locator("html")).not.toHaveAttribute(VIOLATIONS_ATTRIBUTE)
})
