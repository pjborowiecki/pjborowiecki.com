"use client"

import { type JSX, type Ref, useImperativeHandle, useLayoutEffect, useRef, useState } from "react"

import { useTranslations } from "next-intl"

export interface HarnessState {
  /** 0 to 1: the strands draw in from the left. */
  draw: number
  /** 0 to 1 for each gate: guardrails, harness, judgment. */
  gates: [number, number, number]
  /** Seconds. The unchecked part of the bundle never quite stops moving. */
  time: number
}

export const RESOLVED_HARNESS: HarnessState = { draw: 1, gates: [1, 1, 1], time: 0 }

export interface HarnessDiagramHandle {
  update: (state: HarnessState) => void
}

const GATE_AT = [0.36, 0.58, 0.8] as const
const GATE_KEYS = ["guardrails", "harness", "judgment"] as const
const SAMPLES = 18
const SURVIVORS = 5
const STOPPED_AT_GATE = [17, 10, 6] as const
const STRANDS = SURVIVORS + STOPPED_AT_GATE[0] + STOPPED_AT_GATE[1] + STOPPED_AT_GATE[2]
const MAX_PIXEL_RATIO = 2

const CREAM = [245, 240, 228]
const SIGNAL = [255, 143, 125]
const CHAMPAGNE = [226, 198, 144]
const SIGNAL_CSS = `rgb(${SIGNAL.join(" ")})`

/** Deterministic, so server and client agree on every path. */
const random = (seed: number) => {
  const raw = Math.sin(seed * 12.9898) * 43758.5453
  return raw - Math.floor(raw)
}

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount
const smooth = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}
const blend = (from: number[], to: number[], amount: number) =>
  `rgb(${Math.round(mix(from[0], to[0], amount))} ${Math.round(mix(from[1], to[1], amount))} ${Math.round(mix(from[2], to[2], amount))})`

// Which gate stops each strand, shuffled so that the survivors start out anywhere in the bundle. 3 reaches production.
const SHUFFLED = Array.from({ length: STRANDS }, (_, index) => index).sort((a, b) => random(a + 1) - random(b + 1))
const RANKS = SHUFFLED.reduce<Record<number, number>>((ranks, strand, position) => {
  ranks[strand] = position
  return ranks
}, {})
const FATES = Array.from({ length: STRANDS }, (_, strand) => {
  const position = RANKS[strand]
  if (position < SURVIVORS) return 3
  if (position < SURVIVORS + STOPPED_AT_GATE[2]) return 2
  if (position < SURVIVORS + STOPPED_AT_GATE[2] + STOPPED_AT_GATE[1]) return 1
  return 0
})

// Per-strand constants, worked out once. The draw loop below runs every frame, so it allocates as little as it can.
const SEEDS = Array.from({ length: STRANDS }, (_, strand) => ({
  seedA: random(strand + 11) * 6.28,
  seedB: random(strand + 37) * 6.28,
  freqA: 3 + random(strand + 53) * 6,
  freqB: 8 + random(strand + 71) * 7,
  spread: random(strand + 91) - 0.5,
}))
const POINTS = new Float32Array((SAMPLES + 1) * 2)

function fillStrand(strand: number, width: number, height: number, state: HarnessState): void {
  const fate = FATES[strand]
  const { seedA, seedB, freqA, freqB, spread } = SEEDS[strand]
  const middle = height * 0.54
  const amplitude = height * 0.4
  const lane = fate === 3 ? middle + (RANKS[strand] - (SURVIVORS - 1) / 2) * Math.max(9, height * 0.032) : middle + spread * height * 0.34
  const reach = fate === 3 ? 1 : mix(1, GATE_AT[fate], smooth(0, 1, state.gates[fate]))

  for (let sample = 0; sample <= SAMPLES; sample += 1) {
    const u = (sample / SAMPLES) * reach
    const order =
      (state.gates[0] * smooth(GATE_AT[0] - 0.03, GATE_AT[0] + 0.06, u) +
        state.gates[1] * smooth(GATE_AT[1] - 0.03, GATE_AT[1] + 0.06, u) +
        state.gates[2] * smooth(GATE_AT[2] - 0.03, GATE_AT[2] + 0.06, u)) /
      3
    const wild =
      middle +
      amplitude *
        (0.62 * Math.sin(seedA + u * freqA + state.time * 0.55) + 0.38 * Math.sin(seedB + u * freqB - state.time * 0.4)) *
        smooth(0, 0.14, u + 0.04)
    POINTS[sample * 2] = u * width
    POINTS[sample * 2 + 1] = mix(wild, lane, order ** 0.75)
  }
}

function traceStrand(context: CanvasRenderingContext2D): void {
  const last = SAMPLES
  context.beginPath()
  context.moveTo(POINTS[0], POINTS[1])
  for (let index = 0; index < last; index += 1) {
    const previous = Math.max(index - 1, 0) * 2
    const current = index * 2
    const next = (index + 1) * 2
    const after = Math.min(index + 2, last) * 2
    context.bezierCurveTo(
      POINTS[current] + (POINTS[next] - POINTS[previous]) / 6,
      POINTS[current + 1] + (POINTS[next + 1] - POINTS[previous + 1]) / 6,
      POINTS[next] - (POINTS[after] - POINTS[current]) / 6,
      POINTS[next + 1] - (POINTS[after + 1] - POINTS[current + 1]) / 6,
      POINTS[next],
      POINTS[next + 1],
    )
  }
}

interface HarnessDiagramProps {
  className?: string
  ref?: Ref<HarnessDiagramHandle>
}

/**
 * A bundle of AI output, combed through three gates into the few lines that reach production. The strands are on a
 * canvas because they all change every frame; the gates and labels stay as real text above them.
 */
export function HarnessDiagram({ className, ref }: Readonly<HarnessDiagramProps>): JSX.Element {
  const t = useTranslations("custom.ai")
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<SVGSVGElement>(null)
  const stateRef = useRef<HarnessState>(RESOLVED_HARNESS)
  const paintRef = useRef({ gate0: -1, gate1: -1, gate2: -1, survivor: "", stopped: ["", "", ""] })
  const overlayPartsRef = useRef<{ gates: Array<Element | null>; production: Element | null } | null>(null)
  const [size, setSize] = useState({ width: 1400, height: 460 })
  const sizeRef = useRef(size)
  const { width, height } = size

  const draw = (state: HarnessState) => {
    stateRef.current = state
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return
    const { width: w, height: h } = sizeRef.current
    const ratio = canvas.width / Math.max(w, 1)

    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.clearRect(0, 0, w, h)
    context.save()
    context.beginPath()
    context.rect(0, 0, w * state.draw, h)
    context.clip()
    context.lineCap = "round"

    const [gate0, gate1, gate2] = state.gates
    const gatesMoved = gate0 !== paintRef.current.gate0 || gate1 !== paintRef.current.gate1 || gate2 !== paintRef.current.gate2
    const paint = paintRef.current
    if (gatesMoved) {
      paint.gate0 = gate0
      paint.gate1 = gate1
      paint.gate2 = gate2
      paint.survivor = blend(CREAM, CHAMPAGNE, gate2)
      paint.stopped[0] = blend(CREAM, SIGNAL, gate0)
      paint.stopped[1] = blend(CREAM, SIGNAL, gate1)
      paint.stopped[2] = blend(CREAM, SIGNAL, gate2)
    }

    for (let strand = 0; strand < STRANDS; strand += 1) {
      const fate = FATES[strand]
      fillStrand(strand, w, h, state)
      traceStrand(context)
      if (fate === 3) {
        context.strokeStyle = paint.survivor
        context.lineWidth = mix(1, 2.1, gate2)
        context.globalAlpha = mix(0.45, 1, gate2)
        context.stroke()
        continue
      }
      const stopped = state.gates[fate]
      context.strokeStyle = paint.stopped[fate]
      context.lineWidth = 1
      context.globalAlpha = mix(0.45, 0.5, stopped)
      context.stroke()

      const tip = smooth(0.6, 1, stopped)
      if (tip > 0) {
        context.beginPath()
        context.arc(POINTS[SAMPLES * 2], POINTS[SAMPLES * 2 + 1], 2.4, 0, Math.PI * 2)
        context.fillStyle = SIGNAL_CSS
        context.globalAlpha = tip
        context.fill()
      }
    }
    context.restore()

    const overlay = overlayRef.current
    if (!overlay || !gatesMoved) return
    if (!overlayPartsRef.current) {
      overlayPartsRef.current = {
        gates: GATE_KEYS.map((_, gate) => overlay.querySelector(`[data-gate="${gate}"]`)),
        production: overlay.querySelector("[data-production]"),
      }
    }
    const groups = overlayPartsRef.current
    for (let gate = 0; gate < GATE_KEYS.length; gate += 1) {
      groups.gates[gate]?.setAttribute("opacity", clamp(state.gates[gate] * 1.4).toFixed(2))
    }
    groups.production?.setAttribute("fill", blend(SIGNAL, CHAMPAGNE, gate2))
  }

  useImperativeHandle(ref, () => ({ update: draw }))

  useLayoutEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return
    const resize = (w: number, h: number) => {
      if (w <= 0 || h <= 0) return
      const next = { width: Math.round(w), height: Math.round(h) }
      const ratio = Math.min(globalThis.devicePixelRatio || 1, MAX_PIXEL_RATIO)
      canvas.width = Math.round(next.width * ratio)
      canvas.height = Math.round(next.height * ratio)
      sizeRef.current = next
      setSize(next)
    }
    const observer = new ResizeObserver(([entry]) => resize(entry.contentRect.width, entry.contentRect.height))
    observer.observe(root)
    resize(root.clientWidth, root.clientHeight)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    draw(stateRef.current)
  })

  const fontSize = width < 700 ? 11.5 : 13.5
  const inset = width < 700 ? 20 : Math.min(width * 0.033, 64)

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
      <svg
        ref={overlayRef}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby="harness-title"
        className="absolute inset-0 size-full overflow-visible"
      >
        <title id="harness-title">{t("diagramTitle")}</title>
        {GATE_KEYS.map((key, index) => (
          <g key={key} data-gate={index}>
            <line
              x1={GATE_AT[index] * width}
              x2={GATE_AT[index] * width}
              y1={26}
              y2={height - 6}
              stroke={`rgb(${CHAMPAGNE.join(" ")})`}
              strokeWidth={1}
            />
            <text
              x={GATE_AT[index] * width}
              y={14}
              textAnchor="middle"
              fill={`rgb(${CHAMPAGNE.join(" ")})`}
              fontSize={fontSize}
              fontWeight={500}
            >
              {t(key)}
            </text>
          </g>
        ))}
        <text x={inset} y={14} fill={`rgb(${CREAM.join(" ")})`} fontSize={fontSize} fontWeight={500} opacity={0.8}>
          {t("diagramIn")}
        </text>
        <text
          data-production
          x={width - inset}
          y={width < 700 ? height - 8 : 14}
          textAnchor="end"
          fill={`rgb(${CHAMPAGNE.join(" ")})`}
          fontSize={fontSize}
          fontWeight={500}
        >
          {t("diagramOut")}
        </text>
      </svg>
    </div>
  )
}
