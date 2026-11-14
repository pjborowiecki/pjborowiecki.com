export type Discipline = "ai" | "interfaces" | "payments" | "products"

export type Point = readonly [number, number]

interface Layer {
  readonly accent?: readonly string[]
  readonly dashed?: readonly string[]
  readonly dots?: readonly Point[]
  readonly faint?: readonly string[]
  readonly lines?: readonly string[]
  readonly plates?: readonly string[]
}

export interface DrawingLayer extends Layer {
  readonly depth: number
}

interface Spot {
  readonly x: number
  readonly y: number
  readonly z: number
}

interface Origin {
  readonly scale?: number
  readonly x: number
  readonly y: number
}

type Project = (spot: Spot) => Point

interface Area {
  readonly elevation: number
  readonly x0: number
  readonly x1: number
  readonly y0: number
  readonly y1: number
}

interface Box {
  readonly depth: number
  readonly height: number
  readonly width: number
  readonly x: number
  readonly y: number
  readonly z: number
}

interface Drum {
  readonly height: number
  readonly radius: number
  readonly x: number
  readonly y: number
  readonly z: number
}

interface Arc {
  readonly cx: number
  readonly cy: number
  readonly rx: number
  readonly ry: number
  readonly sweep: Sweep
}

interface Panel {
  readonly plane: number
  readonly x0: number
  readonly x1: number
  readonly z0: number
  readonly z1: number
}

interface Cell {
  readonly x: number
  readonly y: number
}

interface Lane {
  readonly passes: GatesPassed
  readonly seed: number
  readonly x: number
  readonly z: number
}

interface Strand {
  readonly end: Point
  readonly isKept: boolean
  readonly line: string
}

const ISO_ANGLE_DIVISOR = 6
const ISO_COS = Math.cos(Math.PI / ISO_ANGLE_DIVISOR)
const ISO_DEPTH = 0.5
const ROUNDING = 10
const DECIMALS = 1
const ELLIPSE_SQUASH = 0.5
const SWEEP = { clockwise: 1, counterClockwise: 0 } as const

type Sweep = (typeof SWEEP)[keyof typeof SWEEP]

const NEXT = 1
const FIRST_DEPTH = 1
const FULL = 1

const NOISE = { frequency: 12.9898, scale: 43_758.5453 } as const

const SYSTEMS_LEVEL = { edge: 3, ground: 0, rails: 1, services: 2 } as const

const AI_GATES = { first: 86, second: 8, third: -70 } as const
const AI_GATE_PLANES = [AI_GATES.first, AI_GATES.second, AI_GATES.third] as const
const GATES_PASSED = { all: 3, none: 0, one: 1, two: 2 } as const

type GatesPassed = (typeof GATES_PASSED)[keyof typeof GATES_PASSED]

const AI_KEPT_LANES = { first: 5, second: 10 } as const
const AI_LANES = {
  columns: 4,
  count: 16,
  jitterX: 6,
  jitterZ: 5,
  oneGateEvery: 3,
  rowSeed: 40,
  seedOffset: 1,
  spacingX: 25,
  spacingZ: 19,
  startX: 4,
  startZ: 6,
  twoGatesEvery: 5,
} as const
const AI_STRAND = {
  comb: 60,
  end: -165,
  rise: 11,
  riseFrequency: 0.07,
  riseSeed: 2.3,
  start: 165,
  step: 11,
  wander: 13,
  wanderFrequency: 0.055,
  wanderSeed: 1.7,
} as const

const FLOW_UNIT = 34
const FLOW_GRID_EDGE = 7
const CROSS = { halfHeight: 3, halfWidth: 5 } as const
const FLAG = { drop: 7, height: 14, reach: 22 } as const

const noise = (seed: number): number => {
  const raw = Math.sin(seed * NOISE.frequency) * NOISE.scale

  return raw - Math.floor(raw)
}

const projector =
  ({ scale = 1, x: originX, y: originY }: Origin): Project =>
  (spot) => {
    const height = spot.z

    return [
      Math.round((originX + (spot.x - spot.y) * ISO_COS * scale) * ROUNDING) / ROUNDING,
      Math.round((originY + (spot.x + spot.y) * ISO_DEPTH * scale - height * scale) * ROUNDING) / ROUNDING,
    ]
  }

const formatPoint = ([px, py]: Point): string => `${px.toFixed(DECIMALS)} ${py.toFixed(DECIMALS)}`

const path = (points: readonly Point[], isClosed = false): string =>
  `M${points.map((point) => formatPoint(point)).join("L")}${isClosed ? "Z" : ""}`

const segment = (at: Project, from: Spot, to: Spot): string => path([at(from), at(to)])

const floor = (at: Project, { elevation, x0, x1, y0, y1 }: Area): string =>
  path(
    [
      at({ x: x0, y: y0, z: elevation }),
      at({ x: x1, y: y0, z: elevation }),
      at({ x: x1, y: y1, z: elevation }),
      at({ x: x0, y: y1, z: elevation }),
    ],
    true,
  )

const panel = (at: Project, { plane, x0, x1, z0, z1 }: Panel): string =>
  path(
    [at({ x: x0, y: plane, z: z0 }), at({ x: x1, y: plane, z: z0 }), at({ x: x1, y: plane, z: z1 }), at({ x: x0, y: plane, z: z1 })],
    true,
  )

const block = (at: Project, box: Box): string[] => {
  const right = box.x + box.width
  const front = box.y + box.depth
  const top = box.z + box.height

  return [
    floor(at, { elevation: top, x0: box.x, x1: right, y0: box.y, y1: front }),
    path([
      at({ x: right, y: box.y, z: top }),
      at({ x: right, y: box.y, z: box.z }),
      at({ x: right, y: front, z: box.z }),
      at({ x: box.x, y: front, z: box.z }),
      at({ x: box.x, y: front, z: top }),
    ]),
    path([at({ x: right, y: front, z: top }), at({ x: right, y: front, z: box.z })]),
  ]
}

const ellipseArc = ({ cx, cy, rx, ry, sweep }: Arc): string =>
  `M${(cx - rx).toFixed(DECIMALS)} ${cy.toFixed(DECIMALS)}A${String(rx)} ${String(ry)} 0 0 ${String(sweep)} ${(cx + rx).toFixed(DECIMALS)} ${cy.toFixed(DECIMALS)}`

const cylinder = (at: Project, drum: Drum): string[] => {
  const [cx, cy] = at(drum)
  const top = cy - drum.height
  const ry = drum.radius * ELLIPSE_SQUASH

  return [
    ellipseArc({ cx, cy: top, rx: drum.radius, ry, sweep: SWEEP.clockwise }),
    ellipseArc({ cx, cy: top, rx: drum.radius, ry, sweep: SWEEP.counterClockwise }),
    `M${(cx - drum.radius).toFixed(DECIMALS)} ${top.toFixed(DECIMALS)}V${cy.toFixed(DECIMALS)}`,
    `M${(cx + drum.radius).toFixed(DECIMALS)} ${top.toFixed(DECIMALS)}V${cy.toFixed(DECIMALS)}`,
    ellipseArc({ cx, cy, rx: drum.radius, ry, sweep: SWEEP.counterClockwise }),
  ]
}

const stackDrawing = (): Layer[] => {
  const at = projector({ x: 260, y: 158 })
  const size = 140
  const step = 52

  const plate = (level: number): string => floor(at, { elevation: level * step, x0: 0, x1: size, y0: 0, y1: size })
  const sides = (level: number): string[] =>
    [
      { x: 0, y: size },
      { x: size, y: 0 },
    ].map((corner) => path([at({ ...corner, z: level * step }), at({ ...corner, z: (level + NEXT) * step })]))
  const request = (level: number): string =>
    segment(at, { x: size, y: size, z: level * step }, { x: size, y: size, z: (level + NEXT) * step })
  const landing = (level: number): Point => at({ x: size, y: size, z: level * step })

  const stores = [
    { x: 30, y: 116 },
    { x: 116, y: 30 },
    { x: 98, y: 98 },
  ].flatMap((spot) => cylinder(at, { ...spot, height: 17, radius: 13, z: 0 }))
  const rails = [{ row: 28 }, { row: 70 }, { row: 112 }].map(({ row }) =>
    segment(at, { x: 10, y: row, z: step * SYSTEMS_LEVEL.rails }, { x: 130, y: row, z: step * SYSTEMS_LEVEL.rails }),
  )
  const services = [
    { x: 16, y: 20 },
    { x: 58, y: 20 },
    { x: 100, y: 20 },
    { x: 16, y: 86 },
    { x: 58, y: 86 },
    { x: 100, y: 86 },
  ].flatMap((spot) => block(at, { ...spot, depth: 34, height: 13, width: 24, z: step * SYSTEMS_LEVEL.services }))
  const edge = block(at, { depth: 32, height: 9, width: 84, x: 28, y: 54, z: step * SYSTEMS_LEVEL.edge })

  return [
    { lines: stores, plates: [plate(SYSTEMS_LEVEL.ground)] },
    { accent: [request(SYSTEMS_LEVEL.ground)], dashed: sides(SYSTEMS_LEVEL.ground), dots: [landing(SYSTEMS_LEVEL.ground)] },
    { dots: [landing(SYSTEMS_LEVEL.rails)], lines: rails, plates: [plate(SYSTEMS_LEVEL.rails)] },
    { accent: [request(SYSTEMS_LEVEL.rails)], dashed: sides(SYSTEMS_LEVEL.rails) },
    { dots: [landing(SYSTEMS_LEVEL.services)], lines: services, plates: [plate(SYSTEMS_LEVEL.services)] },
    { accent: [request(SYSTEMS_LEVEL.services)], dashed: sides(SYSTEMS_LEVEL.services) },
    { dots: [landing(SYSTEMS_LEVEL.edge)], lines: edge, plates: [plate(SYSTEMS_LEVEL.edge)] },
  ]
}

const gatesPassedBy = (index: number): GatesPassed => {
  if (index === AI_KEPT_LANES.first || index === AI_KEPT_LANES.second) {
    return GATES_PASSED.all
  }

  if (index % AI_LANES.twoGatesEvery === 0) {
    return GATES_PASSED.two
  }

  if (index % AI_LANES.oneGateEvery === 0) {
    return GATES_PASSED.one
  }

  return GATES_PASSED.none
}

const laneAt = (index: number): Lane => ({
  passes: gatesPassedBy(index),
  seed: index + AI_LANES.seedOffset,
  x: AI_LANES.startX + (index % AI_LANES.columns) * AI_LANES.spacingX + noise(index) * AI_LANES.jitterX,
  z: AI_LANES.startZ + Math.floor(index / AI_LANES.columns) * AI_LANES.spacingZ + noise(index + AI_LANES.rowSeed) * AI_LANES.jitterZ,
})

const strandPoint = (at: Project, lane: Lane, along: number): Point => {
  const loose = Math.max(0, Math.min(FULL, (along - AI_GATES.first) / AI_STRAND.comb))
  const wander = Math.sin(along * AI_STRAND.wanderFrequency + lane.seed * AI_STRAND.wanderSeed) * AI_STRAND.wander * loose
  const rise = Math.cos(along * AI_STRAND.riseFrequency + lane.seed * AI_STRAND.riseSeed) * AI_STRAND.rise * loose

  return at({ x: lane.x + wander, y: along, z: lane.z + rise })
}

const traceLane = (at: Project, lane: Lane): Strand => {
  const stop = lane.passes === GATES_PASSED.all ? AI_STRAND.end : AI_GATE_PLANES[lane.passes]
  let end = strandPoint(at, lane, AI_STRAND.start)
  const points: Point[] = [end]

  for (let along = AI_STRAND.start - AI_STRAND.step; along >= stop; along -= AI_STRAND.step) {
    end = strandPoint(at, lane, along)
    points.push(end)
  }

  return { end, isKept: lane.passes === GATES_PASSED.all, line: path(points) }
}

const gateFrame = (at: Project, plane: number): string =>
  path(
    [at({ x: -8, y: plane, z: -6 }), at({ x: 100, y: plane, z: -6 }), at({ x: 100, y: plane, z: 88 }), at({ x: -8, y: plane, z: 88 })],
    true,
  )

const aiDrawing = (): Layer[] => {
  const at = projector({ x: 232, y: 172 })
  const strands = Array.from({ length: AI_LANES.count }, (_, index) => traceLane(at, laneAt(index)))
  const stopped = strands.filter((strand) => !strand.isKept)
  const frames = AI_GATE_PLANES.map((plane) => gateFrame(at, plane))

  return [
    { dots: stopped.map((strand) => strand.end), lines: stopped.map((strand) => strand.line) },
    { faint: frames },
    { accent: strands.filter((strand) => strand.isKept).map((strand) => strand.line) },
    { lines: frames },
  ]
}

const interfaceDrawing = (): Layer[] => {
  const at = projector({ scale: 1.06, x: 180, y: 166 })

  const browser: Layer = {
    accent: [panel(at, { plane: 0, x0: 20, x1: 62, z0: 80, z1: 89 })],
    dots: [at({ x: 9, y: 0, z: 142 }), at({ x: 17, y: 0, z: 142 }), at({ x: 25, y: 0, z: 142 })],
    faint: [segment(at, { x: 20, y: 0, z: 106 }, { x: 104, y: 0, z: 106 }), segment(at, { x: 20, y: 0, z: 96 }, { x: 88, y: 0, z: 96 })],
    lines: [
      segment(at, { x: 0, y: 0, z: 134 }, { x: 232, y: 0, z: 134 }),
      panel(at, { plane: 0, x0: 12, x1: 118, z0: 74, z1: 122 }),
      panel(at, { plane: 0, x0: 128, x1: 220, z0: 74, z1: 122 }),
      segment(at, { x: 128, y: 0, z: 74 }, { x: 220, y: 0, z: 122 }),
      segment(at, { x: 128, y: 0, z: 122 }, { x: 220, y: 0, z: 74 }),
      panel(at, { plane: 0, x0: 12, x1: 74, z0: 14, z1: 62 }),
      panel(at, { plane: 0, x0: 85, x1: 147, z0: 14, z1: 62 }),
      panel(at, { plane: 0, x0: 158, x1: 220, z0: 14, z1: 62 }),
    ],
    plates: [panel(at, { plane: 0, x0: 0, x1: 232, z0: 0, z1: 150 })],
  }
  const phone: Layer = {
    accent: [panel(at, { plane: 70, x0: 24, x1: 44, z0: 62, z1: 68 })],
    lines: [
      segment(at, { x: 12, y: 70, z: 95 }, { x: 66, y: 70, z: 95 }),
      panel(at, { plane: 70, x0: 19, x1: 59, z0: 58, z1: 88 }),
      panel(at, { plane: 70, x0: 19, x1: 59, z0: 30, z1: 52 }),
      panel(at, { plane: 70, x0: 19, x1: 59, z0: 6, z1: 24 }),
    ],
    plates: [panel(at, { plane: 70, x0: 12, x1: 66, z0: -2, z1: 106 })],
  }
  const projection: Layer = {
    dashed: [
      segment(at, { x: 12, y: 0, z: 122 }, { x: 19, y: 70, z: 88 }),
      segment(at, { x: 118, y: 0, z: 122 }, { x: 59, y: 70, z: 88 }),
      segment(at, { x: 12, y: 0, z: 74 }, { x: 19, y: 70, z: 58 }),
    ],
  }

  return [browser, projection, phone]
}

const cross = ([cx, cy]: Point): string[] => [
  path([
    [cx - CROSS.halfWidth, cy - CROSS.halfHeight],
    [cx + CROSS.halfWidth, cy + CROSS.halfHeight],
  ]),
  path([
    [cx + CROSS.halfWidth, cy - CROSS.halfHeight],
    [cx - CROSS.halfWidth, cy + CROSS.halfHeight],
  ]),
]

const flag = ([goalX, goalY]: Point): string =>
  path([
    [goalX, goalY],
    [goalX + FLAG.reach, goalY + FLAG.drop],
    [goalX, goalY + FLAG.height],
  ])

const flowDrawing = (): Layer[] => {
  const at = projector({ x: 250, y: 48 })
  const grid = (cell: Cell, height = 0): Point => at({ x: cell.x * FLOW_UNIT, y: cell.y * FLOW_UNIT, z: height })

  const gridLines = Array.from({ length: FLOW_GRID_EDGE + NEXT }, (_, index) => [
    path([grid({ x: index, y: 0 }), grid({ x: index, y: FLOW_GRID_EDGE })]),
    path([grid({ x: 0, y: index }), grid({ x: FLOW_GRID_EDGE, y: index })]),
  ]).flat()
  const route = [
    { x: 0, y: 5 },
    { x: 2, y: 5 },
    { x: 2, y: 3 },
    { x: 5, y: 3 },
    { x: 5, y: 1 },
    { x: 7, y: 1 },
  ].map((cell) => grid(cell))
  const ruledOut = [
    { from: { x: 2, y: 5 }, to: { x: 5, y: 5 } },
    { from: { x: 2, y: 3 }, to: { x: 2, y: 1 } },
    { from: { x: 5, y: 3 }, to: { x: 7, y: 3 } },
    { from: { x: 4, y: 3 }, to: { x: 4, y: 6 } },
  ]
  const decisions = [
    { cell: { x: 2, y: 5 }, height: 26 },
    { cell: { x: 2, y: 3 }, height: 42 },
    { cell: { x: 5, y: 3 }, height: 60 },
    { cell: { x: 5, y: 1 }, height: 78 },
  ]
  const goal = { cell: { x: 7, y: 1 }, height: 104 }
  const posts = [...decisions, goal]

  return [
    { faint: gridLines },
    { dashed: ruledOut.map(({ from, to }) => path([grid(from), grid(to)])) },
    { lines: ruledOut.flatMap(({ to }) => cross(grid(to))) },
    { accent: [path(route)], lines: posts.map(({ cell, height }) => path([grid(cell), grid(cell, height)])) },
    { faint: [path(posts.map(({ cell, height }) => grid(cell, height)))] },
    { accent: [flag(grid(goal.cell, goal.height))], dots: decisions.map(({ cell, height }) => grid(cell, height)) },
  ]
}

const numbered = (layers: readonly Layer[]): DrawingLayer[] =>
  layers.map((layer, position) => ({ ...layer, depth: position + FIRST_DEPTH }))

export const DRAWINGS: Readonly<Record<Discipline, readonly DrawingLayer[]>> = {
  ai: numbered(aiDrawing()),
  interfaces: numbered(interfaceDrawing()),
  payments: numbered(flowDrawing()),
  products: numbered(stackDrawing()),
}
