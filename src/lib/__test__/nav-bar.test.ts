import { describe, expect, it } from "vite-plus/test"

import { NAV_GROUND } from "~/src/data/marketing"

import {
  BACK_TO_TOP_TONE,
  FULL_LAYER,
  type Ground,
  HIDDEN_LAYER,
  MENU_TONE,
  NO_ARRIVAL,
  backToTop,
  isReading,
  isScrolled,
  layerWrites,
  resolveCrossing,
} from "~/src/lib/nav-bar"

const BAR = 60
const VIEWPORT = 800

const GROUNDS: readonly Ground[] = [
  { bottom: 800, tone: NAV_GROUND.HERO, top: 0 },
  { bottom: 1600, tone: NAV_GROUND.PAPER, top: 800 },
  { bottom: 2400, tone: NAV_GROUND.EMERALD, top: 1600 },
]

describe("resolveCrossing", () => {
  it("takes the tone of the ground under the bar when no other ground reaches it", () => {
    expect(resolveCrossing({ barHeight: BAR, grounds: GROUNDS, scrollY: 1000, tone: NAV_GROUND.HERO })).toStrictEqual({
      arriving: NO_ARRIVAL,
      edge: BAR,
      tone: NAV_GROUND.PAPER,
    })
  })

  it("reports the ground sliding in under the bar and where its edge is", () => {
    expect(resolveCrossing({ barHeight: BAR, grounds: GROUNDS, scrollY: 1570, tone: NAV_GROUND.HERO })).toStrictEqual({
      arriving: NAV_GROUND.EMERALD,
      edge: 30,
      tone: NAV_GROUND.PAPER,
    })
  })

  it("keeps the last tone above every ground", () => {
    expect(resolveCrossing({ barHeight: BAR, grounds: GROUNDS, scrollY: 3000, tone: NAV_GROUND.INK })).toStrictEqual({
      arriving: NO_ARRIVAL,
      edge: BAR,
      tone: NAV_GROUND.INK,
    })
  })
})

describe("layerWrites", () => {
  const settled = { arriving: NO_ARRIVAL, edge: BAR, tone: NAV_GROUND.PAPER }

  it("shows one full layer in the menu tone while the menu is open", () => {
    expect(layerWrites({ barHeight: BAR, crossing: settled, isMenuUp: true })).toStrictEqual({
      base: { clip: FULL_LAYER, tone: MENU_TONE },
      next: { clip: HIDDEN_LAYER },
    })
  })

  it.each([NO_ARRIVAL, NAV_GROUND.PAPER])("shows one full layer when %j arrives", (arriving) => {
    expect(layerWrites({ barHeight: BAR, crossing: { ...settled, arriving }, isMenuUp: false })).toStrictEqual({
      base: { clip: FULL_LAYER, tone: NAV_GROUND.PAPER },
      next: { clip: HIDDEN_LAYER },
    })
  })

  it("keeps the current tone on top while the arriving ground covers less than half the bar", () => {
    expect(layerWrites({ barHeight: BAR, crossing: { ...settled, arriving: NAV_GROUND.INK, edge: 40 }, isMenuUp: false })).toStrictEqual({
      base: { clip: "inset(0 0 20px 0)", tone: NAV_GROUND.PAPER },
      next: { clip: "inset(40px 0 0 0)", tone: NAV_GROUND.INK },
    })
  })

  it("hands the top to the arriving tone once it covers more than half the bar", () => {
    expect(layerWrites({ barHeight: BAR, crossing: { ...settled, arriving: NAV_GROUND.INK, edge: 20 }, isMenuUp: false })).toStrictEqual({
      base: { clip: "inset(20px 0 0 0)", tone: NAV_GROUND.INK },
      next: { clip: "inset(0 0 40px 0)", tone: NAV_GROUND.PAPER },
    })
  })
})

describe("isScrolled and isReading", () => {
  it("counts the page as scrolled past almost half a screen", () => {
    expect(isScrolled({ scrollY: 300, viewport: VIEWPORT })).toBe(false)
    expect(isScrolled({ scrollY: 400, viewport: VIEWPORT })).toBe(true)
  })

  it("reads the section crossing the reading line", () => {
    const section = { bottom: 1600, top: 800 }

    expect(isReading(section, { scrollY: 400, viewport: VIEWPORT })).toBe(false)
    expect(isReading(section, { scrollY: 500, viewport: VIEWPORT })).toBe(true)
    expect(isReading(section, { scrollY: 1300, viewport: VIEWPORT })).toBe(false)
  })
})

describe("backToTop", () => {
  it("stays hidden near the top and while the menu is open", () => {
    expect(backToTop({ grounds: GROUNDS, isMenuUp: false, scrollY: 1000, viewport: VIEWPORT }).isVisible).toBe(false)
    expect(backToTop({ grounds: GROUNDS, isMenuUp: true, scrollY: 1300, viewport: VIEWPORT }).isVisible).toBe(false)
    expect(backToTop({ grounds: GROUNDS, isMenuUp: false, scrollY: 1300, viewport: VIEWPORT }).isVisible).toBe(true)
  })

  it("takes the light tone over a light ground and the dark tone elsewhere", () => {
    expect(backToTop({ grounds: GROUNDS, isMenuUp: false, scrollY: 400, viewport: VIEWPORT }).tone).toBe(BACK_TO_TOP_TONE.LIGHT)
    expect(backToTop({ grounds: GROUNDS, isMenuUp: false, scrollY: 1300, viewport: VIEWPORT }).tone).toBe(BACK_TO_TOP_TONE.DARK)
    expect(backToTop({ grounds: GROUNDS, isMenuUp: false, scrollY: 5000, viewport: VIEWPORT }).tone).toBe(BACK_TO_TOP_TONE.DARK)
  })
})
