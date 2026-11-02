"use client"

import { type JSX, type Ref, useImperativeHandle, useLayoutEffect, useRef, useState } from "react"

import { useTranslations } from "next-intl"

export interface DiagramState {
  /** 0 to 1: the as-is system draws itself onto the board. */
  draw: number
  /** 0 is the as-is tangle, 1 is every domain in its place with the data it owns. */
  order: number
  /** 0 to 1: the event bus and the platform underneath arrive, and the last finding closes. */
  bus: number
}

export const RESOLVED_DIAGRAM: DiagramState = { draw: 1, order: 1, bus: 1 }

export interface SystemDiagramHandle {
  update: (state: DiagramState) => void
}

type NodeId =
  | "web"
  | "mobile"
  | "partners"
  | "cdn"
  | "gateway"
  | "identity"
  | "orders"
  | "payments"
  | "catalog"
  | "ai"
  | "dbIdentity"
  | "dbOrders"
  | "dbPayments"
  | "dbCatalog"
  | "dbVectors"
  | "notifications"
  | "analytics"
  | "psp"
  | "search"
  | "llm"
  | "shared"
  | "legacy"
  | "cron"
  | "csv"

type Kind = "box" | "store" | "external" | "hotspot" | "scrap"
type Point = readonly [number, number]

interface NodeSpec {
  /** Order at which it arrives: it has no place in the as-is system. */
  born?: number
  /** Order at which it goes: nothing stays that hasn't earned its place. */
  dies?: number
  kind: Kind
  sub?: boolean
}

const NODES: Record<NodeId, NodeSpec> = {
  web: { kind: "box", sub: true },
  mobile: { kind: "box", sub: true },
  partners: { kind: "box", sub: true },
  cdn: { kind: "box", sub: true },
  gateway: { kind: "box", sub: true, born: 0.4 },
  identity: { kind: "box", sub: true },
  orders: { kind: "box", sub: true },
  payments: { kind: "box", sub: true },
  catalog: { kind: "box", sub: true },
  ai: { kind: "box", sub: true, born: 0.52 },
  dbIdentity: { kind: "store", born: 0.03 },
  dbOrders: { kind: "store", born: 0.03 },
  dbPayments: { kind: "store", born: 0.03 },
  dbCatalog: { kind: "store", born: 0.03 },
  dbVectors: { kind: "store", born: 0.56 },
  notifications: { kind: "box", sub: true },
  analytics: { kind: "box", sub: true },
  psp: { kind: "external", sub: true },
  search: { kind: "box", sub: true },
  llm: { kind: "external", sub: true },
  shared: { kind: "hotspot", dies: 0.03 },
  legacy: { kind: "scrap", dies: 0.2 },
  cron: { kind: "scrap", dies: 0.3 },
  csv: { kind: "scrap", dies: 0.25 },
}

const NODE_IDS = Object.keys(NODES) as NodeId[]

/** The accidental coupling, in red: exists only in the as-is system. */
const TANGLE_EDGES: Array<[NodeId, NodeId]> = [
  ["notifications", "shared"],
  ["analytics", "shared"],
  ["search", "shared"],
  ["legacy", "shared"],
  ["cron", "shared"],
  ["csv", "shared"],
  ["orders", "payments"],
  ["payments", "orders"],
  ["catalog", "orders"],
  ["identity", "catalog"],
  ["mobile", "identity"],
  ["web", "orders"],
  ["partners", "catalog"],
  ["web", "catalog"],
  ["orders", "llm"],
  ["catalog", "llm"],
  ["identity", "llm"],
  ["cron", "orders"],
  ["legacy", "payments"],
  ["csv", "analytics"],
  ["notifications", "orders"],
  ["search", "catalog"],
]

const FINDING_KEYS = ["shared", "boundary", "cycle", "llm", "owner", "cron", "trace"] as const
type FindingKey = (typeof FINDING_KEYS)[number]

/** Order at which each finding closes. The last one needs the platform, so it closes with the bus. */
const FINDING_CLOSES: Record<FindingKey, number> = {
  shared: 0.1,
  boundary: 0.42,
  cycle: 0.24,
  llm: 0.54,
  owner: 0.34,
  cron: 0.3,
  trace: 2,
}

interface CoreEdge {
  /** Order at which it draws in. Without one it already exists in the tangle and straightens out as the nodes settle. */
  born?: number
  from: NodeId
  route: Point[]
  to: NodeId
}

interface Layout {
  core: CoreEdge[]
  dividers: number[]
  findings: Partial<Record<FindingKey, Point>>
  flows: Array<{ duration: number; points: Point[]; tone: "ink" | "emerald" }>
  font: { finding: number; label: number; sub: number; title: number }
  height: number
  legend?: Point
  node: { height: number; storeHeight: number; width: number }
  nodes: Record<NodeId, { at: Point; tangle: readonly [number, number, number]; width?: number }>
  platform: { height: number; subs: boolean; x: number; y: number; width: number }
  rail: { label: Point; sub?: Point; x1: number; x2: number; y: number }
  rows: Array<{ key: string; y: number }>
  status: { gap: number; y: number }
  stubs: Array<readonly [number, number, number, number]>
  width: number
  zones: Array<readonly [number, number, number, number]>
}

const WIDE_COLS = [179.2, 361.6, 544, 726.4, 908.8] as const

const WIDE: Layout = (() => {
  const [c1, c2, c3, c4, c5] = WIDE_COLS
  const halfZone = 85
  const fanOut = (x: number): Point[] =>
    x === c3
      ? [
          [c3, 212],
          [c3, 256],
        ]
      : [
          [c3, 212],
          [c3, 232],
          [x, 232],
          [x, 256],
        ]
  return {
    width: 1000,
    height: 640,
    node: { width: 150, height: 44, storeHeight: 50 },
    font: { title: 15, sub: 11, label: 12.5, finding: 13 },
    status: { y: 8, gap: 112 },
    legend: [94, 624],
    rows: [
      { key: "clients", y: 46 },
      { key: "edge", y: 158 },
      { key: "domains", y: 320 },
      { key: "events", y: 434 },
      { key: "downstream", y: 494 },
      { key: "platform", y: 568 },
    ],
    dividers: [96, 224, 408, 462, 532],
    zones: WIDE_COLS.map((x) => [x - halfZone, 244, halfZone * 2, 152] as const),
    rail: { x1: 94, x2: 994, y: 434, label: [270, 420], sub: [452.8, 420] },
    stubs: [...WIDE_COLS.map((x) => [x, 396, x, 434] as const), [c1, 434, c1, 472], [c2, 434, c2, 472], [c4, 434, c4, 472]],
    platform: { x: 94, y: 546, width: 900, height: 44, subs: true },
    nodes: {
      web: { at: [c2, 46], tangle: [742, 44, 2] },
      mobile: { at: [c3, 46], tangle: [918, 118, -2] },
      partners: { at: [c4, 46], tangle: [134, 54, -2] },
      cdn: { at: [c3, 126], tangle: [352, 40, 1.5], width: 240 },
      gateway: { at: [c3, 190], tangle: [c3, 190, 0], width: 240 },
      identity: { at: [c1, 278], tangle: [728, 196, 1.5] },
      orders: { at: [c2, 278], tangle: [760, 372, -2] },
      payments: { at: [c3, 278], tangle: [156, 500, 2] },
      catalog: { at: [c4, 278], tangle: [336, 208, -1.5] },
      ai: { at: [c5, 278], tangle: [c5, 278, 0] },
      dbIdentity: { at: [c1, 354], tangle: [520, 318, 0] },
      dbOrders: { at: [c2, 354], tangle: [520, 318, 0] },
      dbPayments: { at: [c3, 354], tangle: [520, 318, 0] },
      dbCatalog: { at: [c4, 354], tangle: [520, 318, 0] },
      dbVectors: { at: [c5, 354], tangle: [c5, 354, 0] },
      notifications: { at: [c1, 494], tangle: [392, 560, -1.5] },
      analytics: { at: [c2, 494], tangle: [918, 408, 1.5] },
      psp: { at: [c3, 494], tangle: [656, 530, 1.5] },
      search: { at: [c4, 494], tangle: [118, 408, 2] },
      llm: { at: [c5, 494], tangle: [116, 292, -1.5] },
      shared: { at: [520, 318], tangle: [520, 318, 0], width: 190 },
      legacy: { at: [100, 178], tangle: [100, 178, 2] },
      cron: { at: [556, 112], tangle: [556, 112, -1.5] },
      csv: { at: [924, 256], tangle: [924, 256, -2] },
    },
    core: [
      {
        from: "web",
        to: "cdn",
        route: [
          [c2, 68],
          [c2, 88],
          [c3, 88],
          [c3, 104],
        ],
      },
      {
        from: "mobile",
        to: "cdn",
        route: [
          [c3, 68],
          [c3, 104],
        ],
      },
      {
        from: "partners",
        to: "cdn",
        route: [
          [c4, 68],
          [c4, 88],
          [c3, 88],
          [c3, 104],
        ],
      },
      {
        from: "cdn",
        to: "gateway",
        born: 0.42,
        route: [
          [c3, 148],
          [c3, 168],
        ],
      },
      { from: "gateway", to: "identity", born: 0.46, route: fanOut(c1) },
      { from: "gateway", to: "orders", born: 0.49, route: fanOut(c2) },
      { from: "gateway", to: "payments", born: 0.46, route: fanOut(c3) },
      { from: "gateway", to: "catalog", born: 0.49, route: fanOut(c4) },
      { from: "gateway", to: "ai", born: 0.54, route: fanOut(c5) },
      {
        from: "identity",
        to: "dbIdentity",
        route: [
          [c1, 300],
          [c1, 329],
        ],
      },
      {
        from: "orders",
        to: "dbOrders",
        route: [
          [c2, 300],
          [c2, 329],
        ],
      },
      {
        from: "payments",
        to: "dbPayments",
        route: [
          [c3, 300],
          [c3, 329],
        ],
      },
      {
        from: "catalog",
        to: "dbCatalog",
        route: [
          [c4, 300],
          [c4, 329],
        ],
      },
      {
        from: "ai",
        to: "dbVectors",
        born: 0.6,
        route: [
          [c5, 300],
          [c5, 329],
        ],
      },
      {
        from: "payments",
        to: "psp",
        route: [
          [c3 + 75, 278],
          [c3 + halfZone + 6.2, 278],
          [c3 + halfZone + 6.2, 456],
          [c3, 456],
          [c3, 472],
        ],
      },
      {
        from: "ai",
        to: "llm",
        born: 0.62,
        route: [
          [c5 + 75, 278],
          [c5 + halfZone + 6.2, 278],
          [c5 + halfZone + 6.2, 456],
          [c5, 456],
          [c5, 472],
        ],
      },
    ],
    findings: {
      shared: [520, 366],
      boundary: [636, 128],
      cycle: [448, 462],
      llm: [62, 240],
      owner: [800, 310],
      cron: [468, 158],
      trace: [744, 584],
    },
    flows: [
      {
        tone: "ink",
        duration: 6.4,
        points: [
          [c2, 68],
          [c2, 88],
          [c3, 88],
          [c3, 232],
          [c2, 232],
          [c2, 329],
        ],
      },
      {
        tone: "ink",
        duration: 7.6,
        points: [
          [c3, 68],
          [c3, 278],
          [c3 + halfZone + 6.2, 278],
          [c3 + halfZone + 6.2, 456],
          [c3, 456],
          [c3, 472],
        ],
      },
      {
        tone: "ink",
        duration: 8.8,
        points: [
          [c4, 68],
          [c4, 88],
          [c3, 88],
          [c3, 232],
          [c5, 232],
          [c5, 278],
          [c5 + halfZone + 6.2, 278],
          [c5 + halfZone + 6.2, 456],
          [c5, 456],
          [c5, 472],
        ],
      },
      {
        tone: "emerald",
        duration: 5.2,
        points: [
          [c2, 396],
          [c2, 434],
          [c1, 434],
          [c1, 472],
        ],
      },
      {
        tone: "emerald",
        duration: 4.4,
        points: [
          [c4, 396],
          [c4, 472],
        ],
      },
      {
        tone: "emerald",
        duration: 6,
        points: [
          [c3, 396],
          [c3, 434],
          [c2, 434],
          [c2, 472],
        ],
      },
    ],
  }
})()

const TALL: Layout = {
  width: 440,
  height: 566,
  node: { width: 128, height: 34, storeHeight: 34 },
  font: { title: 13, sub: 0, label: 11.5, finding: 11.5 },
  status: { y: 8, gap: 104 },
  rows: [],
  dividers: [],
  zones: [
    [8, 188, 136, 86],
    [152, 188, 136, 86],
    [296, 188, 136, 86],
    [80, 298, 136, 86],
    [224, 298, 136, 86],
  ],
  rail: { x1: 8, x2: 432, y: 406, label: [120, 397] },
  stubs: [
    [76, 274, 76, 406],
    [220, 274, 220, 406],
    [364, 274, 364, 406],
    [148, 384, 148, 406],
    [268, 384, 268, 406],
    [76, 406, 76, 431],
    [220, 406, 220, 431],
    [364, 406, 364, 431],
  ],
  platform: { x: 8, y: 524, width: 424, height: 34, subs: false },
  nodes: {
    web: { at: [76, 42], tangle: [364, 42, 2] },
    mobile: { at: [220, 42], tangle: [338, 124, -2] },
    partners: { at: [364, 42], tangle: [74, 46, -2] },
    cdn: { at: [220, 96], tangle: [226, 70, 1.5], width: 200 },
    gateway: { at: [220, 144], tangle: [220, 144, 0], width: 200 },
    identity: { at: [76, 206], tangle: [364, 204, 1.5] },
    orders: { at: [220, 206], tangle: [346, 392, -2] },
    payments: { at: [364, 206], tangle: [92, 412, 2] },
    catalog: { at: [148, 316], tangle: [208, 182, -1.5] },
    ai: { at: [292, 316], tangle: [292, 316, 0] },
    dbIdentity: { at: [76, 252], tangle: [220, 296, 0] },
    dbOrders: { at: [220, 252], tangle: [220, 296, 0] },
    dbPayments: { at: [364, 252], tangle: [220, 296, 0] },
    dbCatalog: { at: [148, 362], tangle: [220, 296, 0] },
    dbVectors: { at: [292, 362], tangle: [292, 362, 0] },
    notifications: { at: [76, 448], tangle: [92, 498, -1.5] },
    analytics: { at: [220, 448], tangle: [368, 306, 1.5] },
    psp: { at: [364, 496], tangle: [342, 486, 1.5] },
    search: { at: [364, 448], tangle: [76, 322, 2] },
    llm: { at: [148, 496], tangle: [70, 232, -1.5] },
    shared: { at: [220, 296], tangle: [220, 296, 0], width: 150 },
    legacy: { at: [80, 138], tangle: [80, 138, 2] },
    cron: { at: [224, 122], tangle: [224, 122, -1.5] },
    csv: { at: [226, 400], tangle: [226, 400, -2] },
  },
  core: [
    {
      from: "web",
      to: "cdn",
      route: [
        [76, 59],
        [76, 70],
        [220, 70],
        [220, 79],
      ],
    },
    {
      from: "mobile",
      to: "cdn",
      route: [
        [220, 59],
        [220, 79],
      ],
    },
    {
      from: "partners",
      to: "cdn",
      route: [
        [364, 59],
        [364, 70],
        [220, 70],
        [220, 79],
      ],
    },
    {
      from: "cdn",
      to: "gateway",
      born: 0.42,
      route: [
        [220, 113],
        [220, 127],
      ],
    },
    {
      from: "gateway",
      to: "identity",
      born: 0.46,
      route: [
        [220, 161],
        [220, 172],
        [76, 172],
        [76, 189],
      ],
    },
    {
      from: "gateway",
      to: "orders",
      born: 0.46,
      route: [
        [220, 161],
        [220, 189],
      ],
    },
    {
      from: "gateway",
      to: "payments",
      born: 0.46,
      route: [
        [220, 161],
        [220, 172],
        [364, 172],
        [364, 189],
      ],
    },
    {
      from: "gateway",
      to: "catalog",
      born: 0.49,
      route: [
        [220, 161],
        [220, 172],
        [148, 172],
        [148, 299],
      ],
    },
    {
      from: "gateway",
      to: "ai",
      born: 0.54,
      route: [
        [220, 161],
        [220, 172],
        [292, 172],
        [292, 299],
      ],
    },
    {
      from: "identity",
      to: "dbIdentity",
      route: [
        [76, 223],
        [76, 235],
      ],
    },
    {
      from: "orders",
      to: "dbOrders",
      route: [
        [220, 223],
        [220, 235],
      ],
    },
    {
      from: "payments",
      to: "dbPayments",
      route: [
        [364, 223],
        [364, 235],
      ],
    },
    {
      from: "catalog",
      to: "dbCatalog",
      route: [
        [148, 333],
        [148, 345],
      ],
    },
    {
      from: "ai",
      to: "dbVectors",
      born: 0.6,
      route: [
        [292, 333],
        [292, 345],
      ],
    },
    {
      from: "payments",
      to: "psp",
      route: [
        [428, 206],
        [437, 206],
        [437, 496],
        [428, 496],
      ],
    },
    {
      from: "ai",
      to: "llm",
      born: 0.62,
      route: [
        [292, 384],
        [292, 472],
        [148, 472],
        [148, 479],
      ],
    },
  ],
  findings: {
    shared: [220, 332],
    cycle: [216, 456],
    llm: [8, 268],
  },
  flows: [
    {
      tone: "ink",
      duration: 6,
      points: [
        [220, 59],
        [220, 172],
        [76, 172],
        [76, 235],
      ],
    },
    {
      tone: "ink",
      duration: 7.2,
      points: [
        [364, 59],
        [364, 70],
        [220, 70],
        [220, 172],
        [292, 172],
        [292, 384],
        [292, 472],
        [148, 472],
        [148, 479],
      ],
    },
    {
      tone: "emerald",
      duration: 4.8,
      points: [
        [220, 274],
        [220, 406],
        [76, 406],
        [76, 431],
      ],
    },
    {
      tone: "emerald",
      duration: 4.2,
      points: [
        [148, 384],
        [148, 406],
        [364, 406],
        [364, 431],
      ],
    },
  ],
}

const LAYOUTS: Record<"wide" | "tall", Layout> = { wide: WIDE, tall: TALL }

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount
const fixed = (value: number) => value.toFixed(1)

/** Deterministic wobble so server and client agree on every path. */
const wobble = (seed: number) => {
  const raw = Math.sin(seed * 12.9898) * 43758.5453
  return (raw - Math.floor(raw)) * 2 - 1
}

const CORNER = 8
const KAPPA = 0.5523

/** An orthogonal route with rounded corners, as a flat run of cubics: x y, then c1x c1y c2x c2y x y for each segment. */
function routeCubics(points: readonly Point[]): number[] {
  const flat: number[] = [points[0][0], points[0][1]]
  const straightTo = (x: number, y: number) => {
    const startX = flat[flat.length - 2]
    const startY = flat[flat.length - 1]
    flat.push(mix(startX, x, 1 / 3), mix(startY, y, 1 / 3), mix(startX, x, 2 / 3), mix(startY, y, 2 / 3), x, y)
  }
  for (let index = 1; index < points.length - 1; index += 1) {
    const [px, py] = points[index - 1]
    const [cx, cy] = points[index]
    const [nx, ny] = points[index + 1]
    const inLength = Math.hypot(cx - px, cy - py)
    const outLength = Math.hypot(nx - cx, ny - cy)
    const radius = Math.min(CORNER, inLength / 2, outLength / 2)
    const ix = (cx - px) / inLength
    const iy = (cy - py) / inLength
    const ox = (nx - cx) / outLength
    const oy = (ny - cy) / outLength
    straightTo(cx - ix * radius, cy - iy * radius)
    const arc = radius * (1 - KAPPA)
    flat.push(cx - ix * arc, cy - iy * arc, cx + ox * arc, cy + oy * arc, cx + ox * radius, cy + oy * radius)
  }
  const [lastX, lastY] = points[points.length - 1]
  straightTo(lastX, lastY)
  return flat
}

/** One cubic cut into equal parts, in the same flat form, so it can be blended point by point with a route. */
function splitCubic(p0: Point, c1: Point, c2: Point, p3: Point, parts: number): number[] {
  const at = (t: number): Point => {
    const u = 1 - t
    return [
      u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1],
    ]
  }
  const derivative = (t: number): Point => {
    const u = 1 - t
    return [
      3 * u * u * (c1[0] - p0[0]) + 6 * u * t * (c2[0] - c1[0]) + 3 * t * t * (p3[0] - c2[0]),
      3 * u * u * (c1[1] - p0[1]) + 6 * u * t * (c2[1] - c1[1]) + 3 * t * t * (p3[1] - c2[1]),
    ]
  }
  const flat: number[] = [p0[0], p0[1]]
  const step = 1 / parts
  for (let part = 0; part < parts; part += 1) {
    const t0 = part * step
    const t1 = t0 + step
    const start = at(t0)
    const end = at(t1)
    const d0 = derivative(t0)
    const d1 = derivative(t1)
    flat.push(
      start[0] + (d0[0] * step) / 3,
      start[1] + (d0[1] * step) / 3,
      end[0] - (d1[0] * step) / 3,
      end[1] - (d1[1] * step) / 3,
      end[0],
      end[1],
    )
  }
  return flat
}

function cubicsToPath(flat: ArrayLike<number>): string {
  let d = `M${fixed(flat[0])} ${fixed(flat[1])}`
  for (let index = 2; index < flat.length; index += 6) {
    d += `C${fixed(flat[index])} ${fixed(flat[index + 1])} ${fixed(flat[index + 2])} ${fixed(flat[index + 3])} ${fixed(flat[index + 4])} ${fixed(flat[index + 5])}`
  }
  return d
}

function looseCurve(from: Point, to: Point, swing: number, seed: number): [Point, Point, Point, Point] {
  const dy = to[1] - from[1]
  return [
    from,
    [from[0] + wobble(seed) * swing, from[1] + dy * 0.5 + wobble(seed + 1) * swing * 0.8],
    [to[0] + wobble(seed + 2) * swing, to[1] - dy * 0.5 + wobble(seed + 3) * swing * 0.8],
    to,
  ]
}

interface CoreGeometry {
  /** Tangled shape, null for edges that are simply drawn in once their nodes exist. */
  loose: number[] | null
  straight: number[]
  working: Float32Array
}

const buildGeometry = (layout: Layout): CoreGeometry[] =>
  layout.core.map((edge, index) => {
    const straight = routeCubics(edge.route)
    const parts = (straight.length - 2) / 6
    const from = layout.nodes[edge.from].tangle
    const to = layout.nodes[edge.to].tangle
    const [p0, c1, c2, p3] = looseCurve([from[0], from[1]], [to[0], to[1]], layout.width * 0.26, index * 7 + 1)
    return {
      straight,
      loose: edge.born === undefined ? splitCubic(p0, c1, c2, p3, parts) : null,
      working: new Float32Array(straight.length),
    }
  })

const GEOMETRY = { wide: buildGeometry(WIDE), tall: buildGeometry(TALL) }

function easeOfNode(id: NodeId, order: number): number {
  // A small stagger keeps the nodes from moving as one sheet.
  const index = NODE_IDS.indexOf(id)
  const local = clamp(order * 1.22 - (index / NODE_IDS.length) * 0.22)
  return local * local * (3 - 2 * local)
}

const EMERALD = "#0a6247"
const SIGNAL = "var(--signal)"
const CARD = "#fbf8f0"

interface PartsCache {
  count: Element | null
  core: Array<SVGPathElement | null>
  findings: Array<SVGGElement | null>
  flow: SVGGElement | null
  grid: SVGRectElement | null
  late: SVGGElement | null
  nodes: Array<SVGGElement | null>
  rail: Element | null
  statusFrom: SVGGElement | null
  statusTo: SVGGElement | null
  structure: SVGGElement | null
  tangle: Array<SVGPathElement | null>
}

function collectParts(svg: SVGSVGElement, core: number): PartsCache {
  return {
    count: svg.querySelector("[data-finding-count]"),
    core: Array.from({ length: core }, (_, index) => svg.querySelector<SVGPathElement>(`[data-core="${index}"]`)),
    findings: FINDING_KEYS.map((key) => svg.querySelector<SVGGElement>(`[data-finding="${key}"]`)),
    flow: svg.querySelector("[data-flow]"),
    grid: svg.querySelector("[data-grid]"),
    late: svg.querySelector("[data-late]"),
    nodes: NODE_IDS.map((id) => svg.querySelector<SVGGElement>(`[data-node="${id}"]`)),
    rail: svg.querySelector("[data-rail]"),
    statusFrom: svg.querySelector("[data-status='from']"),
    statusTo: svg.querySelector("[data-status='to']"),
    structure: svg.querySelector("[data-structure]"),
    tangle: TANGLE_EDGES.map((_, index) => svg.querySelector<SVGPathElement>(`[data-tangle="${index}"]`)),
  }
}

function NodeShape({ layout, id, sub, title }: Readonly<{ id: NodeId; layout: Layout; sub?: string; title: string }>): JSX.Element {
  const spec = NODES[id]
  const width = layout.nodes[id].width ?? layout.node.width
  const isCylinder = spec.kind === "store" || spec.kind === "hotspot"
  const height = isCylinder ? layout.node.storeHeight : layout.node.height
  const halfW = width / 2
  const halfH = height / 2
  const rim = Math.min(6, height * 0.14)
  const hasSub = Boolean(sub && layout.font.sub)
  const titleY = isCylinder ? rim / 2 : hasSub ? -layout.font.sub * 0.62 : 0

  return (
    <>
      {isCylinder ? (
        <>
          <path
            d={`M${-halfW} ${-halfH + rim}A${halfW} ${rim} 0 0 1 ${halfW} ${-halfH + rim}V${halfH - rim}A${halfW} ${rim} 0 0 1 ${-halfW} ${halfH - rim}Z`}
            fill={spec.kind === "hotspot" ? "#f9e9e0" : "#e7ead9"}
            stroke={spec.kind === "hotspot" ? SIGNAL : "currentColor"}
            strokeWidth={spec.kind === "hotspot" ? 1.7 : 1.1}
          />
          <path
            d={`M${-halfW} ${-halfH + rim}A${halfW} ${rim} 0 0 0 ${halfW} ${-halfH + rim}`}
            fill="none"
            stroke={spec.kind === "hotspot" ? SIGNAL : "currentColor"}
            strokeWidth={spec.kind === "hotspot" ? 1.7 : 1.1}
          />
        </>
      ) : (
        <>
          {spec.kind === "box" && (
            <rect x={-halfW + 2} y={-halfH + 3} width={width} height={height} rx={3} fill="currentColor" fillOpacity={0.1} />
          )}
          <rect
            x={-halfW}
            y={-halfH}
            width={width}
            height={height}
            rx={3}
            fill={spec.kind === "box" ? CARD : "var(--board)"}
            stroke="currentColor"
            strokeOpacity={spec.kind === "box" ? 1 : 0.62}
            strokeWidth={1.1}
            strokeDasharray={spec.kind === "box" ? undefined : "4 3"}
          />
        </>
      )}
      <text
        y={titleY}
        textAnchor="middle"
        dominantBaseline="central"
        fill={spec.kind === "hotspot" ? SIGNAL : "currentColor"}
        fillOpacity={spec.kind === "scrap" ? 0.7 : 1}
        fontSize={layout.font.title}
        fontWeight={600}
        letterSpacing="-0.012em"
      >
        {title}
      </text>
      {hasSub && (
        <text
          y={layout.font.sub * 0.92}
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          fillOpacity={0.62}
          fontSize={layout.font.sub}
        >
          {sub}
        </text>
      )}
    </>
  )
}

interface SystemDiagramProps {
  className?: string
  ref?: Ref<SystemDiagramHandle>
}

/**
 * The same system twice: as it usually ends up, with an architect's findings marked against it, and as it should be.
 * Direct calls give way to a gateway, the one shared database splits into stores each domain owns, cross-service calls
 * become events, and the findings count down to zero as the reader scrolls.
 */
export function SystemDiagram({ className, ref }: Readonly<SystemDiagramProps>): JSX.Element {
  const t = useTranslations("custom.philosophy")
  const svgRef = useRef<SVGSVGElement>(null)
  const stateRef = useRef<DiagramState>(RESOLVED_DIAGRAM)
  const appliedRef = useRef<DiagramState | null>(null)
  const partsRef = useRef<PartsCache | null>(null)
  const openFindingsRef = useRef(0)
  const visibleRef = useRef(false)
  const [layoutName, setLayoutName] = useState<"wide" | "tall">("wide")
  const layout = LAYOUTS[layoutName]
  const geometry = GEOMETRY[layoutName]

  const syncFlow = () => {
    const svg = svgRef.current
    const flow = partsRef.current?.flow
    if (!svg || !flow) return
    const reduced = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
    const running = !reduced && visibleRef.current && (appliedRef.current?.bus ?? 0) >= 0.98
    flow.style.opacity = running ? "1" : "0"
    if (running) svg.unpauseAnimations()
    else svg.pauseAnimations()
  }

  const apply = (state: DiagramState) => {
    stateRef.current = state
    const svg = svgRef.current
    if (!svg) return

    const last = appliedRef.current
    const drawChanged = !last || last.draw !== state.draw
    const orderChanged = !last || last.order !== state.order
    const busChanged = !last || last.bus !== state.bus
    if (!drawChanged && !orderChanged && !busChanged) return
    appliedRef.current = { ...state }

    if (!partsRef.current) {
      partsRef.current = collectParts(svg, layout.core.length)
      // The count sits just past the longer of the two status labels, whatever the language.
      const labels = svg.querySelectorAll<SVGTextElement>("[data-status] text")
      const longest = Math.max(...Array.from(labels, (label) => label.getComputedTextLength()))
      svg.querySelector("[data-status-count]")?.setAttribute("x", fixed(14 + longest + 16))
    }
    const parts = partsRef.current

    if (drawChanged || orderChanged) {
      NODE_IDS.forEach((id, index) => {
        const group = parts.nodes[index]
        if (!group) return
        const spec = NODES[id]
        const place = layout.nodes[id]
        const eased = easeOfNode(id, state.order)
        if (orderChanged) {
          group.setAttribute(
            "transform",
            `translate(${fixed(mix(place.tangle[0], place.at[0], eased))} ${fixed(mix(place.tangle[1], place.at[1], eased))}) rotate(${fixed(mix(place.tangle[2], 0, eased))})`,
          )
        }
        let opacity = clamp(state.draw * 4 - index * 0.14)
        if (spec.born !== undefined) opacity *= clamp((state.order - spec.born) / 0.08)
        if (spec.dies !== undefined) opacity *= 1 - clamp((state.order - spec.dies) / 0.08)
        group.style.opacity = String(opacity)
      })

      layout.core.forEach((edge, index) => {
        const path = parts.core[index]
        if (!path) return
        const shape = geometry[index]
        if (shape.loose) {
          if (orderChanged) {
            // Each end keeps to the pace of its own node, so a line never comes away from its box.
            const fromEase = easeOfNode(edge.from, state.order)
            const toEase = easeOfNode(edge.to, state.order)
            const length = shape.straight.length
            for (let point = 0; point < length; point += 1) {
              shape.working[point] = mix(shape.loose[point], shape.straight[point], mix(fromEase, toEase, point / (length - 1)))
            }
            path.setAttribute("d", cubicsToPath(shape.working))
          }
          path.setAttribute("stroke-dashoffset", fixed(1 - clamp(state.draw * 1.5 - (index / layout.core.length) * 0.5)))
          path.setAttribute("opacity", "1")
        } else {
          const drawn = clamp((state.order - (edge.born ?? 0)) / 0.14)
          path.setAttribute("stroke-dashoffset", drawn.toFixed(3) === "1.000" ? "0" : (1 - drawn).toFixed(3))
          path.setAttribute("opacity", drawn > 0 ? "1" : "0")
        }
      })

      const gone = clamp(state.order * 1.6)
      TANGLE_EDGES.forEach(([from, to], index) => {
        const path = parts.tangle[index]
        if (!path) return
        if (gone >= 1) {
          path.setAttribute("opacity", "0")
          return
        }
        const fromPlace = layout.nodes[from]
        const toPlace = layout.nodes[to]
        const fromEase = easeOfNode(from, state.order)
        const toEase = easeOfNode(to, state.order)
        const x0 = mix(fromPlace.tangle[0], fromPlace.at[0], fromEase)
        const y0 = mix(fromPlace.tangle[1], fromPlace.at[1], fromEase)
        const x1 = mix(toPlace.tangle[0], toPlace.at[0], toEase)
        const y1 = mix(toPlace.tangle[1], toPlace.at[1], toEase)
        const dy = (y1 - y0) * 0.5
        const swing = layout.width * 0.2
        const seed = index * 11 + 40
        path.setAttribute(
          "d",
          `M${fixed(x0)} ${fixed(y0)}C${fixed(x0 + wobble(seed) * swing)} ${fixed(y0 + dy + wobble(seed + 1) * swing * 0.8)} ${fixed(x1 + wobble(seed + 2) * swing)} ${fixed(y1 - dy + wobble(seed + 3) * swing * 0.8)} ${fixed(x1)} ${fixed(y1)}`,
        )
        const drawn = clamp(state.draw * 1.6 - 0.25 - (index / TANGLE_EDGES.length) * 0.35)
        path.setAttribute("stroke-dashoffset", fixed(mix(1 - drawn, 1, gone)))
        path.setAttribute("opacity", drawn > 0 ? "1" : "0")
      })

      const structure = clamp((state.order - 0.68) / 0.26)
      if (parts.structure) parts.structure.style.opacity = String(structure)
      if (parts.grid) parts.grid.style.opacity = String(structure)
    }

    let open = 0
    FINDING_KEYS.forEach((key, index) => {
      const closes = FINDING_CLOSES[key]
      const progress = closes > 1 ? state.bus : state.order
      const threshold = closes > 1 ? 0.5 : closes
      if (progress < threshold) open += 1
      const group = parts.findings[index]
      if (group) group.style.opacity = String(clamp((state.draw - 0.62) / 0.26) * (1 - clamp((progress - threshold) / 0.05)))
    })
    if (open !== openFindingsRef.current) {
      openFindingsRef.current = open
      if (parts.count) parts.count.textContent = String(open)
    }

    if (busChanged) {
      if (parts.late) parts.late.style.opacity = String(clamp(state.bus * 1.5))
      parts.rail?.setAttribute("stroke-dashoffset", (1 - state.bus).toFixed(3))
      if (parts.statusFrom) parts.statusFrom.style.opacity = String(1 - clamp((state.bus - 0.4) / 0.2))
      if (parts.statusTo) parts.statusTo.style.opacity = String(clamp((state.bus - 0.4) / 0.2))
      syncFlow()
    }
  }

  useImperativeHandle(ref, () => ({ update: apply }))

  useLayoutEffect(() => {
    const query = globalThis.matchMedia("(max-width: 767px)")
    const sync = () => setLayoutName(query.matches ? "tall" : "wide")
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  // The two layouts have different nodes on screen, so the cached lookups and the last applied state start over.
  useLayoutEffect(() => {
    if (layoutName) {
      partsRef.current = null
      appliedRef.current = null
      openFindingsRef.current = -1
    }
  }, [layoutName])

  useLayoutEffect(() => {
    apply(stateRef.current)
  })

  // The little requests only move while they can be seen.
  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.pauseAnimations()
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
      syncFlow()
    })
    observer.observe(svg)
    return () => observer.disconnect()
  })

  const { platform, rail, font } = layout
  const coreEnd = (flat: number[]) => cubicsToPath(flat)
  const platformCells = ["observability", "delivery", "infra"] as const
  const cellWidth = platform.width / platformCells.length

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-labelledby="system-diagram-title"
      className={className}
    >
      <title id="system-diagram-title">{t("diagramTitle")}</title>
      <defs>
        <pattern id="system-diagram-grid" width={layout.width / 50} height={layout.width / 50} patternUnits="userSpaceOnUse">
          <circle cx={1} cy={1} r={0.8} fill="currentColor" fillOpacity={0.14} />
        </pattern>
        <marker id="system-diagram-arrow" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
          <path d="M1 1L7 4L1 7" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
        </marker>
        <marker id="system-diagram-event" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
          <path d="M1 1L7 4L1 7" fill="none" stroke={EMERALD} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>

      <rect data-grid x={-20} y={20} width={layout.width + 40} height={layout.height - 20} fill="url(#system-diagram-grid)" />

      {/* What only appears once the system has a shape: lanes, and a boundary around each domain and the data it owns. */}
      <g data-structure>
        {layout.dividers.map((y) => (
          <line key={y} x1={0} x2={layout.width} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.09} />
        ))}
        {layout.rows.map((row) => (
          <text
            key={row.key}
            x={0}
            y={row.y}
            dominantBaseline="central"
            fill="currentColor"
            fillOpacity={0.58}
            fontSize={font.label}
            fontWeight={500}
          >
            {t(`rows.${row.key}`)}
          </text>
        ))}
        {layout.zones.map(([x, y, width, height]) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={width}
            height={height}
            rx={5}
            fill={EMERALD}
            fillOpacity={0.055}
            stroke={EMERALD}
            strokeOpacity={0.42}
            strokeDasharray="4 4"
          />
        ))}
      </g>

      <g fill="none" stroke="currentColor" strokeLinecap="round">
        {/* The mess, in red marker. Only the system underneath survives. */}
        <g stroke={SIGNAL} strokeWidth={1.15} strokeOpacity={0.82}>
          {TANGLE_EDGES.map(([from, to], index) => (
            <path key={`${from}-${to}`} data-tangle={index} pathLength={1} strokeDasharray="1 1" strokeDashoffset={0} opacity={0} />
          ))}
        </g>

        <g strokeWidth={1.2}>
          {layout.core.map((edge, index) => (
            <path
              key={`${edge.from}-${edge.to}`}
              data-core={index}
              d={coreEnd(geometry[index].straight)}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={0}
              markerEnd="url(#system-diagram-arrow)"
            />
          ))}
        </g>
      </g>

      <g data-late stroke={EMERALD} strokeLinecap="round">
        {layout.stubs.map(([x1, y1, x2, y2]) => {
          const downstream = y1 === rail.y
          return (
            <line
              key={`${x1}-${y1}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth={1.2}
              strokeDasharray="3 4"
              markerEnd={downstream ? "url(#system-diagram-event)" : undefined}
            />
          )
        })}
        <line
          data-rail
          x1={rail.x1}
          x2={rail.x2}
          y1={rail.y}
          y2={rail.y}
          strokeWidth={3}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={0}
        />
        <g
          stroke="var(--board)"
          strokeWidth={3.5}
          fill={EMERALD}
          fontSize={font.label}
          fontWeight={600}
          paintOrder="stroke"
          textAnchor="middle"
        >
          <text x={rail.label[0]} y={rail.label[1]} dominantBaseline="central">
            {t("rail")}
          </text>
          {rail.sub && (
            <text x={rail.sub[0]} y={rail.sub[1]} dominantBaseline="central" fontWeight={400} fontSize={font.sub}>
              {t("railSub")}
            </text>
          )}
        </g>
        <g stroke="none">
          <rect x={platform.x} y={platform.y} width={platform.width} height={platform.height} rx={3} fill={EMERALD} />
          {platformCells.map((cell, index) => (
            <g key={cell} transform={`translate(${platform.x + cellWidth * (index + 0.5)} ${platform.y + platform.height / 2})`}>
              {index > 0 && (
                <line
                  x1={-cellWidth / 2}
                  x2={-cellWidth / 2}
                  y1={-platform.height / 2}
                  y2={platform.height / 2}
                  stroke="#f5f0e4"
                  strokeOpacity={0.24}
                />
              )}
              <text
                y={platform.subs ? -font.sub * 0.62 : 0}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#f5f0e4"
                fontSize={platform.subs ? font.title - 0.5 : font.label}
                fontWeight={600}
              >
                {t(`platform.${cell}`)}
              </text>
              {platform.subs && (
                <text
                  y={font.sub * 0.92}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#f5f0e4"
                  fillOpacity={0.78}
                  fontSize={font.sub}
                >
                  {t(`platform.${cell}Sub`)}
                </text>
              )}
            </g>
          ))}
        </g>
        {layout.legend && (
          <g
            transform={`translate(${layout.legend[0]} ${layout.legend[1]})`}
            stroke="none"
            fill="currentColor"
            fontSize={font.label}
            className="text-[#0d1526]"
          >
            <line x1={0} x2={26} y1={0} y2={0} stroke="currentColor" strokeWidth={1.2} />
            <text x={34} dominantBaseline="central" fillOpacity={0.7}>
              {t("legend.sync")}
            </text>
            <line x1={150} x2={176} y1={0} y2={0} stroke={EMERALD} strokeWidth={1.2} strokeDasharray="3 4" />
            <text x={184} dominantBaseline="central" fillOpacity={0.7}>
              {t("legend.async")}
            </text>
            <rect
              x={300}
              y={-7}
              width={26}
              height={14}
              rx={2}
              fill={EMERALD}
              fillOpacity={0.055}
              stroke={EMERALD}
              strokeOpacity={0.5}
              strokeDasharray="3 3"
            />
            <text x={334} dominantBaseline="central" fillOpacity={0.7}>
              {t("legend.boundary")}
            </text>
            <rect
              x={486}
              y={-7}
              width={26}
              height={14}
              rx={2}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.62}
              strokeDasharray="3 3"
            />
            <text x={520} dominantBaseline="central" fillOpacity={0.7}>
              {t("legend.external")}
            </text>
          </g>
        )}
      </g>

      {/* A few requests and events moving through the finished system. */}
      <g data-flow opacity={1} style={{ opacity: 0 }}>
        {layout.flows.map((flow) => {
          const motion = `M${flow.points.map(([x, y]) => `${x} ${y}`).join("L")}`
          return (
            <circle key={motion} r={layout.width < 600 ? 3 : 3.6} fill={flow.tone === "emerald" ? EMERALD : "currentColor"}>
              <animateMotion dur={`${flow.duration}s`} repeatCount="indefinite" path={motion} />
              <animate
                attributeName="opacity"
                dur={`${flow.duration}s`}
                repeatCount="indefinite"
                values="0;1;1;0"
                keyTimes="0;0.06;0.9;1"
              />
            </circle>
          )
        })}
      </g>

      {NODE_IDS.map((id) => {
        const place = layout.nodes[id]
        return (
          <g
            key={id}
            data-node={id}
            transform={`translate(${place.at[0]} ${place.at[1]})`}
            style={{ opacity: NODES[id].dies === undefined ? 1 : 0 }}
          >
            <NodeShape id={id} layout={layout} title={t(`nodes.${id}`)} sub={NODES[id].sub ? t(`subs.${id}`) : undefined} />
          </g>
        )
      })}

      {/* An architect's findings, marked against the as-is system. */}
      {FINDING_KEYS.map((key, index) => {
        const at = layout.findings[key]
        return (
          <g key={key} data-finding={key} transform={at ? `translate(${at[0]} ${at[1]})` : undefined} style={{ opacity: 0 }}>
            {at && (
              <>
                <circle r={font.finding * 0.72} fill={SIGNAL} />
                <text textAnchor="middle" dominantBaseline="central" fill="#fbf8f0" fontSize={font.finding * 0.82} fontWeight={700}>
                  {index + 1}
                </text>
                <text
                  x={font.finding * 1.05}
                  dominantBaseline="central"
                  fill={SIGNAL}
                  fontSize={font.finding}
                  fontWeight={600}
                  stroke="var(--board)"
                  strokeWidth={4}
                  paintOrder="stroke"
                >
                  {t(`findings.${key}`)}
                </text>
              </>
            )}
          </g>
        )
      })}

      <g fontSize={font.label} fontWeight={600} transform={`translate(0 ${layout.status.y})`}>
        <g data-status="from" style={{ opacity: 0 }}>
          <circle cx={4} r={4} fill={SIGNAL} />
          <text x={14} dominantBaseline="central" fill={SIGNAL}>
            {t("status.asIs")}
          </text>
        </g>
        <g data-status="to">
          <circle cx={4} r={4} fill={EMERALD} />
          <text x={14} dominantBaseline="central" fill={EMERALD}>
            {t("status.target")}
          </text>
        </g>
        <text data-status-count x={layout.status.gap} dominantBaseline="central" fill="currentColor" fillOpacity={0.72} fontWeight={500}>
          {t("status.open")} <tspan data-finding-count>{0}</tspan>
        </text>
      </g>
    </svg>
  )
}
