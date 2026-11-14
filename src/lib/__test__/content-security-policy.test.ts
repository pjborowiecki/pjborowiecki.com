import { createHash } from "node:crypto"
import { describe, expect, it } from "vite-plus/test"

import { BASE_CONTENT_SECURITY_POLICY } from "~/src/data/http"

import { documentPolicy, embedScriptPolicy, embeddedPolicy, inlineScripts, scriptPolicy } from "~/src/lib/content-security-policy"

const FLAG = "document.documentElement.classList.add('js')"
const HYDRATION = 'self.$_TSR={"matches":[]}'

const PAGE = `<!DOCTYPE html><html><head><meta charSet="utf-8"/><title>Page</title><script>${FLAG}</script></head><body><script type="module" async="" src="/assets/index.js"></script><script data-tsr-stream-part="">${HYDRATION}</script><script>${FLAG}</script></body></html>`

const hashOf = (source: string): string => `'sha256-${createHash("sha256").update(source).digest("base64")}'`

describe("inlineScripts", () => {
  it("reads every inline script and skips scripts loaded from a file", () => {
    expect(inlineScripts(PAGE)).toStrictEqual([FLAG, HYDRATION, FLAG])
  })
})

describe("scriptPolicy", () => {
  it("allows the site, the analytics beacon and each distinct inline script by its hash", async () => {
    await expect(scriptPolicy(PAGE)).resolves.toBe(
      `script-src 'self' https://static.cloudflareinsights.com ${hashOf(FLAG)} ${hashOf(HYDRATION)}`,
    )
  })

  it("hashes the script text as UTF-8", async () => {
    await expect(scriptPolicy("<script>Kraków</script>")).resolves.toContain(hashOf("Kraków"))
  })
})

describe("documentPolicy", () => {
  it("adds the script policy to the base policy every response carries", async () => {
    await expect(documentPolicy(PAGE)).resolves.toBe(`${BASE_CONTENT_SECURITY_POLICY}; ${await scriptPolicy(PAGE)}`)
  })
})

describe("embedScriptPolicy", () => {
  it("places the policy right after the charset, before any script runs", async () => {
    const html = await embedScriptPolicy(PAGE)

    expect(html).toContain(`<meta charSet="utf-8"/><meta http-equiv="Content-Security-Policy" content="${await scriptPolicy(PAGE)}"/>`)
    expect(embeddedPolicy(html)).toBe(await scriptPolicy(PAGE))
  })

  it("refuses a document without a charset declaration", async () => {
    await expect(embedScriptPolicy("<html><head></head></html>")).rejects.toThrow("charset")
  })
})

describe("embeddedPolicy", () => {
  it("finds no policy in a page that has none", () => {
    expect(embeddedPolicy(PAGE)).toBeUndefined()
  })
})
