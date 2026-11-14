import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "~/src/integrations/use-intl/i18n.locales"

import { APP_DOMAIN } from "~/src/presentation/branding"

export type { SupportedLocale } from "~/src/integrations/use-intl/i18n.locales"

const COOKIE_NAME = `${APP_DOMAIN}_locale`

const DEFAULT_TIMEZONE = "UTC"

export const I18N = {
  COOKIE_NAME,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  SUPPORTED_LOCALES,
} as const
