import { expect, test } from "@playwright/test"

import { gotoHydrated } from "../fixtures/hydration"

import landing from "~/messages/en-US/pages.landing.json" with { type: "json" }

const { contact } = landing

test.beforeEach(async ({ page }, testInfo) => {
  await page.setExtraHTTPHeaders({ "cf-connecting-ip": `198.51.100.${String(testInfo.workerIndex + testInfo.repeatEachIndex + 1)}` })
  await gotoHydrated(page, "/#contact")
})

test("explains what is missing before sending anything", async ({ page }) => {
  const form = page.locator("#contact-form")

  await form.getByRole("button", { name: contact.send }).click()

  await expect(form.getByText(contact.validation.nameRequired)).toBeVisible()
  await expect(form.getByText(contact.validation.emailRequired)).toBeVisible()
  await expect(form.getByText(contact.validation.detailsRequired)).toBeVisible()
  await expect(form.getByLabel(contact.fieldName)).toHaveAttribute("aria-invalid", "true")
})

test("sends a message and empties the form", async ({ page }) => {
  const form = page.locator("#contact-form")

  await form.getByLabel(contact.fieldName).fill("Ada Lovelace")
  await form.getByLabel(contact.fieldCompany).fill("Analytical Engines")
  await form.getByLabel(contact.fieldEmail).fill("ada@gmail.com")
  await form.getByLabel(contact.fieldDetails).fill("I enjoyed reading about your payments work and would like to talk.")
  await form.getByRole("button", { name: contact.send }).click()

  await expect(page.getByText(contact.success)).toBeVisible()
  await expect(form.getByLabel(contact.fieldName)).toHaveValue("")
})
