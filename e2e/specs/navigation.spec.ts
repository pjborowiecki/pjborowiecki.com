import { expect, test } from "@playwright/test"

import { gotoHydrated } from "../fixtures/hydration"

import backToTop from "~/messages/en-US/components.custom.back-to-top.json" with { type: "json" }
import navigation from "~/messages/en-US/components.custom.navigation.json" with { type: "json" }

const PHONE = { height: 844, width: 390 } as const

test("skips the hero and lands on the introduction from the keyboard", async ({ browserName, page }) => {
  await gotoHydrated(page, "/")

  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab")
  const skip = page.getByRole("link", { name: navigation.skip })
  await expect(skip).toBeFocused()
  await skip.press("Enter")

  await expect(page.locator("#intro")).toBeInViewport()
})

test("scrolls to a section from the primary navigation", async ({ page }) => {
  await gotoHydrated(page, "/")

  await page.getByRole("navigation", { name: navigation.primaryNav }).first().getByRole("link", { name: navigation.items.work }).click()

  await expect(page.locator("#work")).toBeInViewport()
})

test("offers a way back to the top once the hero is behind", async ({ page }) => {
  await gotoHydrated(page, "/")
  await page.locator("#contact").scrollIntoViewIfNeeded()

  const button = page.getByRole("link", { exact: true, name: backToTop.label })
  await expect(button).toBeVisible()
  await button.click()

  await expect(page.locator("#hero")).toBeInViewport()
})

test.describe("on a phone", () => {
  test.use({ viewport: PHONE })

  test("opens the menu, moves through it and closes it with Escape", async ({ page }) => {
    await gotoHydrated(page, "/")

    const toggle = page.getByRole("button", { name: navigation.menu })
    await toggle.click()

    const menu = page.locator("#mobile-menu")
    await expect(menu).toBeVisible()
    await expect(page.getByRole("button", { name: navigation.close })).toHaveAttribute("aria-expanded", "true")
    await expect(menu.getByRole("link", { name: navigation.items.about })).toBeVisible()

    await page.keyboard.press("Escape")

    await expect(menu).toBeHidden()
    await expect(page.getByRole("button", { name: navigation.menu })).toBeFocused()
  })

  test("closes the menu after following one of its links", async ({ page }) => {
    await gotoHydrated(page, "/")

    await page.getByRole("button", { name: navigation.menu }).click()
    await page.locator("#mobile-menu").getByRole("link", { name: navigation.items.work }).click()

    await expect(page.locator("#mobile-menu")).toBeHidden()
    await expect(page.locator("#work")).toBeInViewport()
  })
})
