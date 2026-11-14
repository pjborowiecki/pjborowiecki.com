import { APP_DOMAIN } from "~/src/presentation/branding"

export const HTTP_STATUS = {
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  OK: 200,
  PERMANENT_REDIRECT: 308,
} as const

export const IP_ADDRESS_HEADER = "cf-connecting-ip"

const ONE_DAY_IN_SECONDS = 86_400
const ONE_WEEK_IN_SECONDS = 604_800
const ONE_YEAR_IN_SECONDS = 31_536_000

export const CONTENT_SECURITY_POLICY_HEADER = "Content-Security-Policy"

export const BASE_CONTENT_SECURITY_POLICY = "base-uri 'self'; frame-ancestors 'none'; object-src 'none'"

export const SECURITY_HEADERS = {
  [CONTENT_SECURITY_POLICY_HEADER]: BASE_CONTENT_SECURITY_POLICY,
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "browsing-topics=(), camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const

export const STRICT_TRANSPORT_SECURITY_HEADER = "Strict-Transport-Security"

export const STRICT_TRANSPORT_SECURITY = `max-age=${String(ONE_YEAR_IN_SECONDS)}; includeSubDomains`

const IMMUTABLE_CACHE = `public, max-age=${String(ONE_YEAR_IN_SECONDS)}, immutable`
const REVALIDATED_CACHE = `public, max-age=${String(ONE_DAY_IN_SECONDS)}, stale-while-revalidate=${String(ONE_WEEK_IN_SECONDS)}`

export const STATIC_CACHE_RULES = [
  { cacheControl: IMMUTABLE_CACHE, path: "/assets/*" },
  { cacheControl: IMMUTABLE_CACHE, path: "/fonts/*" },
  { cacheControl: REVALIDATED_CACHE, path: "/images/*" },
  { cacheControl: REVALIDATED_CACHE, path: "/favicon.ico" },
] as const

export const DEPLOYED_HOSTS = {
  preview: `preview.${APP_DOMAIN}`,
  production: APP_DOMAIN,
} as const
