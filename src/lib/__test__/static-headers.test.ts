import { describe, expect, it } from "vite-plus/test"

import { staticHeaders } from "~/src/lib/static-headers"

describe("staticHeaders", () => {
  it("gives every static file the Worker's security headers and HSTS, and caches hashed files for a year", () => {
    expect(staticHeaders()).toBe(
      [
        "/*",
        "  Content-Security-Policy: base-uri 'self'; frame-ancestors 'none'; object-src 'none'",
        "  Cross-Origin-Opener-Policy: same-origin",
        "  Permissions-Policy: browsing-topics=(), camera=(), geolocation=(), microphone=()",
        "  Referrer-Policy: strict-origin-when-cross-origin",
        "  X-Content-Type-Options: nosniff",
        "  X-Frame-Options: DENY",
        "  Strict-Transport-Security: max-age=31536000; includeSubDomains",
        "",
        "/assets/*",
        "  Cache-Control: public, max-age=31536000, immutable",
        "",
        "/fonts/*",
        "  Cache-Control: public, max-age=31536000, immutable",
        "",
        "/images/*",
        "  Cache-Control: public, max-age=86400, stale-while-revalidate=604800",
        "",
        "/favicon.ico",
        "  Cache-Control: public, max-age=86400, stale-while-revalidate=604800",
        "",
      ].join("\n"),
    )
  })
})
