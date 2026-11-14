import type { JSX } from "react"

import { useTranslations } from "use-intl/react"

import {
  DIAGRAM_COLOR,
  DIAGRAM_FINDING_KEYS,
  DIAGRAM_STATUS_LABEL_X,
  type DiagramFindingKey,
  type DiagramLayout,
  type DiagramPoint,
} from "~/src/data/system-diagram"

interface FindingMarkerProps {
  readonly at: DiagramPoint | undefined
  readonly findingKey: DiagramFindingKey
  readonly fontSize: number
  readonly ordinal: number
}

const FIRST_NUMBER = 1
const MARKER = { badge: 0.72, gap: 1.05, numeral: 0.82 } as const

const FindingMarker = ({ at, findingKey, fontSize, ordinal }: FindingMarkerProps): JSX.Element => {
  const t = useTranslations("pages.landing.philosophy")

  if (at === undefined) {
    return <g data-finding={findingKey} style={{ opacity: 0 }} />
  }

  return (
    <g data-finding={findingKey} style={{ opacity: 0 }} transform={`translate(${at.x} ${at.y})`}>
      <circle fill={DIAGRAM_COLOR.signal} r={fontSize * MARKER.badge} />
      <text dominantBaseline="central" fill={DIAGRAM_COLOR.card} fontSize={fontSize * MARKER.numeral} fontWeight={700} textAnchor="middle">
        {ordinal}
      </text>
      <text
        dominantBaseline="central"
        fill={DIAGRAM_COLOR.signal}
        fontSize={fontSize}
        fontWeight={600}
        paintOrder="stroke"
        stroke={DIAGRAM_COLOR.board}
        strokeWidth={4}
        x={fontSize * MARKER.gap}
      >
        {t(`findings.${findingKey}`)}
      </text>
    </g>
  )
}

export const SystemDiagramFindings = ({ layout }: { readonly layout: DiagramLayout }): JSX.Element => {
  const t = useTranslations("pages.landing.philosophy")

  const { findings, font, status } = layout

  return (
    <>
      {DIAGRAM_FINDING_KEYS.map((key, index) => (
        <FindingMarker at={findings[key]} findingKey={key} fontSize={font.finding} key={key} ordinal={index + FIRST_NUMBER} />
      ))}
      <g fontSize={font.label} fontWeight={600} transform={`translate(0 ${status.y})`}>
        <g data-status="from" style={{ opacity: 0 }}>
          <circle cx={4} fill={DIAGRAM_COLOR.signal} r={4} />
          <text dominantBaseline="central" fill={DIAGRAM_COLOR.signal} x={DIAGRAM_STATUS_LABEL_X}>
            {t("status.asIs")}
          </text>
        </g>
        <g data-status="to">
          <circle cx={4} fill={DIAGRAM_COLOR.emerald} r={4} />
          <text dominantBaseline="central" fill={DIAGRAM_COLOR.emerald} x={DIAGRAM_STATUS_LABEL_X}>
            {t("status.target")}
          </text>
        </g>
        <text data-status-count dominantBaseline="central" fill="currentColor" fillOpacity={0.72} fontWeight={500} x={status.gap}>
          {t("status.open")} <tspan data-finding-count>{0}</tspan>
        </text>
      </g>
    </>
  )
}
