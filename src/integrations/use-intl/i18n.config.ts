import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "~/src/integrations/use-intl/i18n.locales"

export type { SupportedLocale } from "~/src/integrations/use-intl/i18n.locales"

const DEFAULT_TIMEZONE = "UTC"

export const I18N = {
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  SUPPORTED_LOCALES,
} as const
