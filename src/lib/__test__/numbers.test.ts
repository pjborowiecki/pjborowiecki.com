import { describe, expect, it } from "vite-plus/test"

import { clampUnit, half, mix, noise, ordinal, padded, smoothstep } from "~/src/lib/numbers"

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

describe("interpolation", () => {
  it("clamps to the unit interval", () => {
    expect([clampUnit(-0.5), clampUnit(0.25), clampUnit(3)]).toStrictEqual([0, 0.25, 1])
  })

  it("mixes linearly", () => {
    expect(mix(10, 20, 0.25)).toBe(12.5)
  })

  it("eases between two edges and holds outside them", () => {
    expect([smoothstep(10, 20, 5), smoothstep(10, 20, 15), smoothstep(10, 20, 25)]).toStrictEqual([0, 0.5, 1])
    expect(smoothstep(0, 1, 0.25)).toBeCloseTo(0.15625)
  })
})

describe("noise", () => {
  it("gives the same value in the unit interval for the same seed", () => {
    const values = [0, 1, 7, 91].map((seed) => noise(seed))

    expect(values).toStrictEqual([0, 1, 7, 91].map((seed) => noise(seed)))
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true)
    expect(new Set(values).size).toBe(values.length)
  })
})
