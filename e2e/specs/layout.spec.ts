import { expect, test } from "@playwright/test"

import { SECTION_IDS } from "~/src/data/marketing"

import { gotoHydrated } from "../fixtures/hydration"
import landing from "~/messages/en-US/pages.landing.json" with { type: "json" }

const LANDSCAPE_PHONE = { height: 390, width: 844 } as const
const PAST_THE_STAGE = 400

test.describe("on a phone held sideways", () => {
  test.use({ viewport: LANDSCAPE_PHONE })

  test("scrolls the hero's actions into view instead of pinning a stage taller than the screen", async ({ page }) => {
    await gotoHydrated(page, "/")

    const action = page.locator(`#${SECTION_IDS.HERO}`).getByRole("link", { name: landing.hero.viewWork })
    await page.mouse.wheel(0, PAST_THE_STAGE)

    await expect(action).toBeInViewport()
    await expect(action).toBeVisible()
  })
})
