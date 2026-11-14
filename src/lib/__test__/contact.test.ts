import { getRequest } from "@tanstack/react-start/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { executeMutation } from "~/src/platform/testing/lib/query"
import {
  RATE_LIMIT_BINDING,
  failEmailDelivery,
  getRateLimitKeys,
  getSentEmails,
  refuseRateLimit,
  refuseRateLimitKey,
} from "~/src/platform/testing/mocks/cloudflare"

import { CONTACT_ERROR } from "~/src/data/contact"
import { IP_ADDRESS_HEADER } from "~/src/data/http"

import { contactFormSchema, submitContactMessage, submitContactMessageMutation } from "~/src/lib/contact"
import * as mailExchange from "~/src/lib/mail-exchange"

import emailEnglish from "~/messages/en-US/emails.contact-email.json"
import emailPolish from "~/messages/pl-PL/emails.contact-email.json"
import { APP_DOMAIN, CONTACT_EMAIL } from "~/src/presentation/branding"

const VISITOR_ADDRESS = "203.0.113.7"

const ADDRESS_KEY = `address:${VISITOR_ADDRESS}`
const SENDER_KEY = "sender:ada@example.org"
const SITE_KEY = "all"

const MESSAGE = {
  company: "Acme",
  details: "I would like to talk about your payments work.",
  email: "ada@example.org",
  locale: "en-US",
  name: "Ada Lovelace",
} as const

beforeEach(() => {
  vi.spyOn(mailExchange, "checkMailExchange").mockResolvedValue(mailExchange.MAIL_EXCHANGE.ACCEPTS)
  vi.mocked(getRequest).mockReturnValue(
    new Request("https://preview.pjborowiecki.com/", { headers: { [IP_ADDRESS_HEADER]: VISITOR_ADDRESS } }),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("contactFormSchema", () => {
  it("trims the fields and accepts a message without a company", () => {
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
  it("sends the message to the owner, replying to the visitor, with every answer in the email", async () => {
    await submitContactMessage({ data: MESSAGE })

    const [sent] = getSentEmails()
    expect(sent).toMatchObject({
      from: { email: CONTACT_EMAIL, name: APP_DOMAIN },
      replyTo: { email: MESSAGE.email, name: MESSAGE.name },
      subject: "New message from Ada Lovelace (Acme)",
      to: CONTACT_EMAIL,
    })
    expect(sent?.html).toContain(MESSAGE.details)
    expect(sent?.text).toContain(MESSAGE.company)
    expect(sent?.text).not.toContain(emailEnglish.unverifiedDomain)
    expect(getRateLimitKeys()).toStrictEqual([ADDRESS_KEY, SENDER_KEY])
    expect(getRateLimitKeys(RATE_LIMIT_BINDING.GLOBAL)).toStrictEqual([SITE_KEY])
  })

  it("writes the email in the visitor's language and marks what they left out", async () => {
    await submitContactMessage({ data: { company: "", details: "Dzień dobry", email: "jan@example.org", locale: "pl-PL", name: "Jan" } })

    const [sent] = getSentEmails()
    expect(sent?.subject).toBe("Nowa wiadomość od Jan")
    expect(sent?.text).toContain(emailPolish.notProvided)
  })

  it("refuses a client address that has sent too many messages", async () => {
    refuseRateLimitKey(ADDRESS_KEY)

    await expect(submitContactMessage({ data: MESSAGE })).rejects.toThrow(CONTACT_ERROR.RATE_LIMITED)
    expect(getRateLimitKeys()).toStrictEqual([ADDRESS_KEY])
    expect(getSentEmails()).toHaveLength(0)
  })

  it("refuses a sender who has sent too many messages, whatever address they come from", async () => {
    refuseRateLimitKey(SENDER_KEY)

    await expect(submitContactMessage({ data: { ...MESSAGE, email: "Ada@Example.org" } })).rejects.toThrow(CONTACT_ERROR.RATE_LIMITED)
    expect(getRateLimitKeys(RATE_LIMIT_BINDING.GLOBAL)).toHaveLength(0)
    expect(getSentEmails()).toHaveLength(0)
  })

  it("refuses every message once the site has received too many in a minute", async () => {
    refuseRateLimit(RATE_LIMIT_BINDING.GLOBAL)

    await expect(submitContactMessage({ data: MESSAGE })).rejects.toThrow(CONTACT_ERROR.RATE_LIMITED)
    expect(getSentEmails()).toHaveLength(0)
  })

  it("rate limits requests without a client address under one shared key", async () => {
    vi.mocked(getRequest).mockReturnValue(new Request("https://preview.pjborowiecki.com/"))

    await submitContactMessage({ data: MESSAGE })

    expect(getRateLimitKeys()).toStrictEqual(["address:unknown", SENDER_KEY])
  })

  it("refuses an address whose domain cannot receive mail", async () => {
    vi.spyOn(mailExchange, "checkMailExchange").mockResolvedValue(mailExchange.MAIL_EXCHANGE.REFUSES)

    await expect(submitContactMessage({ data: MESSAGE })).rejects.toThrow(CONTACT_ERROR.INVALID_EMAIL)
    expect(getSentEmails()).toHaveLength(0)
  })

  it("sends a message whose domain could not be checked, and says so in the email", async () => {
    vi.spyOn(mailExchange, "checkMailExchange").mockResolvedValue(mailExchange.MAIL_EXCHANGE.UNKNOWN)

    await submitContactMessage({ data: MESSAGE })

    const [sent] = getSentEmails()
    expect(sent?.text).toContain(emailEnglish.unverifiedDomain)
  })

  it("reports a failed delivery without leaking the provider's error", async () => {
    failEmailDelivery(new Error("sending domain not verified"))
    vi.spyOn(console, "error").mockReturnValue()

    await expect(submitContactMessage({ data: MESSAGE })).rejects.toThrow(CONTACT_ERROR.SEND_FAILED)
  })

  it("rejects input that does not match the schema before doing any work", async () => {
    await expect(submitContactMessage({ data: { ...MESSAGE, email: "not-an-email" } })).rejects.toThrow()
    expect(getRateLimitKeys()).toHaveLength(0)
  })
})

describe("submitContactMessageMutation", () => {
  it("calls the server function with the message", async () => {
    await executeMutation(submitContactMessageMutation, MESSAGE)

    expect(getSentEmails()).toHaveLength(1)
  })
})
