export const BREAKPOINT = { LG: "64rem", MD: "48rem" } as const

export const MEDIA = {
  BELOW_MD: `(width < ${BREAKPOINT.MD})`,
  COARSE_POINTER: "(pointer: coarse)",
  COVER: "(min-width: 900px) and (min-aspect-ratio: 11 / 10)",
  FINE_POINTER: "(pointer: fine)",
  LG: `(width >= ${BREAKPOINT.LG})`,
  MD: `(width >= ${BREAKPOINT.MD})`,
  MOTION_OK: "(prefers-reduced-motion: no-preference)",
  REDUCED_MOTION: "(prefers-reduced-motion: reduce)",
} as const
