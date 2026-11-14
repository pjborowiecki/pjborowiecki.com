import type { SupportedLocale } from "~/src/integrations/use-intl/i18n.config"

import globalsCss from "~/src/presentation/styles/globals.css?url"

export const DOCUMENT_STYLESHEET = { href: globalsCss, rel: "stylesheet" }

const fontPreload = (href: string) => ({
  as: "font",
  crossOrigin: "anonymous" as const,
  href,
  rel: "preload",
  type: "font/woff2",
})

const INTER_LATIN = fontPreload("/fonts/inter-v20-latin.woff2")
const INTER_TIGHT_LATIN = fontPreload("/fonts/inter-tight-v9-latin.woff2")
const INTER_LATIN_EXT = fontPreload("/fonts/inter-v20-latin-ext.woff2")
const INTER_TIGHT_LATIN_EXT = fontPreload("/fonts/inter-tight-v9-latin-ext.woff2")

const LATIN_EXT_LOCALES = new Set<SupportedLocale>(["pl-PL"])

export const fontPreloads = (locale: SupportedLocale) => {
  if (LATIN_EXT_LOCALES.has(locale)) {
    return [INTER_TIGHT_LATIN, INTER_LATIN, INTER_TIGHT_LATIN_EXT, INTER_LATIN_EXT]
  }
  return [INTER_TIGHT_LATIN, INTER_LATIN]
}
