import { expect, test } from "@playwright/test"

const ALIASES = [
  ["/pl", "/pl-PL"],
  ["/en", "/"],
  ["/en-US", "/"],
] as const

for (const [alias, canonical] of ALIASES) {
  test(`redirects ${alias} to ${canonical} permanently`, async ({ request }) => {
    const response = await request.get(alias, { headers: { accept: "text/html" }, maxRedirects: 0 })

    expect(response.status()).toBe(308)
    expect(new URL(response.headers()["location"] ?? "").pathname).toBe(canonical)
  })
}

test("links each locale to the other as an alternate", async ({ page }) => {
  await page.goto("/pl-PL")

  await expect(page.locator('link[rel="alternate"][hreflang="en-US"]')).toHaveAttribute("href", "https://pjborowiecki.com/")
  await expect(page.locator('link[rel="alternate"][hreflang="pl-PL"]')).toHaveAttribute("href", "https://pjborowiecki.com/pl-PL")
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute("href", "https://pjborowiecki.com/")
})

test("remembers the language of the last page visited", async ({ page }) => {
  await page.goto("/pl-PL")

  const cookies = await page.context().cookies()
  expect(cookies.find(({ name }) => name === "pjborowiecki.com_locale")?.value).toBe("pl-PL")
})
