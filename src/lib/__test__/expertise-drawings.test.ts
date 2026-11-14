import { describe, expect, it } from "vite-plus/test"

import { DRAWINGS } from "~/src/lib/expertise-drawings"

const PATH_COMMAND = /^M[\d. -]+(?:[AHLV][\d. -]+)*Z?$/u
const ONE_DECIMAL = /^-?\d+(?:\.\d)?$/u

const pathsOf = (drawing: (typeof DRAWINGS)[keyof typeof DRAWINGS]): string[] =>
  drawing.flatMap(({ accent = [], dashed = [], faint = [], lines = [], plates = [] }) => [
    ...accent,
    ...dashed,
    ...faint,
    ...lines,
    ...plates,
  ])

describe.each(Object.entries(DRAWINGS))("the %s drawing", (_discipline, drawing) => {
  it("stacks its layers from the back with increasing depth", () => {
    expect(drawing.length).toBeGreaterThan(0)
    expect(drawing.map(({ depth }) => depth)).toStrictEqual(drawing.map((_layer, index) => index + 1))
  })

  it("draws only lines and arcs, with every number rounded to one decimal", () => {
    const paths = pathsOf(drawing)

    expect(paths.length).toBeGreaterThan(0)
    for (const path of paths) {
      expect(path).toMatch(PATH_COMMAND)
      for (const coordinate of path
        .replaceAll(/[AHLMVZ]/gu, " ")
        .trim()
        .split(/\s+/u)) {
        expect(coordinate).toMatch(ONE_DECIMAL)
      }
    }
  })

  it("places its dots on rounded coordinates too", () => {
    for (const [across, down] of drawing.flatMap(({ dots = [] }) => dots)) {
      expect(String(across)).toMatch(ONE_DECIMAL)
      expect(String(down)).toMatch(ONE_DECIMAL)
    }
  })
})
