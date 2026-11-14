import { I18N } from "~/src/integrations/use-intl/i18n.config"
import { resolveLocale } from "~/src/integrations/use-intl/i18n.middleware"
import { extractLocaleFromPath, shouldIgnorePath } from "~/src/integrations/use-intl/i18n.paths"

import { HTTP_STATUS } from "~/src/data/http"

import { BASE_POLICY, CONTENT_SECURITY_POLICY_HEADER, documentPolicy } from "~/src/lib/content-security-policy"
import { serializeCookie } from "~/src/lib/cookie"

import { DOCUMENT_STYLESHEET, fontPreloads } from "~/src/presentation/document-assets"

const HTML = /^text\/html(?:\s*;|$)/iu

const SECURITY_HEADERS = {
  [CONTENT_SECURITY_POLICY_HEADER]: BASE_POLICY,
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "browsing-topics=(), camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const

const STRICT_TRANSPORT_SECURITY = "max-age=31536000; includeSubDomains"

const WWW_PREFIX = "www."

interface Rendered {
  readonly isPrerendered: boolean
  readonly response: Response
}

const isHtml = (response: Response): boolean => HTML.test(response.headers.get("Content-Type") ?? "")

const render = async (request: Request, env: Cloudflare.Env): Promise<Rendered> => {
  if ((request.method === "GET" || request.method === "HEAD") && !shouldIgnorePath(new URL(request.url).pathname)) {
    const asset = await env.ASSETS.fetch(request)
    if (asset.status !== HTTP_STATUS.NOT_FOUND) {
      return { isPrerendered: true, response: asset }
    }
  }
  const { default: handler } = await import("@tanstack/react-start/server-entry")
  return { isPrerendered: false, response: await handler.fetch(request) }
}

const withScriptPolicy = async (response: Response): Promise<Response> => {
  const html = await response.text()
  const page = new Response(html, response)
  page.headers.set(CONTENT_SECURITY_POLICY_HEADER, await documentPolicy(html))

  return page
}

const withSecurityHeaders = (response: Response, protocol: string): Response => {
  const secured = new Response(response.body, response)

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!secured.headers.has(name)) {
      secured.headers.set(name, value)
    }
  }
  if (protocol === "https:" && !secured.headers.has("Strict-Transport-Security")) {
    secured.headers.set("Strict-Transport-Security", STRICT_TRANSPORT_SECURITY)
  }

  return secured
}

const respond = async (request: Request, env: Cloudflare.Env): Promise<Response> => {
  const { redirect, setCookie } = resolveLocale(request)

  if (redirect) {
    return redirect
  }

  const rendered = await render(request, env)
  const response = rendered.isPrerendered || !isHtml(rendered.response) ? rendered.response : await withScriptPolicy(rendered.response)
  const { pathname, protocol } = new URL(request.url)

  const isPage = response.status === HTTP_STATUS.OK && !shouldIgnorePath(pathname) && isHtml(response)
  if (!setCookie && !isPage) {
    return response
  }

  const page = new Response(response.body, response)
  if (setCookie) {
    const cookie = serializeCookie({ name: I18N.COOKIE_NAME, options: { secure: protocol === "https:" }, value: setCookie.value })
    page.headers.append("Set-Cookie", cookie)
  }

  if (!isPage) {
    return page
  }

  const locale = extractLocaleFromPath(pathname) ?? I18N.DEFAULT_LOCALE

  const fonts = fontPreloads(locale).map(
    (font) => `<${font.href}>; rel=preload; as=font; type="${font.type}"; crossorigin=${font.crossOrigin}`,
  )

  page.headers.append("Link", [`<${DOCUMENT_STYLESHEET.href}>; rel=preload; as=style`, ...fonts].join(", "))

  return page
}

const redirectToBareHost = (url: URL): Response => {
  const bare = new URL(url)
  bare.hostname = url.hostname.slice(WWW_PREFIX.length)

  return Response.redirect(bare.href, HTTP_STATUS.PERMANENT_REDIRECT)
}

export default {
  async fetch(request: Request, env: Cloudflare.Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.hostname.startsWith(WWW_PREFIX)) {
      return withSecurityHeaders(redirectToBareHost(url), url.protocol)
    }

    return withSecurityHeaders(await respond(request, env), url.protocol)
  },
} satisfies ExportedHandler<Cloudflare.Env>
