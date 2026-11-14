import { type JSX, type Ref, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from "react"

import { useTranslations } from "use-intl/react"

import { cn } from "~/src/lib/cn"

export interface HarnessState {
  draw: number
  gates: [number, number, number]
  time: number
}

export interface HarnessDiagramHandle {
  readonly update: (state: HarnessState) => void
}

interface HarnessDiagramProps {
  readonly className?: string
  readonly ref?: Ref<HarnessDiagramHandle>
}

interface Rgb {
  readonly blue: number
  readonly green: number
  readonly red: number
}

interface HarnessSize {
  readonly height: number
  readonly width: number
}

interface HarnessPalette {
  gate0: number
  gate1: number
  gate2: number
  readonly stopped: [string, string, string]
  survivor: string
}

interface HarnessSurface {
  readonly palette: HarnessPalette
  size: HarnessSize
}

interface OverlayParts {
  readonly gates: readonly Element[]
  readonly production: readonly Element[]
}

const FULL = 1
const NEXT = 1
const AFTER = 2
const HALF = 0.5

const GUARDRAILS_AT = 0.36
const HARNESS_AT = 0.58
const JUDGMENT_AT = 0.8
const GATE_AT = [GUARDRAILS_AT, HARNESS_AT, JUDGMENT_AT] as const
const GATE_COUNT = GATE_AT.length
const GATES = [
  { at: GUARDRAILS_AT, key: "guardrails" },
  { at: HARNESS_AT, key: "harness" },
  { at: JUDGMENT_AT, key: "judgment" },
] as const

const FATE = { guardrails: 0, harness: 1, judgment: 2, production: 3 } as const

type Fate = (typeof FATE)[keyof typeof FATE]

interface StrandPlan {
  readonly fate: Fate
  readonly freqA: number
  readonly freqB: number
  readonly rank: number
  readonly seedA: number
  readonly seedB: number
  readonly spread: number
}

const SAMPLES = 18
const SURVIVORS = 5
const STOPPED_AT_GUARDRAILS = 17
const STOPPED_AT_HARNESS = 10
const STOPPED_AT_JUDGMENT = 6
const STRANDS = SURVIVORS + STOPPED_AT_GUARDRAILS + STOPPED_AT_HARNESS + STOPPED_AT_JUDGMENT
const SURVIVOR_CENTER = (SURVIVORS - NEXT) * HALF

const POINT_STRIDE = 2
const Y_OFFSET = 1
const LAST_POINT = SAMPLES * POINT_STRIDE
const CURVE_TENSION = 6

const MAX_PIXEL_RATIO = 2
const FALLBACK_PIXEL_RATIO = 1
const MIN_SIZE = 1
const INITIAL_SIZE: HarnessSize = { height: 460, width: 1400 }

const CREAM: Rgb = { blue: 228, green: 240, red: 245 }
const SIGNAL: Rgb = { blue: 125, green: 143, red: 255 }
const CHAMPAGNE: Rgb = { blue: 144, green: 198, red: 226 }

const RANDOM = { frequency: 12.9898, scale: 43_758.5453 } as const
const SEED_OFFSET = { freqA: 53, freqB: 71, phaseA: 11, phaseB: 37, shuffle: 1, spread: 91 } as const
const PHASE_RANGE = 6.28
const WAVE_A = { base: 3, range: 6 } as const
const WAVE_B = { base: 8, range: 7 } as const
const SPREAD_CENTER = 0.5

const BUNDLE = { amplitude: 0.4, middle: 0.54, spread: 0.34 } as const
const SURVIVOR_LANE = { gap: 0.032, minGap: 9 } as const
const COMB = { after: 0.06, before: 0.03, straighten: 0.75 } as const
const WAVE = { lead: 0.04, primary: 0.62, primaryDrift: 0.55, ramp: 0.14, secondary: 0.38, secondaryDrift: 0.4 } as const
const HERMITE = { cubic: 2, square: 3 } as const

const SURVIVOR_STROKE = { from: 1, to: 2.1 } as const
const SURVIVOR_ALPHA = { from: 0.45, to: 1 } as const
const STOPPED_STROKE = 1
const STOPPED_ALPHA = { from: 0.45, to: 0.5 } as const
const TIP = { from: 0.6, radius: 2.4, to: 1 } as const
const HALF_TURNS = 2
const FULL_TURN = Math.PI * HALF_TURNS

const GATE_FADE_IN = 1.4
const OPACITY_DECIMALS = 2

const COMPACT_WIDTH = 700
const LABEL_SIZE = { compact: 11.5, wide: 13.5 } as const
const LABEL_INSET = { compact: 20, max: 64, ratio: 0.033 } as const
const LABEL_TOP = 14
const LABEL_BOTTOM_GAP = 8
const GATE_TOP = 26
const GATE_BOTTOM_GAP = 6

const RESOLVED_HARNESS: HarnessState = { draw: FULL, gates: [FULL, FULL, FULL], time: 0 }

const toCss = ({ blue, green, red }: Rgb): string => `rgb(${String(red)} ${String(green)} ${String(blue)})`

const CHAMPAGNE_CSS = toCss(CHAMPAGNE)
const CREAM_CSS = toCss(CREAM)
const SIGNAL_CSS = toCss(SIGNAL)

const random = (seed: number): number => {
  const raw = Math.sin(seed * RANDOM.frequency) * RANDOM.scale

  return raw - Math.floor(raw)
}

const clamp = (value: number): number => Math.min(FULL, Math.max(0, value))

const mix = (from: number, to: number, amount: number): number => from + (to - from) * amount

const smooth = (from: number, to: number, value: number): number => {
  const progress = clamp((value - from) / (to - from))

  return progress * progress * (HERMITE.square - HERMITE.cubic * progress)
}

const blend = (from: Rgb, to: Rgb, amount: number): string =>
  `rgb(${String(Math.round(mix(from.red, to.red, amount)))} ${String(Math.round(mix(from.green, to.green, amount)))} ${String(Math.round(mix(from.blue, to.blue, amount)))})`

const SHUFFLED = Array.from({ length: STRANDS }, (_, index) => index).toSorted(
  (left, right) => random(left + SEED_OFFSET.shuffle) - random(right + SEED_OFFSET.shuffle),
)

const fateFor = (rank: number): Fate => {
  if (rank < SURVIVORS) {
    return FATE.production
  }

  if (rank < SURVIVORS + STOPPED_AT_JUDGMENT) {
    return FATE.judgment
  }

  if (rank < SURVIVORS + STOPPED_AT_JUDGMENT + STOPPED_AT_HARNESS) {
    return FATE.harness
  }

  return FATE.guardrails
}

const planStrand = (strand: number): StrandPlan => {
  const rank = SHUFFLED.indexOf(strand)

  return {
    fate: fateFor(rank),
    freqA: WAVE_A.base + random(strand + SEED_OFFSET.freqA) * WAVE_A.range,
    freqB: WAVE_B.base + random(strand + SEED_OFFSET.freqB) * WAVE_B.range,
    rank,
    seedA: random(strand + SEED_OFFSET.phaseA) * PHASE_RANGE,
    seedB: random(strand + SEED_OFFSET.phaseB) * PHASE_RANGE,
    spread: random(strand + SEED_OFFSET.spread) - SPREAD_CENTER,
  }
}

const STRAND_PLANS: readonly StrandPlan[] = Array.from({ length: STRANDS }, (_, strand) => planStrand(strand))

const POINTS = new Float32Array((SAMPLES + NEXT) * POINT_STRIDE)

const pointAt = (index: number): number => POINTS[index] ?? 0

const laneOf = (plan: StrandPlan, middle: number, height: number): number => {
  if (plan.fate === FATE.production) {
    return middle + (plan.rank - SURVIVOR_CENTER) * Math.max(SURVIVOR_LANE.minGap, height * SURVIVOR_LANE.gap)
  }

  return middle + plan.spread * height * BUNDLE.spread
}

const reachOf = (plan: StrandPlan, gates: HarnessState["gates"]): number => {
  if (plan.fate === FATE.production) {
    return FULL
  }

  return mix(FULL, GATE_AT[plan.fate], smooth(0, FULL, gates[plan.fate]))
}

const combOrder = (gates: HarnessState["gates"], progress: number): number =>
  (gates[FATE.guardrails] * smooth(GUARDRAILS_AT - COMB.before, GUARDRAILS_AT + COMB.after, progress) +
    gates[FATE.harness] * smooth(HARNESS_AT - COMB.before, HARNESS_AT + COMB.after, progress) +
    gates[FATE.judgment] * smooth(JUDGMENT_AT - COMB.before, JUDGMENT_AT + COMB.after, progress)) /
  GATE_COUNT

const fillStrand = (plan: StrandPlan, { height, width }: HarnessSize, state: HarnessState): void => {
  const middle = height * BUNDLE.middle
  const amplitude = height * BUNDLE.amplitude
  const lane = laneOf(plan, middle, height)
  const reach = reachOf(plan, state.gates)

  for (let sample = 0; sample <= SAMPLES; sample += NEXT) {
    const progress = (sample / SAMPLES) * reach
    const order = combOrder(state.gates, progress)
    const wild =
      middle +
      amplitude *
        (WAVE.primary * Math.sin(plan.seedA + progress * plan.freqA + state.time * WAVE.primaryDrift) +
          WAVE.secondary * Math.sin(plan.seedB + progress * plan.freqB - state.time * WAVE.secondaryDrift)) *
        smooth(0, WAVE.ramp, progress + WAVE.lead)
    const index = sample * POINT_STRIDE

    POINTS[index] = progress * width
    POINTS[index + Y_OFFSET] = mix(wild, lane, order ** COMB.straighten)
  }
}

const traceStrand = (context: CanvasRenderingContext2D): void => {
  context.beginPath()
  context.moveTo(pointAt(0), pointAt(Y_OFFSET))

  for (let sample = 0; sample < SAMPLES; sample += NEXT) {
    const previous = Math.max(sample - NEXT, 0) * POINT_STRIDE
    const current = sample * POINT_STRIDE
    const next = (sample + NEXT) * POINT_STRIDE
    const after = Math.min(sample + AFTER, SAMPLES) * POINT_STRIDE

    context.bezierCurveTo(
      pointAt(current) + (pointAt(next) - pointAt(previous)) / CURVE_TENSION,
      pointAt(current + Y_OFFSET) + (pointAt(next + Y_OFFSET) - pointAt(previous + Y_OFFSET)) / CURVE_TENSION,
      pointAt(next) - (pointAt(after) - pointAt(current)) / CURVE_TENSION,
      pointAt(next + Y_OFFSET) - (pointAt(after + Y_OFFSET) - pointAt(current + Y_OFFSET)) / CURVE_TENSION,
      pointAt(next),
      pointAt(next + Y_OFFSET),
    )
  }
}

const strokeSurvivor = (context: CanvasRenderingContext2D, color: string, judgment: number): void => {
  context.strokeStyle = color
  context.lineWidth = mix(SURVIVOR_STROKE.from, SURVIVOR_STROKE.to, judgment)
  context.globalAlpha = mix(SURVIVOR_ALPHA.from, SURVIVOR_ALPHA.to, judgment)
  context.stroke()
}

const strokeStopped = (context: CanvasRenderingContext2D, color: string, stopped: number): void => {
  context.strokeStyle = color
  context.lineWidth = STOPPED_STROKE
  context.globalAlpha = mix(STOPPED_ALPHA.from, STOPPED_ALPHA.to, stopped)
  context.stroke()

  const tip = smooth(TIP.from, TIP.to, stopped)

  if (tip > 0) {
    context.beginPath()
    context.arc(pointAt(LAST_POINT), pointAt(LAST_POINT + Y_OFFSET), TIP.radius, 0, FULL_TURN)
    context.fillStyle = SIGNAL_CSS
    context.globalAlpha = tip
    context.fill()
  }
}

const createPalette = (): HarnessPalette => ({ gate0: -1, gate1: -1, gate2: -1, stopped: ["", "", ""], survivor: "" })

const updatePalette = (palette: HarnessPalette, [guardrails, harness, judgment]: HarnessState["gates"]): boolean => {
  if (guardrails === palette.gate0 && harness === palette.gate1 && judgment === palette.gate2) {
    return false
  }

  palette.gate0 = guardrails
  palette.gate1 = harness
  palette.gate2 = judgment
  palette.survivor = blend(CREAM, CHAMPAGNE, judgment)
  palette.stopped[FATE.guardrails] = blend(CREAM, SIGNAL, guardrails)
  palette.stopped[FATE.harness] = blend(CREAM, SIGNAL, harness)
  palette.stopped[FATE.judgment] = blend(CREAM, SIGNAL, judgment)

  return true
}

const paintStrands = (context: CanvasRenderingContext2D, { palette, size }: HarnessSurface, state: HarnessState): void => {
  for (const plan of STRAND_PLANS) {
    fillStrand(plan, size, state)
    traceStrand(context)

    if (plan.fate === FATE.production) {
      strokeSurvivor(context, palette.survivor, state.gates[FATE.judgment])
    } else {
      strokeStopped(context, palette.stopped[plan.fate], state.gates[plan.fate])
    }
  }
}

const paintHarness = (canvas: HTMLCanvasElement, surface: HarnessSurface, state: HarnessState): boolean => {
  const context = canvas.getContext("2d")

  if (!context) {
    return false
  }

  const { height, width } = surface.size
  const ratio = canvas.width / Math.max(width, MIN_SIZE)

  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, width, height)
  context.save()
  context.beginPath()
  context.rect(0, 0, width * state.draw, height)
  context.clip()
  context.lineCap = "round"

  const hasGatesMoved = updatePalette(surface.palette, state.gates)
  paintStrands(context, surface, state)
  context.restore()

  return hasGatesMoved
}

const findOverlayParts = (overlay: SVGSVGElement): OverlayParts => ({
  gates: [...overlay.querySelectorAll("[data-gate]")],
  production: [...overlay.querySelectorAll("[data-production]")],
})

const updateOverlay = ({ gates, production }: OverlayParts, state: HarnessState): void => {
  for (let gate = 0; gate < gates.length; gate += NEXT) {
    gates[gate]?.setAttribute("opacity", clamp((state.gates[gate] ?? 0) * GATE_FADE_IN).toFixed(OPACITY_DECIMALS))
  }

  for (const element of production) {
    element.setAttribute("fill", blend(SIGNAL, CHAMPAGNE, state.gates[FATE.judgment]))
  }
}

const layoutLabels = ({ height, width }: HarnessSize): { fontSize: number; inset: number; productionY: number } => {
  const isCompact = width < COMPACT_WIDTH

  return {
    fontSize: isCompact ? LABEL_SIZE.compact : LABEL_SIZE.wide,
    inset: isCompact ? LABEL_INSET.compact : Math.min(width * LABEL_INSET.ratio, LABEL_INSET.max),
    productionY: isCompact ? height - LABEL_BOTTOM_GAP : LABEL_TOP,
  }
}

export const HarnessDiagram = ({ className, ref }: HarnessDiagramProps): JSX.Element => {
  const t = useTranslations("pages.landing.ai")
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<SVGSVGElement>(null)
  const stateRef = useRef<HarnessState>(RESOLVED_HARNESS)
  const surfaceRef = useRef<HarnessSurface>({ palette: createPalette(), size: INITIAL_SIZE })
  const overlayPartsRef = useRef<OverlayParts | undefined>(undefined)

  const [size, setSize] = useState(INITIAL_SIZE)

  const draw = (state: HarnessState): void => {
    stateRef.current = state
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const hasGatesMoved = paintHarness(canvas, surfaceRef.current, state)
    const overlay = overlayRef.current

    if (!overlay || !hasGatesMoved) {
      return
    }

    overlayPartsRef.current ??= findOverlayParts(overlay)
    updateOverlay(overlayPartsRef.current, state)
  }

  useImperativeHandle(ref, () => ({ update: draw }))

  useLayoutEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current

    if (!root || !canvas) {
      return
    }

    const resize = (width: number, height: number): void => {
      if (width <= 0 || height <= 0) {
        return
      }

      const next: HarnessSize = { height: Math.round(height), width: Math.round(width) }
      const ratio = Math.min(globalThis.devicePixelRatio || FALLBACK_PIXEL_RATIO, MAX_PIXEL_RATIO)
      canvas.width = Math.round(next.width * ratio)
      canvas.height = Math.round(next.height * ratio)
      surfaceRef.current.size = next
      setSize(next)
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        resize(entry.contentRect.width, entry.contentRect.height)
      }
    })
    observer.observe(root)
    resize(root.clientWidth, root.clientHeight)

    return () => {
      observer.disconnect()
    }
  }, [])

  useLayoutEffect(() => {
    draw(stateRef.current)
  })

  const titleId = useId()
  const { height, width } = size
  const { fontSize, inset, productionY } = layoutLabels(size)

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <canvas aria-hidden className="absolute inset-0 size-full" ref={canvasRef} />
      <svg
        aria-labelledby={titleId}
        className="absolute inset-0 size-full overflow-visible"
        ref={overlayRef}
        role="img"
        viewBox={`0 0 ${String(width)} ${String(height)}`}
      >
        <title id={titleId}>{t("diagramTitle")}</title>
        {GATES.map(({ at, key }, index) => (
          <g data-gate={index} key={key}>
            <line stroke={CHAMPAGNE_CSS} strokeWidth={1} x1={at * width} x2={at * width} y1={GATE_TOP} y2={height - GATE_BOTTOM_GAP} />
            <text fill={CHAMPAGNE_CSS} fontSize={fontSize} fontWeight={500} textAnchor="middle" x={at * width} y={LABEL_TOP}>
              {t(key)}
            </text>
          </g>
        ))}
        <text fill={CREAM_CSS} fontSize={fontSize} fontWeight={500} opacity={0.8} x={inset} y={LABEL_TOP}>
          {t("diagramIn")}
        </text>
        <text data-production fill={CHAMPAGNE_CSS} fontSize={fontSize} fontWeight={500} textAnchor="end" x={width - inset} y={productionY}>
          {t("diagramOut")}
        </text>
      </svg>
    </div>
  )
}
