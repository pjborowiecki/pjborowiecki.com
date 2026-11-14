import { env } from "cloudflare:workers"

import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { I18N } from "~/src/integrations/use-intl/i18n.config"

import { HTTP_STATUS } from "~/src/data/http"

import { DOCUMENT_STYLESHEET } from "~/src/presentation/document-assets"
import worker from "~/src/server"

const fetchHandler = vi.hoisted(() => vi.fn<(request: Request) => Promise<Response>>())
vi.mock("@tanstack/react-start/server-entry", () => ({ default: { fetch: fetchHandler } }))

const SECURITY_HEADERS = {
  "content-security-policy": "base-uri 'self'; frame-ancestors 'none'; object-src 'none'",
  "cross-origin-opener-policy": "same-origin",
  "permissions-policy": "browsing-topics=(), camera=(), geolocation=(), microphone=()",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
}

const preload = (font: string): string => `</fonts/${font}>; rel=preload; as=font; type="font/woff2"; crossorigin=anonymous`

const LATIN_PRELOADS = [
  `<${DOCUMENT_STYLESHEET.href}>; rel=preload; as=style`,
  preload("inter-tight-v9-latin.woff2"),
  preload("inter-v20-latin.woff2"),
]

const htmlPage = (body = "<html>Page</html>", status: number = HTTP_STATUS.OK): Response =>
  new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" }, status })

beforeEach(() => {
  fetchHandler.mockReset()
  fetchHandler.mockResolvedValue(new Response("rendered"))
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("security headers", () => {
  it.each(["http://localhost/", "http://localhost/_serverFn/abc", "http://localhost/pl"])("sends them with %s", async (url) => {
    const response = await worker.fetch(new Request(url), env)

    expect(Object.fromEntries(Object.keys(SECURITY_HEADERS).map((name) => [name, response.headers.get(name)]))).toStrictEqual(
      SECURITY_HEADERS,
    )
  })

  it("keeps a stricter policy the response already sets", async () => {
    fetchHandler.mockResolvedValueOnce(new Response("rendered", { headers: { "Content-Security-Policy": "default-src 'self'" } }))

    const response = await worker.fetch(new Request("http://localhost/"), env)

    expect(response.headers.get("content-security-policy")).toBe("default-src 'self'")
    expect(response.headers.get("x-frame-options")).toBe("DENY")
  })

  it("allows exactly the inline scripts of a page it renders", async () => {
    const hydration = 'self.$_TSR={"matches":[]}'
    const page = `<html><head><meta charSet="utf-8"/></head><body><script>${hydration}</script><script type="module" src="/assets/entry.js"></script></body></html>`
    fetchHandler.mockResolvedValueOnce(htmlPage(page, HTTP_STATUS.NOT_FOUND))

    const response = await worker.fetch(new Request("http://localhost/missing"), env)

    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND)
    expect(response.headers.get("content-security-policy")).toBe(
      `${SECURITY_HEADERS["content-security-policy"]}; script-src 'self' https://static.cloudflareinsights.com 'sha256-${createHash("sha256").update(hydration).digest("base64")}'`,
    )
    await expect(response.text()).resolves.toBe(page)
  })

  it("leaves the script policy of a prerendered page to the policy embedded in it", async () => {
    vi.spyOn(env.ASSETS, "fetch").mockResolvedValueOnce(htmlPage())

    const response = await worker.fetch(new Request("http://localhost/"), env)

    expect(response.headers.get("content-security-policy")).toBe(SECURITY_HEADERS["content-security-policy"])
  })

  it("asks browsers to keep using HTTPS only on HTTPS responses", async () => {
    const secure = await worker.fetch(new Request("https://pjborowiecki.com/"), env)
    const local = await worker.fetch(new Request("http://localhost/"), env)

    expect(secure.headers.get("strict-transport-security")).toBe("max-age=31536000; includeSubDomains")
    expect(local.headers.get("strict-transport-security")).toBeNull()
  })

  it("gives static files served without the Worker the same protection", () => {
    const rules = readFileSync("public/_headers", "utf8")

    expect(rules).toContain(`  Content-Security-Policy: ${SECURITY_HEADERS["content-security-policy"]}`)
    expect(rules).toContain(`  Referrer-Policy: ${SECURITY_HEADERS["referrer-policy"]}`)
    expect(rules).toContain(`  X-Content-Type-Options: ${SECURITY_HEADERS["x-content-type-options"]}`)
    expect(rules).toContain(`  X-Frame-Options: ${SECURITY_HEADERS["x-frame-options"]}`)
  })
})

describe("hosts", () => {
  it("sends www visitors to the bare domain, keeping the path and query", async () => {
    const response = await worker.fetch(new Request("https://www.pjborowiecki.com/pl-PL?ref=card"), env)

    expect(response.status).toBe(HTTP_STATUS.PERMANENT_REDIRECT)
    expect(response.headers.get("location")).toBe("https://pjborowiecki.com/pl-PL?ref=card")
    expect(response.headers.get("strict-transport-security")).toBe("max-age=31536000; includeSubDomains")
    expect(fetchHandler).not.toHaveBeenCalled()
  })
})

describe("documents", () => {
  it("redirects a language alias to its canonical locale before rendering", async () => {
    const response = await worker.fetch(new Request("http://localhost/pl?ref=card"), env)

    expect(response.status).toBe(HTTP_STATUS.PERMANENT_REDIRECT)
    expect(response.headers.get("location")).toBe("http://localhost/pl-PL?ref=card")
    expect(fetchHandler).not.toHaveBeenCalled()
  })

  it("serves the prerendered page without rendering it again and remembers the locale", async () => {
    vi.spyOn(env.ASSETS, "fetch").mockResolvedValueOnce(htmlPage("<html>Strona</html>"))

    const response = await worker.fetch(new Request("https://pjborowiecki.com/pl-PL"), env)

    expect(await response.text()).toBe("<html>Strona</html>")
    expect(response.headers.get("set-cookie")).toBe(`${I18N.COOKIE_NAME}=pl-PL; Path=/; Max-Age=31536000; SameSite=Lax; Secure`)
    expect(fetchHandler).not.toHaveBeenCalled()
  })

  it("renders a page that has no prerendered file through TanStack Start", async () => {
    const request = new Request("http://localhost/missing")

    const response = await worker.fetch(request, env)

    expect(await response.text()).toBe("rendered")
    expect(fetchHandler).toHaveBeenCalledExactlyOnceWith(request)
  })

  it("preloads the stylesheet and the Latin fonts with an English page", async () => {
    vi.spyOn(env.ASSETS, "fetch").mockResolvedValueOnce(htmlPage())

    const response = await worker.fetch(new Request("https://pjborowiecki.com/"), env)

    expect(response.headers.get("link")?.split(", ")).toStrictEqual(LATIN_PRELOADS)
  })

  it("adds the Latin Extended fonts for Polish", async () => {
    fetchHandler.mockResolvedValueOnce(htmlPage())

    const response = await worker.fetch(new Request("https://pjborowiecki.com/pl-PL/missing"), env)

    expect(response.headers.get("link")?.split(", ")).toStrictEqual([
      ...LATIN_PRELOADS,
      preload("inter-tight-v9-latin-ext.woff2"),
      preload("inter-v20-latin-ext.woff2"),
    ])
  })

  it.each([HTTP_STATUS.NOT_FOUND, HTTP_STATUS.INTERNAL_SERVER_ERROR])(
    "adds no preloads to an HTML error page with status %s",
    async (status) => {
      fetchHandler.mockResolvedValueOnce(htmlPage("<html>Error</html>", status))

      const response = await worker.fetch(new Request("https://pjborowiecki.com/missing"), env)

      expect(response.status).toBe(status)
      expect(response.headers.get("link")).toBeNull()
    },
  )

  it("leaves server function calls and their responses untouched", async () => {
    fetchHandler.mockResolvedValueOnce(htmlPage("<html>Not a page</html>"))

    const response = await worker.fetch(new Request("https://pjborowiecki.com/_serverFn/abc", { method: "POST" }), env)

    expect(await response.text()).toBe("<html>Not a page</html>")
    expect(response.headers.get("link")).toBeNull()
    expect(response.headers.get("set-cookie")).toBeNull()
  })

  it("remembers the locale on a non-HTML response without adding preloads", async () => {
    vi.spyOn(env.ASSETS, "fetch").mockResolvedValueOnce(new Response("{}", { headers: { "Content-Type": "application/json" } }))

    const response = await worker.fetch(new Request("https://pjborowiecki.com/pl-PL", { headers: { accept: "text/html" } }), env)

    expect(response.headers.get("set-cookie")).toContain(`${I18N.COOKIE_NAME}=pl-PL`)
    expect(response.headers.get("link")).toBeNull()
  })

  it("treats a response without a content type as something other than a page", async () => {
    vi.spyOn(env.ASSETS, "fetch").mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3])))

    const response = await worker.fetch(new Request("https://pjborowiecki.com/"), env)

    expect(response.headers.get("link")).toBeNull()
  })

  it("does not look for a prerendered file for a POST", async () => {
    const assets = vi.spyOn(env.ASSETS, "fetch")

    await worker.fetch(new Request("https://pjborowiecki.com/", { method: "POST" }), env)

    expect(assets).not.toHaveBeenCalled()
    expect(fetchHandler).toHaveBeenCalledOnce()
  })
})
