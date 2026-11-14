import type { ColorToken } from "~/src/data/colors"

export const readColorToken = (token: ColorToken): string => getComputedStyle(document.documentElement).getPropertyValue(token).trim()
