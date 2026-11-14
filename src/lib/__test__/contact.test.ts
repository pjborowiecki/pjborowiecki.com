import { getRequest } from "@tanstack/react-start/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { executeMutation } from "~/src/platform/testing/lib/query"
import { failEmailDelivery, getRateLimitKeys, getSentEmails, refuseRateLimit } from "~/src/platform/testing/mocks/cloudflare"

import { CONTACT_BUDGET, CONTACT_ERROR, CONTACT_NEED } from "~/src/data/contact"
import { IP_ADDRESS_HEADER } from "~/src/data/http"

import { contactFormSchema, submitContactMessage, submitContactMessageMutation } from "~/src/lib/contact"
import * as mailExchange from "~/src/lib/mail-exchange"

import emailEnglish from "~/messages/en-US/emails.contact-email.json"
import emailPolish from "~/messages/pl-PL/emails.contact-email.json"
import { APP_DOMAIN, CONTACT_EMAIL } from "~/src/presentation/branding"

const VISITOR_ADDRESS = "203.0.113.7"

const ENQUIRY = {
  budget: CONTACT_BUDGET.FROM_40K,
  company: "Acme",
  details: "We need an audit of our checkout.",
  email: "ada@example.org",
  locale: "en-US",
  name: "Ada Lovelace",
  need: CONTACT_NEED.AUDIT,
} as const

beforeEach(() => {
  vi.spyOn(mailExchange, "acceptsMail").mockResolvedValue(true)
  vi.mocked(getRequest).mockReturnValue(
    new Request("https://preview.pjborowiecki.com/", { headers: { [IP_ADDRESS_HEADER]: VISITOR_ADDRESS } }),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("contactFormSchema", () => {
  it("trims the fields and accepts an enquiry without a company, need or budget", () => {
    expect(contactFormSchema.parse({ company: "", details: "  Hello  ", email: "ada@example.org", name: " Ada " })).toStrictEqual({
      company: "",
      details: "Hello",
      email: "ada@example.org",
      name: "Ada",
    })
  })

  it("names the translation key of every problem", () => {
    const { error } = contactFormSchema.safeParse({ company: "x".repeat(161), details: " ", email: "nope", name: "" })

    expect(error?.issues.map(({ message, path }) => [path.join("."), message])).toStrictEqual([
      ["company", "companyTooLong"],
      ["details", "detailsRequired"],
      ["email", "emailRequired"],
      ["name", "nameRequired"],
    ])
  })
})

describe("submitContactMessage", () => {
  it("sends the enquiry to the owner, replying to the visitor, with every answer in the email", async () => {
    await submitContactMessage({ data: ENQUIRY })

    const [sent] = getSentEmails()
    expect(sent).toMatchObject({
      from: { email: CONTACT_EMAIL, name: APP_DOMAIN },
      replyTo: { email: ENQUIRY.email, name: ENQUIRY.name },
      subject: "New enquiry from Ada Lovelace (Acme)",
      to: CONTACT_EMAIL,
    })
    expect(sent?.html).toContain(ENQUIRY.details)
    expect(sent?.html).toContain(emailEnglish.needs.audit)
    expect(sent?.text).toContain(emailEnglish.budgets.from40k)
    expect(getRateLimitKeys()).toStrictEqual([VISITOR_ADDRESS])
  })

  it("writes the email in the visitor's language and marks what they left out", async () => {
    await submitContactMessage({ data: { company: "", details: "Dzień dobry", email: "jan@example.org", locale: "pl-PL", name: "Jan" } })

    const [sent] = getSentEmails()
    expect(sent?.subject).toBe("Nowe zapytanie od Jan")
    expect(sent?.text).toContain(emailPolish.notProvided)
  })

  it("refuses a visitor who has sent too many enquiries", async () => {
    refuseRateLimit()

    await expect(submitContactMessage({ data: ENQUIRY })).rejects.toThrow(CONTACT_ERROR.RATE_LIMITED)
    expect(getSentEmails()).toHaveLength(0)
  })

  it("rate limits requests without a client address under one shared key", async () => {
    vi.mocked(getRequest).mockReturnValue(new Request("https://preview.pjborowiecki.com/"))

    await submitContactMessage({ data: ENQUIRY })

    expect(getRateLimitKeys()).toStrictEqual(["unknown"])
  })

  it("refuses an address whose domain cannot receive mail", async () => {
    vi.spyOn(mailExchange, "acceptsMail").mockResolvedValue(false)

    await expect(submitContactMessage({ data: ENQUIRY })).rejects.toThrow(CONTACT_ERROR.INVALID_EMAIL)
    expect(getSentEmails()).toHaveLength(0)
  })

  it("reports a failed delivery without leaking the provider's error", async () => {
    failEmailDelivery(new Error("sending domain not verified"))
    vi.spyOn(console, "error").mockReturnValue()

    await expect(submitContactMessage({ data: ENQUIRY })).rejects.toThrow(CONTACT_ERROR.SEND_FAILED)
  })

  it("rejects input that does not match the schema before doing any work", async () => {
    await expect(submitContactMessage({ data: { ...ENQUIRY, email: "not-an-email" } })).rejects.toThrow()
    expect(getRateLimitKeys()).toHaveLength(0)
  })
})

describe("submitContactMessageMutation", () => {
  it("calls the server function with the enquiry", async () => {
    await executeMutation(submitContactMessageMutation, ENQUIRY)

    expect(getSentEmails()).toHaveLength(1)
  })
})
