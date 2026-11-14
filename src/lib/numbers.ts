const HALF = 0.5
const PADDED_DIGITS = 2
const PADDING = "0"
const FIRST_POSITION = 1

export const half = (value: number): number => value * HALF

export const padded = (value: number): string => String(value).padStart(PADDED_DIGITS, PADDING)

export const ordinal = (index: number): string => padded(index + FIRST_POSITION)
