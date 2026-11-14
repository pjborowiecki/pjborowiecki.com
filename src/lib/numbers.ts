const HALF = 0.5
const UNIT = 1
const PADDED_DIGITS = 2
const PADDING = "0"
const FIRST_POSITION = 1
const HERMITE = { cubic: 2, square: 3 } as const
const NOISE = { frequency: 12.9898, scale: 43_758.5453 } as const

export const half = (value: number): number => value * HALF

export const clampUnit = (value: number): number => Math.min(UNIT, Math.max(0, value))

export const mix = (from: number, to: number, amount: number): number => from + (to - from) * amount

export const smoothstep = (from: number, to: number, value: number): number => {
  const progress = clampUnit((value - from) / (to - from))

  return progress * progress * (HERMITE.square - HERMITE.cubic * progress)
}

export const noise = (seed: number): number => {
  const raw = Math.sin(seed * NOISE.frequency) * NOISE.scale

  return raw - Math.floor(raw)
}

export const padded = (value: number): string => String(value).padStart(PADDED_DIGITS, PADDING)

export const ordinal = (index: number): string => padded(index + FIRST_POSITION)
