import type { JSX } from "react"

import { useTranslations } from "use-intl/react"

import {
  DIAGRAM_COLOR,
  DIAGRAM_NODES,
  DIAGRAM_NODE_KIND,
  DIAGRAM_TEXT,
  type DiagramLayout,
  type DiagramNodeId,
  type DiagramNodeKind,
} from "~/src/data/system-diagram"

import { half } from "~/src/lib/numbers"

interface SystemDiagramNodeProps {
  readonly id: DiagramNodeId
  readonly layout: DiagramLayout
}

interface NodeBox {
  readonly halfHeight: number
  readonly halfWidth: number
  readonly height: number
  readonly kind: DiagramNodeKind
  readonly rim: number
  readonly width: number
}

const VISIBLE = 1
const RIM = { max: 6, ratio: 0.14 } as const
const SHADOW = { x: 2, y: 3 } as const

const CYLINDER = {
  hotspot: { fill: "#f9e9e0", stroke: DIAGRAM_COLOR.signal, strokeWidth: 1.7 },
  store: { fill: "#e7ead9", stroke: "currentColor", strokeWidth: 1.1 },
} as const

const OUTLINE_OPACITY = { box: 1, other: 0.62 } as const
const TITLE_OPACITY = { other: 1, scrap: 0.7 } as const

const Cylinder = ({ box }: { readonly box: NodeBox }): JSX.Element => {
  const { halfHeight, halfWidth, kind, rim } = box
  const style = kind === DIAGRAM_NODE_KIND.HOTSPOT ? CYLINDER.hotspot : CYLINDER.store

  return (
    <>
      <path
        d={`M${-halfWidth} ${-halfHeight + rim}A${halfWidth} ${rim} 0 0 1 ${halfWidth} ${-halfHeight + rim}V${halfHeight - rim}A${halfWidth} ${rim} 0 0 1 ${-halfWidth} ${halfHeight - rim}Z`}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
      />
      <path
        d={`M${-halfWidth} ${-halfHeight + rim}A${halfWidth} ${rim} 0 0 0 ${halfWidth} ${-halfHeight + rim}`}
        fill="none"
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
      />
    </>
  )
}

const Card = ({ box }: { readonly box: NodeBox }): JSX.Element => {
  const { halfHeight, halfWidth, height, kind, width } = box
  const isBox = kind === DIAGRAM_NODE_KIND.BOX

  return (
    <>
      {isBox && (
        <rect
          fill="currentColor"
          fillOpacity={0.1}
          height={height}
          rx={3}
          width={width}
          x={-halfWidth + SHADOW.x}
          y={-halfHeight + SHADOW.y}
        />
      )}
      <rect
        fill={isBox ? DIAGRAM_COLOR.card : DIAGRAM_COLOR.board}
        height={height}
        rx={3}
        stroke="currentColor"
        strokeDasharray={isBox ? undefined : "4 3"}
        strokeOpacity={isBox ? OUTLINE_OPACITY.box : OUTLINE_OPACITY.other}
        strokeWidth={1.1}
        width={width}
        x={-halfWidth}
        y={-halfHeight}
      />
    </>
  )
}

export const SystemDiagramNode = ({ id, layout }: SystemDiagramNodeProps): JSX.Element => {
  const t = useTranslations("pages.landing.philosophy")

  const { at, width = layout.node.width } = layout.nodes[id]
  const { dies, hasSub, kind } = DIAGRAM_NODES[id]

  const isCylinder = kind === DIAGRAM_NODE_KIND.STORE || kind === DIAGRAM_NODE_KIND.HOTSPOT
  const height = isCylinder ? layout.node.storeHeight : layout.node.height
  const box: NodeBox = {
    halfHeight: half(height),
    halfWidth: half(width),
    height,
    kind,
    rim: Math.min(RIM.max, height * RIM.ratio),
    width,
  }
  const sub = hasSub === true ? t(`subs.${id}`) : ""
  const isSubShown = sub !== "" && layout.font.sub > 0
  const subLift = isSubShown ? -layout.font.sub * DIAGRAM_TEXT.titleLift : 0
  const titleY = isCylinder ? half(box.rim) : subLift

  return (
    <g data-node={id} style={{ opacity: dies === undefined ? VISIBLE : 0 }} transform={`translate(${at.x} ${at.y})`}>
      {isCylinder && <Cylinder box={box} />}
      {!isCylinder && <Card box={box} />}
      <text
        dominantBaseline="central"
        fill={kind === DIAGRAM_NODE_KIND.HOTSPOT ? DIAGRAM_COLOR.signal : "currentColor"}
        fillOpacity={kind === DIAGRAM_NODE_KIND.SCRAP ? TITLE_OPACITY.scrap : TITLE_OPACITY.other}
        fontSize={layout.font.title}
        fontWeight={600}
        letterSpacing="-0.012em"
        textAnchor="middle"
        y={titleY}
      >
        {t(`nodes.${id}`)}
      </text>
      {isSubShown && (
        <text
          dominantBaseline="central"
          fill="currentColor"
          fillOpacity={0.62}
          fontSize={layout.font.sub}
          textAnchor="middle"
          y={layout.font.sub * DIAGRAM_TEXT.subDrop}
        >
          {sub}
        </text>
      )}
    </g>
  )
}
