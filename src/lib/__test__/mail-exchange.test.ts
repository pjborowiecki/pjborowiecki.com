import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { acceptsMail, emailDomain } from "~/src/lib/mail-exchange"

const MX = 15
const ADDRESS_RECORD = 1
const NO_ERROR = 0
const NAME_ERROR = 3

const answer = (body: unknown): Response => Response.json(body)

afterEach(() => {
  vi.restoreAllMocks()
})

describe("emailDomain", () => {
  it("reads the lower-cased domain after the last at sign", () => {
    expect(emailDomain("Piotr@Example.COM")).toBe("example.com")
    expect(emailDomain("first@last@Mail.Example.org")).toBe("mail.example.org")
  })
})

describe("acceptsMail", () => {
  it("asks Cloudflare's DNS over HTTPS for the domain's MX records", async () => {
    const lookup = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(answer({ Answer: [{ data: "10 mx.example.org.", type: MX }], Status: NO_ERROR }))

    await expect(acceptsMail("example.org")).resolves.toBe(true)

    const [url, init] = lookup.mock.calls[0] ?? []
    expect(url instanceof URL && url.href).toBe("https://cloudflare-dns.com/dns-query?name=example.org&type=MX")
    expect(init?.headers).toStrictEqual({ accept: "application/dns-json" })
  })

  it("refuses a domain that publishes a null MX record", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(answer({ Answer: [{ data: "0 .", type: MX }], Status: NO_ERROR }))

    await expect(acceptsMail("example.com")).resolves.toBe(false)
  })

  it("refuses a domain without MX records", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(answer({ Answer: [{ data: "192.0.2.1", type: ADDRESS_RECORD }], Status: NO_ERROR }))

    await expect(acceptsMail("no-mail.example")).resolves.toBe(false)
  })

  it("refuses a domain that does not exist", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(answer({ Status: NAME_ERROR }))

    await expect(acceptsMail("missing.invalid")).resolves.toBe(false)
  })

  it("lets the enquiry through when the lookup itself fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("network down"))

    await expect(acceptsMail("example.org")).resolves.toBe(true)
  })
})
