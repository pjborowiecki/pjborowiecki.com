import type { CONSTANTS } from "~/src/constants"

export type Locale = (typeof CONSTANTS.LOCALES)[number]
export type DefaultLocale = typeof CONSTANTS.DEFAULT_LOCALE
