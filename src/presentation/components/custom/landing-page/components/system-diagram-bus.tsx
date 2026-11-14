import type { JSX } from "react"

import { useTranslations } from "use-intl/react"

import { DIAGRAM_COLOR, DIAGRAM_TEXT, type DiagramLayout, type DiagramPoint } from "~/src/data/system-diagram"

import { half } from "~/src/lib/numbers"

interface LegendProps {
  readonly at: DiagramPoint
  readonly fontSize: number
}

const CELL_CENTER = 0.5
const PLATFORM_TITLE_INSET = 0.5
const PLATFORM_INK = "#f5f0e4"
const PLATFORM_CELLS = ["observability", "delivery", "infra"] as const

const Platform = ({ layout }: { readonly layout: DiagramLayout }): JSX.Element => {
  const t = useTranslations("pages.landing.philosophy")

  const { font, platform } = layout

  const cellWidth = platform.width / PLATFORM_CELLS.length

  return (
    <g stroke="none">
      <rect fill={DIAGRAM_COLOR.emerald} height={platform.height} rx={3} width={platform.width} x={platform.x} y={platform.y} />
      {PLATFORM_CELLS.map((cell, index) => (
        <g key={cell} transform={`translate(${platform.x + cellWidth * (index + CELL_CENTER)} ${platform.y + half(platform.height)})`}>
          {index > 0 && (
            <line
              stroke={PLATFORM_INK}
              strokeOpacity={0.24}
              x1={-half(cellWidth)}
              x2={-half(cellWidth)}
              y1={-half(platform.height)}
              y2={half(platform.height)}
            />
          )}
          <text
            dominantBaseline="central"
            fill={PLATFORM_INK}
            fontSize={platform.hasSubs ? font.title - PLATFORM_TITLE_INSET : font.label}
            fontWeight={600}
            textAnchor="middle"
            y={platform.hasSubs ? -font.sub * DIAGRAM_TEXT.titleLift : 0}
          >
            {t(`platform.${cell}`)}
          </text>
          {platform.hasSubs && (
            <text
              dominantBaseline="central"
              fill={PLATFORM_INK}
              fillOpacity={0.78}
              fontSize={font.sub}
              textAnchor="middle"
              y={font.sub * DIAGRAM_TEXT.subDrop}
            >
              {t(`platform.${cell}Sub`)}
            </text>
          )}
        </g>
      ))}
    </g>
  )
}

const Legend = ({ at, fontSize }: LegendProps): JSX.Element => {
  const t = useTranslations("pages.landing.philosophy")

  return (
    <g className="text-[#0d1526]" fill="currentColor" fontSize={fontSize} stroke="none" transform={`translate(${at.x} ${at.y})`}>
      <line stroke="currentColor" strokeWidth={1.2} x1={0} x2={26} y1={0} y2={0} />
      <text dominantBaseline="central" fillOpacity={0.7} x={34}>
        {t("legend.sync")}
      </text>
      <line stroke={DIAGRAM_COLOR.emerald} strokeDasharray="3 4" strokeWidth={1.2} x1={150} x2={176} y1={0} y2={0} />
      <text dominantBaseline="central" fillOpacity={0.7} x={184}>
        {t("legend.async")}
      </text>
      <rect
        fill={DIAGRAM_COLOR.emerald}
        fillOpacity={0.055}
        height={14}
        rx={2}
        stroke={DIAGRAM_COLOR.emerald}
        strokeDasharray="3 3"
        strokeOpacity={0.5}
        width={26}
        x={300}
        y={-7}
      />
      <text dominantBaseline="central" fillOpacity={0.7} x={334}>
        {t("legend.boundary")}
      </text>
      <rect fill="none" height={14} rx={2} stroke="currentColor" strokeDasharray="3 3" strokeOpacity={0.62} width={26} x={486} y={-7} />
      <text dominantBaseline="central" fillOpacity={0.7} x={520}>
        {t("legend.external")}
      </text>
    </g>
  )
}

export const SystemDiagramBus = ({ layout }: { readonly layout: DiagramLayout }): JSX.Element => {
  const t = useTranslations("pages.landing.philosophy")

  const { font, legend, rail } = layout

  return (
    <g data-late stroke={DIAGRAM_COLOR.emerald} strokeLinecap="round">
      {layout.stubs.map((stub) => (
        <line
          key={`${stub.x1}-${stub.y1}`}
          markerEnd={stub.y1 === rail.y ? "url(#system-diagram-event)" : undefined}
          strokeDasharray="3 4"
          strokeWidth={1.2}
          x1={stub.x1}
          x2={stub.x2}
          y1={stub.y1}
          y2={stub.y2}
        />
      ))}
      <line
        data-rail
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={0}
        strokeWidth={3}
        x1={rail.x1}
        x2={rail.x2}
        y1={rail.y}
        y2={rail.y}
      />
      <g
        fill={DIAGRAM_COLOR.emerald}
        fontSize={font.label}
        fontWeight={600}
        paintOrder="stroke"
        stroke={DIAGRAM_COLOR.board}
        strokeWidth={3.5}
        textAnchor="middle"
      >
        <text dominantBaseline="central" x={rail.label.x} y={rail.label.y}>
          {t("rail")}
        </text>
        {rail.sub !== undefined && (
          <text dominantBaseline="central" fontSize={font.sub} fontWeight={400} x={rail.sub.x} y={rail.sub.y}>
            {t("railSub")}
          </text>
        )}
      </g>
      <Platform layout={layout} />
      {legend !== undefined && <Legend at={legend} fontSize={font.label} />}
    </g>
  )
}
