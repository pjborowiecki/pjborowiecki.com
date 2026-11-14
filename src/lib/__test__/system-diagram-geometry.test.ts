import { describe, expect, it } from "vite-plus/test"

import { DIAGRAM_LAYOUT } from "~/src/data/system-diagram"
import { DIAGRAM_LAYOUTS } from "~/src/data/system-diagram-layouts"

import {
  DIAGRAM_GEOMETRY,
  clamp,
  easeNode,
  formatCoordinate,
  formatCubicPath,
  measureWobble,
  mix,
  wobble,
} from "~/src/lib/system-diagram-geometry"

const CUBIC_STRIDE = 6
const PATH_START = 2

describe("diagram maths", () => {
  it("clamps progress to the unit interval and mixes linearly", () => {
    expect([clamp(-0.5), clamp(0.25), clamp(3)]).toStrictEqual([0, 0.25, 1])
    expect(mix(10, 20, 0.25)).toBe(12.5)
  })

  it("rounds coordinates to one decimal so server and client markup match", () => {
    expect(formatCoordinate(0.1 + 0.2)).toBe("0.3")
    expect(formatCoordinate(-0.04)).toBe("-0.0")
  })

  it("wobbles deterministically within one unit either way", () => {
    for (let seed = 0; seed < 50; seed += 1) {
      expect(wobble(seed)).toBeGreaterThanOrEqual(-1)
      expect(wobble(seed)).toBeLessThan(1)
      expect(wobble(seed)).toBe(wobble(seed))
    }
    expect(measureWobble(4)).toStrictEqual({ control1X: wobble(4), control1Y: wobble(5), control2X: wobble(6), control2Y: wobble(7) })
  })

  it("eases every node from hidden to drawn, later nodes after earlier ones", () => {
    expect(easeNode(0, 0)).toBe(0)
    expect(easeNode(0, 1)).toBe(1)
    expect(easeNode(10, 0.5)).toBeLessThan(easeNode(0, 0.5))
  })

  it("prints a cubic path, reading missing coordinates as zero", () => {
    expect(formatCubicPath([1, 2, 3, 4, 5, 6, 7, 8])).toBe("M1.0 2.0C3.0 4.0 5.0 6.0 7.0 8.0")
    expect(formatCubicPath([1, 2, 3])).toBe("M1.0 2.0C3.0 0.0 0.0 0.0 0.0 0.0")
    expect(formatCubicPath([])).toBe("M0.0 0.0")
  })
})

describe.each(Object.values(DIAGRAM_LAYOUT))("the %s layout", (name) => {
  const layout = DIAGRAM_LAYOUTS[name]
  const geometry = DIAGRAM_GEOMETRY[name]

  it("routes every core edge through its waypoints as whole cubic segments", () => {
    expect(geometry.map(({ edge }) => edge)).toStrictEqual(layout.core)

    for (const { edge, straight, working } of geometry) {
      const [first] = edge.route
      const last = edge.route.at(-1)
      expect((straight.length - PATH_START) % CUBIC_STRIDE).toBe(0)
      expect(straight.slice(0, PATH_START)).toStrictEqual([first.x, first.y])
      expect(straight.slice(-PATH_START)).toStrictEqual([last?.x, last?.y])
      expect(working).toHaveLength(straight.length)
    }
  })

  it("gives every edge that exists before the cleanup a tangled shape to morph from", () => {
    for (const { edge, loose, straight } of geometry) {
      expect(loose === undefined).toBe(edge.born !== undefined)
      if (loose !== undefined) {
        expect(loose).toHaveLength(straight.length)
        expect(loose.slice(0, PATH_START)).toStrictEqual([layout.nodes[edge.from].tangle.x, layout.nodes[edge.from].tangle.y])
      }
    }
  })
})
