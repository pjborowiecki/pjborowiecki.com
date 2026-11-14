import {
  DIAGRAM_FINDING_CLOSES,
  DIAGRAM_FINDING_KEYS,
  DIAGRAM_LAYOUT,
  DIAGRAM_NODES,
  DIAGRAM_NODE_IDS,
  DIAGRAM_STATUS_LABEL_X,
  DIAGRAM_TANGLE_EDGES,
  type DiagramLayoutName,
  type DiagramNodePlacement,
  type DiagramNodeSpec,
  type DiagramState,
} from "~/src/data/system-diagram"
import { DIAGRAM_LAYOUTS } from "~/src/data/system-diagram-layouts"

import {
  type CoreGeometry,
  type CurveWobble,
  DIAGRAM_GEOMETRY,
  clamp,
  easeNode,
  formatCoordinate,
  formatCubicPath,
  measureWobble,
  mix,
} from "~/src/lib/system-diagram-geometry"

interface NodeBinding {
  readonly group: SVGGElement | undefined
  readonly index: number
  readonly place: DiagramNodePlacement
  readonly spec: DiagramNodeSpec
}

interface CoreBinding {
  readonly fromIndex: number
  readonly path: SVGPathElement | undefined
  readonly shape: CoreGeometry
  readonly stagger: number
  readonly toIndex: number
}

interface TangleBinding {
  readonly bend: CurveWobble
  readonly from: DiagramNodePlacement
  readonly fromIndex: number
  readonly path: SVGPathElement | undefined
  readonly stagger: number
  readonly swing: number
  readonly to: DiagramNodePlacement
  readonly toIndex: number
}

interface FindingBinding {
  readonly closes: number
  readonly group: SVGGElement | undefined
}

interface DiagramScene {
  readonly core: readonly CoreBinding[]
  readonly count: Element | undefined
  readonly findings: readonly FindingBinding[]
  readonly flow: SVGGElement | undefined
  readonly grid: SVGRectElement | undefined
  readonly late: SVGGElement | undefined
  readonly nodes: readonly NodeBinding[]
  readonly rail: Element | undefined
  readonly statusFrom: SVGGElement | undefined
  readonly statusTo: SVGGElement | undefined
  readonly structure: SVGGElement | undefined
  readonly tangle: readonly TangleBinding[]
}

interface DiagramFrame {
  readonly applied: DiagramState
  hasApplied: boolean
  isVisible: boolean
  layout: DiagramLayoutName
  openFindings: number
  reducedMotion: MediaQueryList | undefined
  scene: DiagramScene | undefined
  state: DiagramState
}

const FULL = 1
const NEXT = 1
const LAST_INDEX = 1
const UNCOUNTED = -1

const DASH_DECIMALS = 3
const DASH_COMPLETE = "1.000"

const NODE_REVEAL = { rate: 4, stagger: 0.14 } as const
const NODE_FADE = 0.08

const CORE_DRAW = { rate: 1.5, stagger: 0.5 } as const
const CORE_GROW = 0.14

const TANGLE_SWING = 0.2
const TANGLE_SEED = { base: 40, step: 11 } as const
const TANGLE_CLEAR_RATE = 1.6
const TANGLE_DRAW = { delay: 0.25, rate: 1.6, stagger: 0.35 } as const
const TANGLE_MIDPOINT = 0.5
const TANGLE_LIFT = 0.8

const STRUCTURE_REVEAL = { span: 0.26, start: 0.68 } as const

const FINDING_REVEAL = { span: 0.26, start: 0.62 } as const
const FINDING_CLOSE_SPAN = 0.05
const FINDING_ORDER_END = 1
const FINDING_BUS_THRESHOLD = 0.5

const LATE_RATE = 1.5
const STATUS_SWAP = { span: 0.2, start: 0.4 } as const
const STATUS_COUNT_GAP = 16

const FLOW_START = 0.98
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

const RESOLVED_DIAGRAM: DiagramState = { bus: 1, draw: 1, order: 1 }

const findPart = <Part extends Element>(svg: SVGSVGElement, selector: string, type: new () => Part): Part | undefined => {
  const found = svg.querySelector(selector)

  return found instanceof type ? found : undefined
}

const placeFindingCount = (svg: SVGSVGElement): void => {
  const lengths = Array.from(svg.querySelectorAll("[data-status] text"), (label) =>
    label instanceof SVGTextContentElement ? label.getComputedTextLength() : 0,
  )
  const longest = Math.max(...lengths)

  svg.querySelector("[data-status-count]")?.setAttribute("x", formatCoordinate(DIAGRAM_STATUS_LABEL_X + longest + STATUS_COUNT_GAP))
}

const bindNodes = (svg: SVGSVGElement, layout: DiagramLayoutName): NodeBinding[] =>
  DIAGRAM_NODE_IDS.map((id, index) => ({
    group: findPart(svg, `[data-node="${id}"]`, SVGGElement),
    index,
    place: DIAGRAM_LAYOUTS[layout].nodes[id],
    spec: DIAGRAM_NODES[id],
  }))

const bindCore = (svg: SVGSVGElement, layout: DiagramLayoutName): CoreBinding[] => {
  const geometry = DIAGRAM_GEOMETRY[layout]

  return geometry.map((shape, index) => ({
    fromIndex: DIAGRAM_NODE_IDS.indexOf(shape.edge.from),
    path: findPart(svg, `[data-core="${index}"]`, SVGPathElement),
    shape,
    stagger: index / DIAGRAM_LAYOUTS[layout].core.length,
    toIndex: DIAGRAM_NODE_IDS.indexOf(shape.edge.to),
  }))
}

const bindTangle = (svg: SVGSVGElement, layout: DiagramLayoutName): TangleBinding[] => {
  const { nodes, width } = DIAGRAM_LAYOUTS[layout]

  return DIAGRAM_TANGLE_EDGES.map((edge, index) => ({
    bend: measureWobble(index * TANGLE_SEED.step + TANGLE_SEED.base),
    from: nodes[edge.from],
    fromIndex: DIAGRAM_NODE_IDS.indexOf(edge.from),
    path: findPart(svg, `[data-tangle="${index}"]`, SVGPathElement),
    stagger: index / DIAGRAM_TANGLE_EDGES.length,
    swing: width * TANGLE_SWING,
    to: nodes[edge.to],
    toIndex: DIAGRAM_NODE_IDS.indexOf(edge.to),
  }))
}

const bindFindings = (svg: SVGSVGElement): FindingBinding[] =>
  DIAGRAM_FINDING_KEYS.map((key) => ({
    closes: DIAGRAM_FINDING_CLOSES[key],
    group: findPart(svg, `[data-finding="${key}"]`, SVGGElement),
  }))

const createScene = (svg: SVGSVGElement, layout: DiagramLayoutName): DiagramScene => {
  placeFindingCount(svg)

  return {
    core: bindCore(svg, layout),
    count: findPart(svg, "[data-finding-count]", Element),
    findings: bindFindings(svg),
    flow: findPart(svg, "[data-flow]", SVGGElement),
    grid: findPart(svg, "[data-grid]", SVGRectElement),
    late: findPart(svg, "[data-late]", SVGGElement),
    nodes: bindNodes(svg, layout),
    rail: findPart(svg, "[data-rail]", Element),
    statusFrom: findPart(svg, "[data-status='from']", SVGGElement),
    statusTo: findPart(svg, "[data-status='to']", SVGGElement),
    structure: findPart(svg, "[data-structure]", SVGGElement),
    tangle: bindTangle(svg, layout),
  }
}

const applyNode = ({ group, index, place, spec }: NodeBinding, state: DiagramState, isOrderChanged: boolean): void => {
  if (!group) {
    return
  }

  if (isOrderChanged) {
    const eased = easeNode(index, state.order)

    group.setAttribute(
      "transform",
      `translate(${formatCoordinate(mix(place.tangle.x, place.at.x, eased))} ${formatCoordinate(mix(place.tangle.y, place.at.y, eased))}) rotate(${formatCoordinate(mix(place.tangle.rotate, 0, eased))})`,
    )
  }

  let opacity = clamp(state.draw * NODE_REVEAL.rate - index * NODE_REVEAL.stagger)

  if (spec.born !== undefined) {
    opacity *= clamp((state.order - spec.born) / NODE_FADE)
  }

  if (spec.dies !== undefined) {
    opacity *= FULL - clamp((state.order - spec.dies) / NODE_FADE)
  }

  group.style.opacity = String(opacity)
}

const morphCoreEdge = ({ fromIndex, shape, toIndex }: CoreBinding, loose: readonly number[], order: number): string => {
  const fromEase = easeNode(fromIndex, order)
  const toEase = easeNode(toIndex, order)
  const { straight, working } = shape
  const { length } = straight
  const lastPoint = length - LAST_INDEX

  for (let point = 0; point < length; point += NEXT) {
    working[point] = mix(loose[point] ?? 0, straight[point] ?? 0, mix(fromEase, toEase, point / lastPoint))
  }

  return formatCubicPath(working)
}

const applyCoreEdge = (binding: CoreBinding, state: DiagramState, isOrderChanged: boolean): void => {
  const { path, shape, stagger } = binding

  if (!path) {
    return
  }

  if (shape.loose !== undefined) {
    if (isOrderChanged) {
      path.setAttribute("d", morphCoreEdge(binding, shape.loose, state.order))
    }

    path.setAttribute("stroke-dashoffset", formatCoordinate(FULL - clamp(state.draw * CORE_DRAW.rate - stagger * CORE_DRAW.stagger)))
    path.setAttribute("opacity", "1")

    return
  }

  const drawn = clamp((state.order - (shape.edge.born ?? 0)) / CORE_GROW)

  path.setAttribute("stroke-dashoffset", drawn.toFixed(DASH_DECIMALS) === DASH_COMPLETE ? "0" : (FULL - drawn).toFixed(DASH_DECIMALS))
  path.setAttribute("opacity", drawn > 0 ? "1" : "0")
}

const applyTangleEdge = (binding: TangleBinding, state: DiagramState, gone: number): void => {
  const { bend, from, fromIndex, path, stagger, swing, to, toIndex } = binding

  if (!path) {
    return
  }

  if (gone >= FULL) {
    path.setAttribute("opacity", "0")

    return
  }

  const fromEase = easeNode(fromIndex, state.order)
  const toEase = easeNode(toIndex, state.order)
  const startX = mix(from.tangle.x, from.at.x, fromEase)
  const startY = mix(from.tangle.y, from.at.y, fromEase)
  const endX = mix(to.tangle.x, to.at.x, toEase)
  const endY = mix(to.tangle.y, to.at.y, toEase)
  const rise = (endY - startY) * TANGLE_MIDPOINT
  const drawn = clamp(state.draw * TANGLE_DRAW.rate - TANGLE_DRAW.delay - stagger * TANGLE_DRAW.stagger)

  path.setAttribute(
    "d",
    `M${formatCoordinate(startX)} ${formatCoordinate(startY)}C${formatCoordinate(startX + bend.control1X * swing)} ${formatCoordinate(startY + rise + bend.control1Y * swing * TANGLE_LIFT)} ${formatCoordinate(endX + bend.control2X * swing)} ${formatCoordinate(endY - rise + bend.control2Y * swing * TANGLE_LIFT)} ${formatCoordinate(endX)} ${formatCoordinate(endY)}`,
  )
  path.setAttribute("stroke-dashoffset", formatCoordinate(mix(FULL - drawn, FULL, gone)))
  path.setAttribute("opacity", drawn > 0 ? "1" : "0")
}

const applyShape = (scene: DiagramScene, state: DiagramState, isOrderChanged: boolean): void => {
  const gone = clamp(state.order * TANGLE_CLEAR_RATE)
  const structure = String(clamp((state.order - STRUCTURE_REVEAL.start) / STRUCTURE_REVEAL.span))

  for (const node of scene.nodes) {
    applyNode(node, state, isOrderChanged)
  }

  for (const edge of scene.core) {
    applyCoreEdge(edge, state, isOrderChanged)
  }

  for (const edge of scene.tangle) {
    applyTangleEdge(edge, state, gone)
  }

  if (scene.structure) {
    scene.structure.style.opacity = structure
  }

  if (scene.grid) {
    scene.grid.style.opacity = structure
  }
}

const applyFinding = ({ closes, group }: FindingBinding, state: DiagramState): boolean => {
  const isClosedByBus = closes > FINDING_ORDER_END
  const progress = isClosedByBus ? state.bus : state.order
  const threshold = isClosedByBus ? FINDING_BUS_THRESHOLD : closes

  if (group) {
    group.style.opacity = String(
      clamp((state.draw - FINDING_REVEAL.start) / FINDING_REVEAL.span) * (FULL - clamp((progress - threshold) / FINDING_CLOSE_SPAN)),
    )
  }

  return progress < threshold
}

const applyFindings = (scene: DiagramScene, frame: DiagramFrame, state: DiagramState): void => {
  let open = 0

  for (const finding of scene.findings) {
    if (applyFinding(finding, state)) {
      open += NEXT
    }
  }

  if (open === frame.openFindings) {
    return
  }

  frame.openFindings = open

  if (scene.count) {
    scene.count.textContent = String(open)
  }
}

const applyBus = (scene: DiagramScene, state: DiagramState): void => {
  const handover = clamp((state.bus - STATUS_SWAP.start) / STATUS_SWAP.span)

  if (scene.late) {
    scene.late.style.opacity = String(clamp(state.bus * LATE_RATE))
  }

  scene.rail?.setAttribute("stroke-dashoffset", (FULL - state.bus).toFixed(DASH_DECIMALS))

  if (scene.statusFrom) {
    scene.statusFrom.style.opacity = String(FULL - handover)
  }

  if (scene.statusTo) {
    scene.statusTo.style.opacity = String(handover)
  }
}

export const createDiagramFrame = (): DiagramFrame => ({
  applied: { bus: 0, draw: 0, order: 0 },
  hasApplied: false,
  isVisible: false,
  layout: DIAGRAM_LAYOUT.WIDE,
  openFindings: 0,
  reducedMotion: undefined,
  scene: undefined,
  state: RESOLVED_DIAGRAM,
})

export const resetDiagramFrame = (frame: DiagramFrame, layout: DiagramLayoutName): void => {
  frame.hasApplied = false
  frame.layout = layout
  frame.openFindings = UNCOUNTED
  frame.scene = undefined
}

const syncDiagramFlow = (svg: SVGSVGElement, frame: DiagramFrame): void => {
  const flow = frame.scene?.flow

  if (!flow) {
    return
  }

  const reducedMotion = frame.reducedMotion ?? globalThis.matchMedia(REDUCED_MOTION_QUERY)
  const isRunning = !reducedMotion.matches && frame.isVisible && frame.hasApplied && frame.applied.bus >= FLOW_START

  frame.reducedMotion = reducedMotion
  flow.style.opacity = isRunning ? "1" : "0"

  if (isRunning) {
    svg.unpauseAnimations()
  } else {
    svg.pauseAnimations()
  }
}

export const applyDiagramState = (svg: SVGSVGElement, frame: DiagramFrame, state: DiagramState): void => {
  const { applied, hasApplied } = frame
  const isDrawChanged = !hasApplied || applied.draw !== state.draw
  const isOrderChanged = !hasApplied || applied.order !== state.order
  const isBusChanged = !hasApplied || applied.bus !== state.bus

  if (!isDrawChanged && !isOrderChanged && !isBusChanged) {
    return
  }

  applied.bus = state.bus
  applied.draw = state.draw
  applied.order = state.order
  frame.hasApplied = true

  const scene = frame.scene ?? createScene(svg, frame.layout)

  frame.scene = scene

  if (isDrawChanged || isOrderChanged) {
    applyShape(scene, state, isOrderChanged)
  }

  applyFindings(scene, frame, state)

  if (isBusChanged) {
    applyBus(scene, state)
    syncDiagramFlow(svg, frame)
  }
}

export const watchDiagramVisibility = (svg: SVGSVGElement, frame: DiagramFrame): (() => void) => {
  svg.pauseAnimations()

  const observer = new IntersectionObserver(([entry]) => {
    frame.isVisible = entry?.isIntersecting ?? false
    syncDiagramFlow(svg, frame)
  })

  observer.observe(svg)

  return () => {
    observer.disconnect()
  }
}
