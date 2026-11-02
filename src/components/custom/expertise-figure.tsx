"use client"

import { type CSSProperties, type JSX, useEffect, useRef } from "react"

import { cn } from "~/src/lib/utils"

type Discipline = "ai" | "beSystems" | "feArch" | "strategy"
type Point = readonly [number, number]

/** One depth of a drawing. Painted back to front, so a plate can hide what is behind it. */
interface Layer {
  accent?: string[]
  dashed?: string[]
  dots?: Point[]
  faint?: string[]
  lines?: string[]
  plates?: string[]
}

const COS = Math.cos(Math.PI / 6)

/** Isometric projection: x runs down to the right, y down to the left, z straight up. */
const projector =
  (originX: number, originY: number, scale = 1) =>
  (x: number, y: number, z = 0): Point => [
    // Rounded, because the server and the browser can differ in the last digits of a sine.
    Math.round((originX + (x - y) * COS * scale) * 10) / 10,
    Math.round((originY + (x + y) * 0.5 * scale - z * scale) * 10) / 10,
  ]

const path = (points: readonly Point[], close = false) =>
  `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}${close ? "Z" : ""}`

/** Deterministic, so server and client agree on every path. */
const noise = (seed: number) => {
  const raw = Math.sin(seed * 12.9898) * 43758.5453
  return raw - Math.floor(raw)
}

type Project = ReturnType<typeof projector>

const floor = (at: Project, x0: number, y0: number, x1: number, y1: number, z = 0) =>
  path([at(x0, y0, z), at(x1, y0, z), at(x1, y1, z), at(x0, y1, z)], true)

/** A block with its three visible faces. */
const block = (at: Project, x: number, y: number, z: number, w: number, d: number, h: number) => [
  floor(at, x, y, x + w, y + d, z + h),
  path([at(x + w, y, z + h), at(x + w, y, z), at(x + w, y + d, z), at(x, y + d, z), at(x, y + d, z + h)]),
  path([at(x + w, y + d, z + h), at(x + w, y + d, z)]),
]

const ellipseArc = (cx: number, cy: number, rx: number, ry: number, sweep: 0 | 1) =>
  `M${(cx - rx).toFixed(1)} ${cy.toFixed(1)}A${rx} ${ry} 0 0 ${sweep} ${(cx + rx).toFixed(1)} ${cy.toFixed(1)}`

/** A data store standing on a plate. */
const cylinder = (at: Project, x: number, y: number, z: number, radius: number, h: number) => {
  const [cx, cy] = at(x, y, z)
  const top = cy - h
  const ry = radius * 0.5
  return [
    ellipseArc(cx, top, radius, ry, 1),
    ellipseArc(cx, top, radius, ry, 0),
    `M${(cx - radius).toFixed(1)} ${top.toFixed(1)}V${cy.toFixed(1)}`,
    `M${(cx + radius).toFixed(1)} ${top.toFixed(1)}V${cy.toFixed(1)}`,
    ellipseArc(cx, cy, radius, ry, 0),
  ]
}

/** System architecture: the layers of a system pulled apart, with one request running down through all of them. */
function systemsDrawing(): Layer[] {
  const at = projector(260, 158)
  const size = 140
  const step = 52
  const plate = (level: number) => floor(at, 0, 0, size, size, level * step)
  const sides = (level: number) =>
    [
      [0, size],
      [size, 0],
    ].map(([x, y]) => path([at(x, y, level * step), at(x, y, (level + 1) * step)]))
  // The front corner is the one edge no plate hides, so the request runs down it.
  const request = (level: number) => path([at(size, size, level * step), at(size, size, (level + 1) * step)])

  const stores = [
    [30, 116],
    [116, 30],
    [98, 98],
  ].flatMap(([x, y]) => cylinder(at, x, y, 0, 13, 17))
  const rails = [28, 70, 112].map((y) => path([at(10, y, step), at(130, y, step)]))
  const services = [
    [16, 20],
    [58, 20],
    [100, 20],
    [16, 86],
    [58, 86],
    [100, 86],
  ].flatMap(([x, y]) => block(at, x, y, step * 2, 24, 34, 13))
  const edge = block(at, 28, 54, step * 3, 84, 32, 9)

  return [
    { plates: [plate(0)], lines: stores },
    { accent: [request(0)], dashed: sides(0), dots: [at(size, size, 0)] },
    { plates: [plate(1)], lines: rails, dots: [at(size, size, step)] },
    { accent: [request(1)], dashed: sides(1) },
    { plates: [plate(2)], lines: services, dots: [at(size, size, step * 2)] },
    { accent: [request(2)], dashed: sides(2) },
    { plates: [plate(3)], lines: edge, dots: [at(size, size, step * 3)] },
  ]
}

/** AI: a noisy bundle goes in, three gates comb it, and only what passed all three carries on. */
function aiDrawing(): Layer[] {
  const at = projector(232, 172)
  const gates = [86, 8, -70]
  const lanes = Array.from({ length: 16 }, (_, index) => ({
    x: 4 + (index % 4) * 25 + noise(index) * 6,
    z: 6 + Math.floor(index / 4) * 19 + noise(index + 40) * 5,
    // How many gates this strand gets through.
    passes: index === 5 || index === 10 ? 3 : index % 5 === 0 ? 2 : index % 3 === 0 ? 1 : 0,
    seed: index + 1,
  }))
  const frame = (y: number) => path([at(-8, y, -6), at(100, y, -6), at(100, y, 88), at(-8, y, 88)], true)

  const strand = (lane: (typeof lanes)[number]) => {
    const stop = lane.passes === 3 ? -165 : gates[lane.passes]
    const points: Point[] = []
    for (let y = 165; y >= stop; y -= 11) {
      // Wild before the first gate, combed straight after it.
      const loose = Math.max(0, Math.min(1, (y - gates[0]) / 60))
      const wander = Math.sin(y * 0.055 + lane.seed * 1.7) * 13 * loose
      const rise = Math.cos(y * 0.07 + lane.seed * 2.3) * 11 * loose
      points.push(at(lane.x + wander, y, lane.z + rise))
    }
    return { line: path(points), end: points.at(-1) as Point, kept: lane.passes === 3 }
  }
  const strands = lanes.map(strand)

  return [
    {
      lines: strands.filter((item) => !item.kept).map((item) => item.line),
      dots: strands.filter((item) => !item.kept).map((item) => item.end),
    },
    { faint: gates.map(frame) },
    { accent: strands.filter((item) => item.kept).map((item) => item.line) },
    { lines: gates.map(frame) },
  ]
}

/** Full-stack product: one product, one design system, the same blocks on the big screen and the small one. */
function productDrawing(): Layer[] {
  const at = projector(180, 166, 1.06)
  const rect = (y: number, x0: number, z0: number, x1: number, z1: number) =>
    path([at(x0, y, z0), at(x1, y, z0), at(x1, y, z1), at(x0, y, z1)], true)

  const browser = {
    plates: [rect(0, 0, 0, 232, 150)],
    lines: [
      path([at(0, 0, 134), at(232, 0, 134)]),
      rect(0, 12, 74, 118, 122),
      rect(0, 128, 74, 220, 122),
      path([at(128, 0, 74), at(220, 0, 122)]),
      path([at(128, 0, 122), at(220, 0, 74)]),
      rect(0, 12, 14, 74, 62),
      rect(0, 85, 14, 147, 62),
      rect(0, 158, 14, 220, 62),
    ],
    faint: [106, 96].map((z) => path([at(20, 0, z), at(z === 106 ? 104 : 88, 0, z)])),
    dots: [at(9, 0, 142), at(17, 0, 142), at(25, 0, 142)],
    accent: [rect(0, 20, 80, 62, 89)],
  }
  const phone = {
    plates: [rect(70, 12, -2, 66, 106)],
    lines: [path([at(12, 70, 95), at(66, 70, 95)]), rect(70, 19, 58, 59, 88), rect(70, 19, 30, 59, 52), rect(70, 19, 6, 59, 24)],
    accent: [rect(70, 24, 62, 44, 68)],
  }
  const projection = {
    dashed: [path([at(12, 0, 122), at(19, 70, 88)]), path([at(118, 0, 122), at(59, 70, 88)]), path([at(12, 0, 74), at(19, 70, 58)])],
  }
  return [browser, projection, phone]
}

/** Technical strategy: every option on the floor plan, most of them ruled out, one route carried through to the goal. */
function strategyDrawing(): Layer[] {
  const unit = 34
  const at = projector(250, 48)
  const grid = (cell: number, cell2: number) => at(cell * unit, cell2 * unit)
  const gridLines = Array.from({ length: 8 }, (_, index) => [
    path([grid(index, 0), grid(index, 7)]),
    path([grid(0, index), grid(7, index)]),
  ]).flat()

  const chosen: Point[] = [grid(0, 5), grid(2, 5), grid(2, 3), grid(5, 3), grid(5, 1), grid(7, 1)]
  const ruledOut = [
    [
      [2, 5],
      [5, 5],
    ],
    [
      [2, 3],
      [2, 1],
    ],
    [
      [5, 3],
      [7, 3],
    ],
    [
      [4, 3],
      [4, 6],
    ],
  ] as const
  const cross = ([x, y]: readonly [number, number]) => {
    const [cx, cy] = grid(x, y)
    return [
      path([
        [cx - 5, cy - 3],
        [cx + 5, cy + 3],
      ]),
      path([
        [cx + 5, cy - 3],
        [cx - 5, cy + 3],
      ]),
    ]
  }

  // Each decision stands taller than the last: the plan gains height as it firms up.
  const posts = [
    { cell: [2, 5], height: 26 },
    { cell: [2, 3], height: 42 },
    { cell: [5, 3], height: 60 },
    { cell: [5, 1], height: 78 },
    { cell: [7, 1], height: 104 },
  ] as const
  const postLines = posts.map(({ cell, height }) => path([grid(cell[0], cell[1]), at(cell[0] * unit, cell[1] * unit, height)]))
  const tops = posts.map(({ cell, height }) => at(cell[0] * unit, cell[1] * unit, height))
  const skyline = path(tops)
  const [goalX, goalY] = tops[4]
  const flag = path([
    [goalX, goalY],
    [goalX + 22, goalY + 7],
    [goalX, goalY + 14],
  ])

  return [
    { faint: gridLines },
    { dashed: ruledOut.map(([from, to]) => path([grid(from[0], from[1]), grid(to[0], to[1])])) },
    { lines: ruledOut.flatMap(([, to]) => cross(to)) },
    { accent: [path(chosen)], lines: postLines },
    { faint: [skyline] },
    { dots: tops.slice(0, 4), accent: [flag] },
  ]
}

const numbered = (layers: Layer[]) => layers.map((layer, position) => ({ ...layer, depth: position + 1 }))

const DRAWINGS = {
  ai: numbered(aiDrawing()),
  beSystems: numbered(systemsDrawing()),
  feArch: numbered(productDrawing()),
  strategy: numbered(strategyDrawing()),
} satisfies Record<Discipline, unknown>

interface ExpertiseFigureProps {
  className?: string
  discipline: Discipline
}

/** A small engineering plate for each area of expertise, in the panel's own colours so the hover carries it too. */
export function ExpertiseFigure({ className, discipline }: Readonly<ExpertiseFigureProps>): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        root.toggleAttribute("data-figure-in", true)
        observer.disconnect()
      },
      { threshold: 0.25 },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={rootRef}
      className={cn(
        "text-cream transition-colors duration-300 [--figure-accent:var(--champagne)] [--figure-plate:#0b5a43] group-hover:text-emerald-deep group-hover:[--figure-accent:var(--emerald)] group-hover:[--figure-plate:#e9e3d2]",
        className,
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 520 300" className="absolute inset-0 size-full">
        {DRAWINGS[discipline].map((layer) => {
          const delay = { "--delay": `${layer.depth * 0.09}s` } as CSSProperties
          return (
            <g key={layer.depth} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={delay}>
              {layer.plates?.map((d) => (
                <path
                  key={d}
                  d={d}
                  className="figure-fade transition-[fill] duration-300"
                  style={{ fill: "var(--figure-plate)" }}
                  strokeWidth={1}
                  strokeOpacity={0.6}
                />
              ))}
              {layer.faint?.map((d) => (
                <path key={d} d={d} className="figure-fade" strokeWidth={0.9} strokeOpacity={0.24} />
              ))}
              {layer.dashed?.map((d) => (
                <path key={d} d={d} className="figure-fade" strokeWidth={0.9} strokeOpacity={0.5} strokeDasharray="2 4" />
              ))}
              {layer.lines?.map((d) => (
                <path key={d} d={d} pathLength={1} className="figure-line" strokeWidth={1} strokeOpacity={0.72} />
              ))}
              {layer.accent?.map((d) => (
                <path key={d} d={d} pathLength={1} className="figure-line" stroke="var(--figure-accent)" strokeWidth={1.6} />
              ))}
              {layer.dots?.map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} className="figure-fade" fill="var(--figure-accent)" stroke="none" />
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
