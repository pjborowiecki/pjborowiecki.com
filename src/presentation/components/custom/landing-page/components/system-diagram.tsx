import { type JSX, type Ref, useImperativeHandle, useLayoutEffect, useRef, useState } from "react"

import { useTranslations } from "use-intl/react"

import {
  DIAGRAM_COLOR,
  DIAGRAM_FLOW_TONE,
  DIAGRAM_LAYOUT,
  DIAGRAM_NODE_IDS,
  DIAGRAM_TANGLE_EDGES,
  type DiagramLayout,
  type DiagramLayoutName,
  type DiagramState,
  type SystemDiagramHandle,
} from "~/src/data/system-diagram"
import { DIAGRAM_LAYOUTS } from "~/src/data/system-diagram-layouts"

import { applyDiagramState, createDiagramFrame, resetDiagramFrame, watchDiagramVisibility } from "~/src/lib/system-diagram-frame"
import { type CoreGeometry, DIAGRAM_GEOMETRY, formatCubicPath } from "~/src/lib/system-diagram-geometry"

import { SystemDiagramBus } from "~/src/presentation/components/custom/landing-page/components/system-diagram-bus"
import { SystemDiagramFindings } from "~/src/presentation/components/custom/landing-page/components/system-diagram-findings"
import { SystemDiagramNode } from "~/src/presentation/components/custom/landing-page/components/system-diagram-node"

interface SystemDiagramProps {
  readonly className?: string
  readonly ref?: Ref<SystemDiagramHandle>
}

const TALL_QUERY = "(max-width: 767px)"
const GRID_DOTS_ACROSS = 50
const GRID_BLEED = { left: -20, top: 20, width: 40 } as const

const Markers = ({ layout }: { readonly layout: DiagramLayout }): JSX.Element => (
  <defs>
    <pattern
      height={layout.width / GRID_DOTS_ACROSS}
      id="system-diagram-grid"
      patternUnits="userSpaceOnUse"
      width={layout.width / GRID_DOTS_ACROSS}
    >
      <circle cx={1} cy={1} fill="currentColor" fillOpacity={0.14} r={0.8} />
    </pattern>
    <marker id="system-diagram-arrow" markerHeight={7} markerWidth={7} orient="auto-start-reverse" refX={7} refY={4} viewBox="0 0 8 8">
      <path d="M1 1L7 4L1 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} />
    </marker>
    <marker id="system-diagram-event" markerHeight={7} markerWidth={7} orient="auto-start-reverse" refX={7} refY={4} viewBox="0 0 8 8">
      <path d="M1 1L7 4L1 7" fill="none" stroke={DIAGRAM_COLOR.emerald} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} />
    </marker>
  </defs>
)

const Structure = ({ layout }: { readonly layout: DiagramLayout }): JSX.Element => {
  const t = useTranslations("pages.landing.philosophy")

  return (
    <g data-structure>
      {layout.dividers.map(({ y }) => (
        <line key={y} stroke="currentColor" strokeOpacity={0.09} x1={0} x2={layout.width} y1={y} y2={y} />
      ))}
      {layout.rows.map((row) => (
        <text
          dominantBaseline="central"
          fill="currentColor"
          fillOpacity={0.58}
          fontSize={layout.font.label}
          fontWeight={500}
          key={row.key}
          x={0}
          y={row.y}
        >
          {t(`rows.${row.key}`)}
        </text>
      ))}
      {layout.zones.map((zone) => (
        <rect
          fill={DIAGRAM_COLOR.emerald}
          fillOpacity={0.055}
          height={zone.height}
          key={`${zone.x}-${zone.y}`}
          rx={5}
          stroke={DIAGRAM_COLOR.emerald}
          strokeDasharray="4 4"
          strokeOpacity={0.42}
          width={zone.width}
          x={zone.x}
          y={zone.y}
        />
      ))}
    </g>
  )
}

const Edges = ({ geometry }: { readonly geometry: readonly CoreGeometry[] }): JSX.Element => (
  <g fill="none" stroke="currentColor" strokeLinecap="round">
    <g stroke={DIAGRAM_COLOR.signal} strokeOpacity={0.82} strokeWidth={1.15}>
      {DIAGRAM_TANGLE_EDGES.map((edge, index) => (
        <path data-tangle={index} key={`${edge.from}-${edge.to}`} opacity={0} pathLength={1} strokeDasharray="1 1" strokeDashoffset={0} />
      ))}
    </g>
    <g strokeWidth={1.2}>
      {geometry.map(({ edge, straight }, index) => (
        <path
          d={formatCubicPath(straight)}
          data-core={index}
          key={`${edge.from}-${edge.to}`}
          markerEnd="url(#system-diagram-arrow)"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={0}
        />
      ))}
    </g>
  </g>
)

const Packets = ({ layout }: { readonly layout: DiagramLayout }): JSX.Element => (
  <g data-flow opacity={1} style={{ opacity: 0 }}>
    {layout.flows.map((flow) => {
      const motion = `M${flow.points.map((point) => `${point.x} ${point.y}`).join("L")}`

      return (
        <circle
          fill={flow.tone === DIAGRAM_FLOW_TONE.EMERALD ? DIAGRAM_COLOR.emerald : "currentColor"}
          key={motion}
          r={layout.packetRadius}
        >
          <animateMotion dur={`${flow.duration}s`} path={motion} repeatCount="indefinite" />
          <animate attributeName="opacity" dur={`${flow.duration}s`} keyTimes="0;0.06;0.9;1" repeatCount="indefinite" values="0;1;1;0" />
        </circle>
      )
    })}
  </g>
)

export const SystemDiagram = ({ className, ref }: SystemDiagramProps): JSX.Element => {
  const t = useTranslations("pages.landing.philosophy")
  const svgRef = useRef<SVGSVGElement>(null)
  const frameRef = useRef(createDiagramFrame())

  const [layoutName, setLayoutName] = useState<DiagramLayoutName>(DIAGRAM_LAYOUT.WIDE)

  const apply = (state: DiagramState): void => {
    const svg = svgRef.current

    frameRef.current.state = state

    if (svg) {
      applyDiagramState(svg, frameRef.current, state)
    }
  }

  useImperativeHandle(ref, () => ({ update: apply }))

  useLayoutEffect(() => {
    const query = globalThis.matchMedia(TALL_QUERY)
    const sync = (): void => {
      setLayoutName(query.matches ? DIAGRAM_LAYOUT.TALL : DIAGRAM_LAYOUT.WIDE)
    }

    sync()
    query.addEventListener("change", sync)

    return () => {
      query.removeEventListener("change", sync)
    }
  }, [])

  useLayoutEffect(() => {
    resetDiagramFrame(frameRef.current, layoutName)
  }, [layoutName])

  useLayoutEffect(() => {
    apply(frameRef.current.state)
  })

  useLayoutEffect(() => {
    const svg = svgRef.current

    if (!svg) {
      return
    }

    return watchDiagramVisibility(svg, frameRef.current)
  })

  const layout = DIAGRAM_LAYOUTS[layoutName]

  return (
    <svg
      aria-labelledby="system-diagram-title"
      className={className}
      ref={svgRef}
      role="img"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
    >
      <title id="system-diagram-title">{t("diagramTitle")}</title>
      <Markers layout={layout} />
      <rect
        data-grid
        fill="url(#system-diagram-grid)"
        height={layout.height - GRID_BLEED.top}
        width={layout.width + GRID_BLEED.width}
        x={GRID_BLEED.left}
        y={GRID_BLEED.top}
      />
      <Structure layout={layout} />
      <Edges geometry={DIAGRAM_GEOMETRY[layoutName]} />
      <SystemDiagramBus layout={layout} />
      <Packets layout={layout} />
      {DIAGRAM_NODE_IDS.map((id) => (
        <SystemDiagramNode id={id} key={id} layout={layout} />
      ))}
      <SystemDiagramFindings layout={layout} />
    </svg>
  )
}
