import "@tanstack/react-start/server-only"

import { canonicalizePathname, shouldIgnorePath } from "~/src/integrations/use-intl/i18n.paths"

import { HTTP_STATUS } from "~/src/data/http"

const HTML_ACCEPT_PATTERN = /(?:^|,)\s*(?:text\/html|application\/xhtml\+xml)(?:\s*;|,|$)/iu
const DOCUMENT_DESTINATIONS = new Set(["document", "frame", "iframe"])

const isDocumentRequest = (request: Request): boolean => {
  const destination = request.headers.get("sec-fetch-dest")
  if (destination !== null) {
    return DOCUMENT_DESTINATIONS.has(destination)
  }
  const accept = request.headers.get("accept")
  return accept === null || HTML_ACCEPT_PATTERN.test(accept)
}

export const localeRedirect = (request: Request): Response | undefined => {
  const url = new URL(request.url)
  const { pathname } = url

  if ((request.method !== "GET" && request.method !== "HEAD") || !isDocumentRequest(request) || shouldIgnorePath(pathname)) {
    return undefined
  }

  const canonical = canonicalizePathname(pathname)

  if (canonical === pathname) {
    return undefined
  }

  url.pathname = canonical

  return Response.redirect(url.href, HTTP_STATUS.PERMANENT_REDIRECT)
}
