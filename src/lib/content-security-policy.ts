import { BASE_CONTENT_SECURITY_POLICY } from "~/src/data/http"

const SCRIPT_SOURCES = ["'self'", "https://static.cloudflareinsights.com"] as const

const INLINE_SCRIPT_PATTERN = /<script\b(?![^>]*\bsrc=)[^>]*>(?<source>[\s\S]*?)<\/script>/giu
const POLICY_META_PATTERN = /<meta http-equiv="Content-Security-Policy" content="(?<policy>[^"]*)"\/>/u
const DOCUMENT_CHARSET = '<meta charSet="utf-8"/>'

const textEncoder = new TextEncoder()

export const inlineScripts = (html: string): string[] =>
  [...html.matchAll(INLINE_SCRIPT_PATTERN)].map(({ groups }) => groups?.["source"]).filter((source) => source !== undefined)

const sourceHash = async (source: string): Promise<string> => {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", textEncoder.encode(source)))

  return `'sha256-${btoa(String.fromCodePoint(...digest))}'`
}

export const scriptPolicy = async (html: string): Promise<string> => {
  const hashes = await Promise.all([...new Set(inlineScripts(html))].map((source) => sourceHash(source)))

  return `script-src ${[...SCRIPT_SOURCES, ...hashes].join(" ")}`
}

export const documentPolicy = async (html: string): Promise<string> => `${BASE_CONTENT_SECURITY_POLICY}; ${await scriptPolicy(html)}`

export const embeddedPolicy = (html: string): string | undefined => POLICY_META_PATTERN.exec(html)?.groups?.["policy"]

export const embedScriptPolicy = async (html: string): Promise<string> => {
  if (!html.includes(DOCUMENT_CHARSET)) {
    throw new Error("The document has no charset declaration to place its script policy after.")
  }

  const policy = await scriptPolicy(html)

  return html.replace(DOCUMENT_CHARSET, `${DOCUMENT_CHARSET}<meta http-equiv="Content-Security-Policy" content="${policy}"/>`)
}
