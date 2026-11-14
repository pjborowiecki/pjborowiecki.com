import {
  DIAGRAM_NODE_IDS,
  type DiagramCoreEdge,
  type DiagramLayout,
  type DiagramLayoutName,
  type DiagramPoint,
  type DiagramRoute,
} from "~/src/data/system-diagram"
import { DIAGRAM_LAYOUTS } from "~/src/data/system-diagram-layouts"

import { half, mix, noise, smoothstep } from "~/src/lib/numbers"

export interface CoreGeometry {
  readonly edge: DiagramCoreEdge
  readonly loose: readonly number[] | undefined
  readonly straight: readonly number[]
  readonly working: Float32Array
}

export interface CurveWobble {
  readonly control1X: number
  readonly control1Y: number
  readonly control2X: number
  readonly control2Y: number
}

interface Cubic {
  readonly control1: DiagramPoint
  readonly control2: DiagramPoint
  readonly end: DiagramPoint
  readonly start: DiagramPoint
}

interface Corner {
  readonly current: DiagramPoint
  readonly next: DiagramPoint
  readonly previous: DiagramPoint
}

interface LooseCurve {
  readonly from: DiagramPoint
  readonly seed: number
  readonly swing: number
  readonly to: DiagramPoint
}

const FULL = 1
const HALVES = 2
const THIRDS = 3
const ONE_THIRD = FULL / THIRDS
const TWO_THIRDS = HALVES / THIRDS
const NEIGHBOUR = 1

const COORDINATE_DECIMALS = 1

const CORNER_RADIUS = 8
const KAPPA = 0.5523

const FLAT_START = 2
const CUBIC_STRIDE = 6
const CUBIC_OFFSET = { control1X: 0, control1Y: 1, control2X: 2, control2Y: 3, endX: 4, endY: 5 } as const

const BERNSTEIN_OUTER = 3
const DERIVATIVE_INNER = 6

const WOBBLE_SEED = { control1X: 0, control1Y: 1, control2X: 2, control2Y: 3 } as const

const CURVE_MIDPOINT = 0.5
const CURVE_LIFT = 0.8

const CORE_SWING = 0.26
const CORE_SEED = { base: 1, step: 7 } as const

const NODE_EASE = { spread: 1.22, stagger: 0.22 } as const

export const formatCoordinate = (value: number): string => value.toFixed(COORDINATE_DECIMALS)

export const wobble = (seed: number): number => noise(seed) * HALVES - FULL

export const measureWobble = (seed: number): CurveWobble => ({
  control1X: wobble(seed + WOBBLE_SEED.control1X),
  control1Y: wobble(seed + WOBBLE_SEED.control1Y),
  control2X: wobble(seed + WOBBLE_SEED.control2X),
  control2Y: wobble(seed + WOBBLE_SEED.control2Y),
})

export const easeNode = (index: number, order: number): number =>
  smoothstep(0, FULL, order * NODE_EASE.spread - (index / DIAGRAM_NODE_IDS.length) * NODE_EASE.stagger)

const appendStraight = (flat: number[], from: DiagramPoint, to: DiagramPoint): void => {
  flat.push(
    mix(from.x, to.x, ONE_THIRD),
    mix(from.y, to.y, ONE_THIRD),
    mix(from.x, to.x, TWO_THIRDS),
    mix(from.y, to.y, TWO_THIRDS),
    to.x,
    to.y,
  )
}

const appendCorner = (flat: number[], pen: DiagramPoint, { current, next, previous }: Corner): DiagramPoint => {
  const inLength = Math.hypot(current.x - previous.x, current.y - previous.y)
  const outLength = Math.hypot(next.x - current.x, next.y - current.y)
  const radius = Math.min(CORNER_RADIUS, half(inLength), half(outLength))
  const inX = (current.x - previous.x) / inLength
  const inY = (current.y - previous.y) / inLength
  const outX = (next.x - current.x) / outLength
  const outY = (next.y - current.y) / outLength
  const arc = radius * (FULL - KAPPA)
  const exit = { x: current.x + outX * radius, y: current.y + outY * radius }

  appendStraight(flat, pen, { x: current.x - inX * radius, y: current.y - inY * radius })
  flat.push(current.x - inX * arc, current.y - inY * arc, current.x + outX * arc, current.y + outY * arc, exit.x, exit.y)

  return exit
}

const traceRoute = (points: DiagramRoute): number[] => {
  const [first] = points
  const flat = [first.x, first.y]
  let pen: DiagramPoint = first

  for (const [index, current] of points.entries()) {
    const previous = points[index - NEIGHBOUR]
    const next = points[index + NEIGHBOUR]

    if (previous !== undefined && next !== undefined) {
      pen = appendCorner(flat, pen, { current, next, previous })
    } else if (previous !== undefined) {
      appendStraight(flat, pen, current)
    }
  }

  return flat
}

const evaluateCubic = ({ control1, control2, end, start }: Cubic, time: number): DiagramPoint => {
  const inverse = FULL - time

  return {
    x:
      inverse * inverse * inverse * start.x +
      BERNSTEIN_OUTER * inverse * inverse * time * control1.x +
      BERNSTEIN_OUTER * inverse * time * time * control2.x +
      time * time * time * end.x,
    y:
      inverse * inverse * inverse * start.y +
      BERNSTEIN_OUTER * inverse * inverse * time * control1.y +
      BERNSTEIN_OUTER * inverse * time * time * control2.y +
      time * time * time * end.y,
  }
}

const differentiateCubic = ({ control1, control2, end, start }: Cubic, time: number): DiagramPoint => {
  const inverse = FULL - time

  return {
    x:
      BERNSTEIN_OUTER * inverse * inverse * (control1.x - start.x) +
      DERIVATIVE_INNER * inverse * time * (control2.x - control1.x) +
      BERNSTEIN_OUTER * time * time * (end.x - control2.x),
    y:
      BERNSTEIN_OUTER * inverse * inverse * (control1.y - start.y) +
      DERIVATIVE_INNER * inverse * time * (control2.y - control1.y) +
      BERNSTEIN_OUTER * time * time * (end.y - control2.y),
  }
}

const sliceCubic = (cubic: Cubic, time: number, step: number): number[] => {
  const nextTime = time + step
  const start = evaluateCubic(cubic, time)
  const end = evaluateCubic(cubic, nextTime)
  const startSlope = differentiateCubic(cubic, time)
  const endSlope = differentiateCubic(cubic, nextTime)

  return [
    start.x + (startSlope.x * step) / THIRDS,
    start.y + (startSlope.y * step) / THIRDS,
    end.x - (endSlope.x * step) / THIRDS,
    end.y - (endSlope.y * step) / THIRDS,
    end.x,
    end.y,
  ]
}

const splitCubic = (cubic: Cubic, parts: number): number[] => {
  const step = FULL / parts
  const slices = Array.from({ length: parts }, (_, part) => sliceCubic(cubic, part * step, step))

  return [cubic.start.x, cubic.start.y, ...slices.flat()]
}

const bendLooseCurve = ({ from, seed, swing, to }: LooseCurve): Cubic => {
  const rise = to.y - from.y
  const bend = measureWobble(seed)

  return {
    control1: { x: from.x + bend.control1X * swing, y: from.y + rise * CURVE_MIDPOINT + bend.control1Y * swing * CURVE_LIFT },
    control2: { x: to.x + bend.control2X * swing, y: to.y - rise * CURVE_MIDPOINT + bend.control2Y * swing * CURVE_LIFT },
    end: to,
    start: from,
  }
}

const readCoordinate = (flat: ArrayLike<number>, index: number): string => formatCoordinate(flat[index] ?? 0)

export const formatCubicPath = (flat: ArrayLike<number>): string => {
  let path = `M${formatCoordinate(flat[0] ?? 0)} ${formatCoordinate(flat[1] ?? 0)}`

  for (let index = FLAT_START; index < flat.length; index += CUBIC_STRIDE) {
    path += `C${readCoordinate(flat, index + CUBIC_OFFSET.control1X)} ${readCoordinate(flat, index + CUBIC_OFFSET.control1Y)} ${readCoordinate(flat, index + CUBIC_OFFSET.control2X)} ${readCoordinate(flat, index + CUBIC_OFFSET.control2Y)} ${readCoordinate(flat, index + CUBIC_OFFSET.endX)} ${readCoordinate(flat, index + CUBIC_OFFSET.endY)}`
  }

  return path
}

const buildGeometry = (layout: DiagramLayout): readonly CoreGeometry[] =>
  layout.core.map((edge, index) => {
    const straight = traceRoute(edge.route)
    const parts = (straight.length - FLAT_START) / CUBIC_STRIDE
    const curve = bendLooseCurve({
      from: layout.nodes[edge.from].tangle,
      seed: index * CORE_SEED.step + CORE_SEED.base,
      swing: layout.width * CORE_SWING,
      to: layout.nodes[edge.to].tangle,
    })

    return {
      edge,
      loose: edge.born === undefined ? splitCubic(curve, parts) : undefined,
      straight,
      working: new Float32Array(straight.length),
    }
  })

export const DIAGRAM_GEOMETRY: Readonly<Record<DiagramLayoutName, readonly CoreGeometry[]>> = {
  tall: buildGeometry(DIAGRAM_LAYOUTS.tall),
  wide: buildGeometry(DIAGRAM_LAYOUTS.wide),
}
