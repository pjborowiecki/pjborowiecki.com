import { SECURITY_HEADERS, STATIC_CACHE_RULES, STRICT_TRANSPORT_SECURITY, STRICT_TRANSPORT_SECURITY_HEADER } from "~/src/data/http"

const EVERY_PATH = "/*"

const rule = (path: string, headers: Readonly<Record<string, string>>): string =>
  [path, ...Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`)].join("\n")

export const staticHeaders = (): string =>
  `${[
    rule(EVERY_PATH, { ...SECURITY_HEADERS, [STRICT_TRANSPORT_SECURITY_HEADER]: STRICT_TRANSPORT_SECURITY }),
    ...STATIC_CACHE_RULES.map(({ cacheControl, path }) => rule(path, { "Cache-Control": cacheControl })),
  ].join("\n\n")}\n`
