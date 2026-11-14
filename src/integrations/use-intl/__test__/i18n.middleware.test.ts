import { describe, expect, it } from "vite-plus/test"

import { localeRedirect } from "~/src/integrations/use-intl/i18n.middleware"

const ALIAS = "https://pjborowiecki.com/pl?query=one"
const CANONICAL = "https://pjborowiecki.com/pl-PL?query=one"
const PERMANENT_REDIRECT = 308

describe("localeRedirect", () => {
  it.each(["GET", "HEAD"])("sends a %s document request for a language alias to its canonical URL", (method) => {
    const response = localeRedirect(new Request(ALIAS, { method }))

    expect(response?.status).toBe(PERMANENT_REDIRECT)
    expect(response?.headers.get("location")).toBe(CANONICAL)
  })

  it("leaves a canonical URL alone", () => {
    expect(localeRedirect(new Request("https://pjborowiecki.com/pl-PL"))).toBeUndefined()
  })

  it.each(["document", "iframe", "frame"])("redirects a %s navigation", (destination) => {
    expect(localeRedirect(new Request(ALIAS, { headers: { "sec-fetch-dest": destination } }))?.status).toBe(PERMANENT_REDIRECT)
  })

  it.each(["empty", "worker", "unknown", "Document", "", "script", "style", "image", "font"])(
    "ignores a request whose Fetch Metadata destination is %j, even when it accepts HTML",
    (destination) => {
      expect(localeRedirect(new Request(ALIAS, { headers: { accept: "text/html", "sec-fetch-dest": destination } }))).toBeUndefined()
    },
  )

  it.each(["text/html", "application/xhtml+xml", "application/json, text/html; q=0.9", "TEXT/HTML; charset=utf-8"])(
    "recognises a document by its Accept header %j when Fetch Metadata is missing",
    (accept) => {
      expect(localeRedirect(new Request(ALIAS, { headers: { accept } }))?.status).toBe(PERMANENT_REDIRECT)
    },
  )

  it.each(["*/*", "text/css,*/*;q=0.1", "application/javascript", "application/json", "text/html-invalid", ""])(
    "ignores a request that accepts %j when Fetch Metadata is missing",
    (accept) => {
      expect(localeRedirect(new Request(ALIAS, { headers: { accept } }))).toBeUndefined()
    },
  )

  it.each(["POST", "PUT", "DELETE"])("ignores a %s request", (method) => {
    expect(localeRedirect(new Request(ALIAS, { headers: { "sec-fetch-dest": "document" }, method }))).toBeUndefined()
  })

  it("ignores server function calls", () => {
    expect(
      localeRedirect(new Request("https://pjborowiecki.com/_serverFn/abc", { headers: { "sec-fetch-dest": "document" } })),
    ).toBeUndefined()
  })
})
