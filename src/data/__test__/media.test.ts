import { readFileSync } from "node:fs"
import { describe, expect, it } from "vite-plus/test"

import { BREAKPOINT, MEDIA } from "~/src/data/media"

const STYLESHEET = readFileSync("src/presentation/styles/globals.css", "utf8")
const TAILWIND_THEME = readFileSync("node_modules/tailwindcss/theme.css", "utf8")

describe("media queries", () => {
  it("use the breakpoints behind Tailwind's md and lg variants", () => {
    expect(TAILWIND_THEME).toContain(`--breakpoint-md: ${BREAKPOINT.MD};`)
    expect(TAILWIND_THEME).toContain(`--breakpoint-lg: ${BREAKPOINT.LG};`)
  })

  it("match the cover variant and the motion condition the stylesheet defines", () => {
    expect(STYLESHEET).toContain(`@custom-variant cover (@media ${MEDIA.COVER});`)
    expect(STYLESHEET).toContain(`@media ${MEDIA.MOTION_OK} {`)
  })
})
