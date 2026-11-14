import { afterEach, describe, expect, it } from "vite-plus/test"

import { COLOR_TOKEN } from "~/src/data/colors"

import { readColorToken } from "~/src/lib/color-tokens"

const NAVY = "#0d1526"
const BASE = "--base"

afterEach(() => {
  document.documentElement.removeAttribute("style")
})

describe("readColorToken", () => {
  it("reads a colour defined on the root, through any variable it refers to", () => {
    document.documentElement.style.setProperty(BASE, ` ${NAVY} `)
    document.documentElement.style.setProperty(COLOR_TOKEN.NAVY, `var(${BASE})`)

    expect(readColorToken(COLOR_TOKEN.NAVY)).toBe(NAVY)
  })
})
