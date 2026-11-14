import { expect, test } from "@playwright/test"

import landingEnglish from "~/messages/en-US/pages.landing.json" with { type: "json" }
import landingPolish from "~/messages/pl-PL/pages.landing.json" with { type: "json" }

const PAGES = [
  { landing: landingEnglish, locale: "en-US", path: "/" },
  { landing: landingPolish, locale: "pl-PL", path: "/pl-PL" },
] as const

for (const { landing, locale, path } of PAGES) {
  test(`serves the ${locale} landing page in its language`, async ({ page }) => {
    const response = await page.goto(path)

    expect(response?.status()).toBe(200)
    await expect(page.locator("html")).toHaveAttribute("lang", locale)
    await expect(page).toHaveTitle(landing.metadata.title)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Piotr J. Borowiecki")
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  })
}

test("keeps previews out of search results", async ({ page }) => {
  await page.goto("/")

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow")
})

test("answers an unknown page with a translated 404", async ({ page }) => {
  const response = await page.goto("/pl-PL/missing-page")

  expect(response?.status()).toBe(404)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nie znaleziono strony")
})
