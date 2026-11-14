export const COLOR_TOKEN = {
  CHAMPAGNE: "--champagne",
  CREAM: "--cream",
  EMERALD: "--emerald",
  EMERALD_DEEP: "--emerald-deep",
  EMERALD_LIT: "--emerald-lit",
  NAVY: "--navy",
} as const

export type ColorToken = (typeof COLOR_TOKEN)[keyof typeof COLOR_TOKEN]
