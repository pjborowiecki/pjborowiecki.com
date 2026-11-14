import { LIGHT_NAV_GROUNDS, NAV_GROUND } from "~/src/data/marketing"

import { half } from "~/src/lib/numbers"

const SCROLLED_AT = 0.45
const READING_LINE = 0.45
const BACK_TO_TOP_AT = 1.5
const BACK_TO_TOP_PROBE = 48

export const MENU_TONE = "menu"
export const FULL_LAYER = ""
export const HIDDEN_LAYER = "inset(100% 0 0 0)"
export const NO_ARRIVAL = ""

export const BACK_TO_TOP_TONE = {
  DARK: "dark",
  LIGHT: "light",
} as const

export interface Span {
  readonly bottom: number
  readonly top: number
}

export interface Ground extends Span {
  readonly tone: string
}

export interface Crossing {
  readonly arriving: string
  readonly edge: number
  readonly tone: string
}

export interface LayerWrite {
  readonly clip: string
  readonly tone?: string
}

interface Viewport {
  readonly scrollY: number
  readonly viewport: number
}

const contains = ({ bottom, top }: Span, position: number): boolean => top <= position && bottom > position

export const isScrolled = ({ scrollY, viewport }: Viewport): boolean => scrollY > viewport * SCROLLED_AT

export const isReading = (section: Span, { scrollY, viewport }: Viewport): boolean => contains(section, scrollY + viewport * READING_LINE)

export const resolveCrossing = ({
  barHeight,
  grounds,
  scrollY,
  tone,
}: {
  barHeight: number
  grounds: readonly Ground[]
  scrollY: number
  tone: string
}): Crossing => {
  let crossing: Crossing = { arriving: NO_ARRIVAL, edge: barHeight, tone }

  for (const ground of grounds) {
    const start = ground.top - scrollY

    if (start <= 0 && ground.bottom - scrollY > 0) {
      crossing = { arriving: NO_ARRIVAL, edge: barHeight, tone: ground.tone }
    } else if (start > 0 && start < barHeight) {
      crossing = { ...crossing, arriving: ground.tone, edge: start }
    }
  }

  return crossing
}

export const layerWrites = ({
  barHeight,
  crossing: { arriving, edge, tone },
  isMenuUp,
}: {
  barHeight: number
  crossing: Crossing
  isMenuUp: boolean
}): { readonly base: LayerWrite; readonly next: LayerWrite } => {
  if (isMenuUp) {
    return { base: { clip: FULL_LAYER, tone: MENU_TONE }, next: { clip: HIDDEN_LAYER } }
  }

  if (arriving === NO_ARRIVAL || arriving === tone) {
    return { base: { clip: FULL_LAYER, tone }, next: { clip: HIDDEN_LAYER } }
  }

  const isBaseOnTop = edge > half(barHeight)
  const above = `inset(0 0 ${String(barHeight - edge)}px 0)`
  const below = `inset(${String(edge)}px 0 0 0)`

  return {
    base: { clip: isBaseOnTop ? above : below, tone: isBaseOnTop ? tone : arriving },
    next: { clip: isBaseOnTop ? below : above, tone: isBaseOnTop ? arriving : tone },
  }
}

export const backToTop = ({
  grounds,
  isMenuUp,
  scrollY,
  viewport,
}: Viewport & { grounds: readonly Ground[]; isMenuUp: boolean }): { readonly isVisible: boolean; readonly tone: string } => {
  const probe = scrollY + viewport - BACK_TO_TOP_PROBE
  const ground = grounds.findLast((candidate) => contains(candidate, probe))?.tone ?? NAV_GROUND.HERO

  return {
    isVisible: scrollY > viewport * BACK_TO_TOP_AT && !isMenuUp,
    tone: LIGHT_NAV_GROUNDS.has(ground) ? BACK_TO_TOP_TONE.LIGHT : BACK_TO_TOP_TONE.DARK,
  }
}
