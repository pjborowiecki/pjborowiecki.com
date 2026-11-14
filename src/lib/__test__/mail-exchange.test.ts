import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { MAIL_EXCHANGE, checkMailExchange, emailDomain } from "~/src/lib/mail-exchange"

const MX = 15
const ADDRESS_RECORD = 1
const NO_ERROR = 0
const NAME_ERROR = 3

const CLOUDFLARE_LOOKUP = "https://cloudflare-dns.com/dns-query?name=example.org&type=MX"
const GOOGLE_LOOKUP = "https://dns.google/resolve?name=example.org&type=MX"

const answer = (body: unknown): Response => Response.json(body)

const mailExchanger = (): Response => answer({ Answer: [{ data: "10 mx.example.org.", type: MX }], Status: NO_ERROR })

const lookedUp = (lookup: { mock: { calls: unknown[][] } }): string[] =>
  lookup.mock.calls.map(([url]) => (url instanceof URL ? url.href : String(url)))

afterEach(() => {
  vi.restoreAllMocks()
})

describe("emailDomain", () => {
  it("reads the lower-cased domain after the last at sign", () => {
    expect(emailDomain("Piotr@Example.COM")).toBe("example.com")
    expect(emailDomain("first@last@Mail.Example.org")).toBe("mail.example.org")
  })
})

describe("checkMailExchange", () => {
  it("asks Cloudflare's DNS over HTTPS for the domain's MX records", async () => {
    const lookup = vi.spyOn(globalThis, "fetch").mockResolvedValue(mailExchanger())

    await expect(checkMailExchange("example.org")).resolves.toBe(MAIL_EXCHANGE.ACCEPTS)

    expect(lookedUp(lookup)).toStrictEqual([CLOUDFLARE_LOOKUP])
    expect(lookup.mock.calls[0]?.[1]?.headers).toStrictEqual({ accept: "application/dns-json" })
  })

  it("refuses a domain that publishes a null MX record", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(answer({ Answer: [{ data: "0 .", type: MX }], Status: NO_ERROR }))

    await expect(checkMailExchange("example.com")).resolves.toBe(MAIL_EXCHANGE.REFUSES)
  })

  it("refuses a domain without MX records", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(answer({ Answer: [{ data: "192.0.2.1", type: ADDRESS_RECORD }], Status: NO_ERROR }))

    await expect(checkMailExchange("no-mail.example")).resolves.toBe(MAIL_EXCHANGE.REFUSES)
  })

  it("refuses a domain that does not exist", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(answer({ Status: NAME_ERROR }))

    await expect(checkMailExchange("missing.invalid")).resolves.toBe(MAIL_EXCHANGE.REFUSES)
  })

  it("asks Google's DNS over HTTPS when Cloudflare's does not answer", async () => {
    const lookup = vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new TypeError("network down")).mockResolvedValue(mailExchanger())

    await expect(checkMailExchange("example.org")).resolves.toBe(MAIL_EXCHANGE.ACCEPTS)

    expect(lookedUp(lookup)).toStrictEqual([CLOUDFLARE_LOOKUP, GOOGLE_LOOKUP])
  })

  it("asks Google's DNS over HTTPS when Cloudflare's answers with something unreadable", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(answer({ unexpected: true }))
      .mockResolvedValue(mailExchanger())

    await expect(checkMailExchange("example.org")).resolves.toBe(MAIL_EXCHANGE.ACCEPTS)
  })

  it("cannot tell when neither resolver answers", async () => {
    const lookup = vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("network down"))

    await expect(checkMailExchange("example.org")).resolves.toBe(MAIL_EXCHANGE.UNKNOWN)

    expect(lookedUp(lookup)).toStrictEqual([CLOUDFLARE_LOOKUP, GOOGLE_LOOKUP])
  })
})
