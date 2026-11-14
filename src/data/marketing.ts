export const SECTION_IDS = {
  ABOUT: "about",
  AI: "ai",
  CERTIFICATIONS: "certifications",
  CONTACT: "contact",
  HERO: "hero",
  INTRO: "intro",
  PHILOSOPHY: "philosophy",
  SKILLS: "skills",
  WORK: "work",
} as const

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS]

export const NAV_GROUND = {
  BOARD: "board",
  BRONZE: "bronze",
  EMERALD: "emerald",
  FLOOD: "flood",
  GRAPHITE: "graphite",
  HERO: "hero",
  INK: "ink",
  LIT: "lit",
  PAPER: "paper",
} as const

export type NavGround = (typeof NAV_GROUND)[keyof typeof NAV_GROUND]

export const LIGHT_NAV_GROUNDS: ReadonlySet<string> = new Set<string>([NAV_GROUND.BOARD, NAV_GROUND.FLOOD, NAV_GROUND.PAPER])

export const NAV_ITEMS = [
  { key: "philosophy", section: SECTION_IDS.PHILOSOPHY },
  { key: "expertise", section: SECTION_IDS.SKILLS },
  { key: "ai", section: SECTION_IDS.AI },
  { key: "about", section: SECTION_IDS.ABOUT },
  { key: "work", section: SECTION_IDS.WORK },
] as const

export type NavItem = (typeof NAV_ITEMS)[number]

export const sectionHref = (section: SectionId): `#${SectionId}` => `#${section}`
