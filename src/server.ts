import { I18N } from "~/src/integrations/use-intl/i18n.config"
import { resolveLocale } from "~/src/integrations/use-intl/i18n.middleware"
import { extractLocaleFromPath, shouldIgnorePath } from "~/src/integrations/use-intl/i18n.paths"

import { HTTP_STATUS } from "~/src/data/http"

import { serializeCookie } from "~/src/lib/cookie"

import { DOCUMENT_STYLESHEET, fontPreloads } from "~/src/presentation/document-assets"

const HTML = /^text\/html(?:\s*;|$)/iu

const SECURITY_HEADERS = {
  "Content-Security-Policy": "base-uri 'self'; frame-ancestors 'none'; object-src 'none'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "browsing-topics=(), camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const

const STRICT_TRANSPORT_SECURITY = "max-age=31536000; includeSubDomains"

const WWW_PREFIX = "www."

const render = async (request: Request, env: Cloudflare.Env): Promise<Response> => {
  if ((request.method === "GET" || request.method === "HEAD") && !shouldIgnorePath(new URL(request.url).pathname)) {
    const asset = await env.ASSETS.fetch(request)
    if (asset.status !== HTTP_STATUS.NOT_FOUND) {
      return asset
    }
  }
  const { default: handler } = await import("@tanstack/react-start/server-entry")
  return handler.fetch(request)
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

  const response = await render(request, env)
  const { pathname, protocol } = new URL(request.url)

  const isHtml = response.status === HTTP_STATUS.OK && !shouldIgnorePath(pathname) && HTML.test(response.headers.get("Content-Type") ?? "")
  if (!setCookie && !isHtml) {
    return response
  }

  const page = new Response(response.body, response)
  if (setCookie) {
    const cookie = serializeCookie({ name: I18N.COOKIE_NAME, options: { secure: protocol === "https:" }, value: setCookie.value })
    page.headers.append("Set-Cookie", cookie)
  }

  if (!isHtml) {
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
