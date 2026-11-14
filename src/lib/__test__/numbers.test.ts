import { describe, expect, it } from "vite-plus/test"

import { half, ordinal, padded } from "~/src/lib/numbers"

describe("numbers", () => {
  it("halves a value", () => {
    expect(half(9)).toBe(4.5)
    expect(half(-3)).toBe(-1.5)
  })

  it("pads a count to two digits and leaves a longer one whole", () => {
    expect(padded(2)).toBe("02")
    expect(padded(12)).toBe("12")
    expect(padded(120)).toBe("120")
  })

  it("numbers an index from 01", () => {
    expect(ordinal(0)).toBe("01")
    expect(ordinal(9)).toBe("10")
  })
})
