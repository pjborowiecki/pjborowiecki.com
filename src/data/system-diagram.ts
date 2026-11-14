export interface DiagramState {
  bus: number
  draw: number
  order: number
}

export interface SystemDiagramHandle {
  readonly update: (state: DiagramState) => void
}

export const DIAGRAM_LAYOUT = {
  TALL: "tall",
  WIDE: "wide",
} as const

export type DiagramLayoutName = (typeof DIAGRAM_LAYOUT)[keyof typeof DIAGRAM_LAYOUT]

export const DIAGRAM_NODE = {
  AI: "ai",
  ANALYTICS: "analytics",
  CATALOG: "catalog",
  CDN: "cdn",
  CRON: "cron",
  CSV: "csv",
  DB_CATALOG: "dbCatalog",
  DB_IDENTITY: "dbIdentity",
  DB_ORDERS: "dbOrders",
  DB_PAYMENTS: "dbPayments",
  DB_VECTORS: "dbVectors",
  GATEWAY: "gateway",
  IDENTITY: "identity",
  LEGACY: "legacy",
  LLM: "llm",
  MOBILE: "mobile",
  NOTIFICATIONS: "notifications",
  ORDERS: "orders",
  PARTNERS: "partners",
  PAYMENTS: "payments",
  PSP: "psp",
  SEARCH: "search",
  SHARED: "shared",
  WEB: "web",
} as const

export type DiagramNodeId = (typeof DIAGRAM_NODE)[keyof typeof DIAGRAM_NODE]

export const DIAGRAM_NODE_IDS = [
  DIAGRAM_NODE.WEB,
  DIAGRAM_NODE.MOBILE,
  DIAGRAM_NODE.PARTNERS,
  DIAGRAM_NODE.CDN,
  DIAGRAM_NODE.GATEWAY,
  DIAGRAM_NODE.IDENTITY,
  DIAGRAM_NODE.ORDERS,
  DIAGRAM_NODE.PAYMENTS,
  DIAGRAM_NODE.CATALOG,
  DIAGRAM_NODE.AI,
  DIAGRAM_NODE.DB_IDENTITY,
  DIAGRAM_NODE.DB_ORDERS,
  DIAGRAM_NODE.DB_PAYMENTS,
  DIAGRAM_NODE.DB_CATALOG,
  DIAGRAM_NODE.DB_VECTORS,
  DIAGRAM_NODE.NOTIFICATIONS,
  DIAGRAM_NODE.ANALYTICS,
  DIAGRAM_NODE.PSP,
  DIAGRAM_NODE.SEARCH,
  DIAGRAM_NODE.LLM,
  DIAGRAM_NODE.SHARED,
  DIAGRAM_NODE.LEGACY,
  DIAGRAM_NODE.CRON,
  DIAGRAM_NODE.CSV,
] as const

export const DIAGRAM_NODE_KIND = {
  BOX: "box",
  EXTERNAL: "external",
  HOTSPOT: "hotspot",
  SCRAP: "scrap",
  STORE: "store",
} as const

export type DiagramNodeKind = (typeof DIAGRAM_NODE_KIND)[keyof typeof DIAGRAM_NODE_KIND]

export interface DiagramNodeSpec {
  readonly born?: number
  readonly dies?: number
  readonly hasSub?: boolean
  readonly kind: DiagramNodeKind
}

const STORES_SPLIT_AT = 0.03

export const DIAGRAM_NODES: Readonly<Record<DiagramNodeId, DiagramNodeSpec>> = {
  ai: { born: 0.52, hasSub: true, kind: DIAGRAM_NODE_KIND.BOX },
  analytics: { hasSub: true, kind: DIAGRAM_NODE_KIND.BOX },
  catalog: { hasSub: true, kind: DIAGRAM_NODE_KIND.BOX },
  cdn: { hasSub: true, kind: DIAGRAM_NODE_KIND.BOX },
  cron: { dies: 0.3, kind: DIAGRAM_NODE_KIND.SCRAP },
  csv: { dies: 0.25, kind: DIAGRAM_NODE_KIND.SCRAP },
  dbCatalog: { born: STORES_SPLIT_AT, kind: DIAGRAM_NODE_KIND.STORE },
  dbIdentity: { born: STORES_SPLIT_AT, kind: DIAGRAM_NODE_KIND.STORE },
  dbOrders: { born: STORES_SPLIT_AT, kind: DIAGRAM_NODE_KIND.STORE },
  dbPayments: { born: STORES_SPLIT_AT, kind: DIAGRAM_NODE_KIND.STORE },
  dbVectors: { born: 0.56, kind: DIAGRAM_NODE_KIND.STORE },
  gateway: { born: 0.4, hasSub: true, kind: DIAGRAM_NODE_KIND.BOX },
  identity: { hasSub: true, kind: DIAGRAM_NODE_KIND.BOX },
  legacy: { dies: 0.2, kind: DIAGRAM_NODE_KIND.SCRAP },
  llm: { hasSub: true, kind: DIAGRAM_NODE_KIND.EXTERNAL },
  mobile: { hasSub: true, kind: DIAGRAM_NODE_KIND.BOX },
  notifications: { hasSub: true, kind: DIAGRAM_NODE_KIND.BOX },
  orders: { hasSub: true, kind: DIAGRAM_NODE_KIND.BOX },
  partners: { hasSub: true, kind: DIAGRAM_NODE_KIND.BOX },
  payments: { hasSub: true, kind: DIAGRAM_NODE_KIND.BOX },
  psp: { hasSub: true, kind: DIAGRAM_NODE_KIND.EXTERNAL },
  search: { hasSub: true, kind: DIAGRAM_NODE_KIND.BOX },
  shared: { dies: STORES_SPLIT_AT, kind: DIAGRAM_NODE_KIND.HOTSPOT },
  web: { hasSub: true, kind: DIAGRAM_NODE_KIND.BOX },
}

interface DiagramLink {
  readonly from: DiagramNodeId
  readonly to: DiagramNodeId
}

export const DIAGRAM_TANGLE_EDGES: readonly DiagramLink[] = [
  { from: DIAGRAM_NODE.NOTIFICATIONS, to: DIAGRAM_NODE.SHARED },
  { from: DIAGRAM_NODE.ANALYTICS, to: DIAGRAM_NODE.SHARED },
  { from: DIAGRAM_NODE.SEARCH, to: DIAGRAM_NODE.SHARED },
  { from: DIAGRAM_NODE.LEGACY, to: DIAGRAM_NODE.SHARED },
  { from: DIAGRAM_NODE.CRON, to: DIAGRAM_NODE.SHARED },
  { from: DIAGRAM_NODE.CSV, to: DIAGRAM_NODE.SHARED },
  { from: DIAGRAM_NODE.ORDERS, to: DIAGRAM_NODE.PAYMENTS },
  { from: DIAGRAM_NODE.PAYMENTS, to: DIAGRAM_NODE.ORDERS },
  { from: DIAGRAM_NODE.CATALOG, to: DIAGRAM_NODE.ORDERS },
  { from: DIAGRAM_NODE.IDENTITY, to: DIAGRAM_NODE.CATALOG },
  { from: DIAGRAM_NODE.MOBILE, to: DIAGRAM_NODE.IDENTITY },
  { from: DIAGRAM_NODE.WEB, to: DIAGRAM_NODE.ORDERS },
  { from: DIAGRAM_NODE.PARTNERS, to: DIAGRAM_NODE.CATALOG },
  { from: DIAGRAM_NODE.WEB, to: DIAGRAM_NODE.CATALOG },
  { from: DIAGRAM_NODE.ORDERS, to: DIAGRAM_NODE.LLM },
  { from: DIAGRAM_NODE.CATALOG, to: DIAGRAM_NODE.LLM },
  { from: DIAGRAM_NODE.IDENTITY, to: DIAGRAM_NODE.LLM },
  { from: DIAGRAM_NODE.CRON, to: DIAGRAM_NODE.ORDERS },
  { from: DIAGRAM_NODE.LEGACY, to: DIAGRAM_NODE.PAYMENTS },
  { from: DIAGRAM_NODE.CSV, to: DIAGRAM_NODE.ANALYTICS },
  { from: DIAGRAM_NODE.NOTIFICATIONS, to: DIAGRAM_NODE.ORDERS },
  { from: DIAGRAM_NODE.SEARCH, to: DIAGRAM_NODE.CATALOG },
]

const DIAGRAM_FINDING = {
  BOUNDARY: "boundary",
  CRON: "cron",
  CYCLE: "cycle",
  LLM: "llm",
  OWNER: "owner",
  SHARED: "shared",
  TRACE: "trace",
} as const

export type DiagramFindingKey = (typeof DIAGRAM_FINDING)[keyof typeof DIAGRAM_FINDING]

export const DIAGRAM_FINDING_KEYS = [
  DIAGRAM_FINDING.SHARED,
  DIAGRAM_FINDING.BOUNDARY,
  DIAGRAM_FINDING.CYCLE,
  DIAGRAM_FINDING.LLM,
  DIAGRAM_FINDING.OWNER,
  DIAGRAM_FINDING.CRON,
  DIAGRAM_FINDING.TRACE,
] as const

export const DIAGRAM_FINDING_CLOSES: Readonly<Record<DiagramFindingKey, number>> = {
  boundary: 0.42,
  cron: 0.3,
  cycle: 0.24,
  llm: 0.54,
  owner: 0.34,
  shared: 0.1,
  trace: 2,
}

export const DIAGRAM_FLOW_TONE = {
  EMERALD: "emerald",
  INK: "ink",
} as const

type DiagramFlowTone = (typeof DIAGRAM_FLOW_TONE)[keyof typeof DIAGRAM_FLOW_TONE]

export const DIAGRAM_COLOR = {
  board: "var(--board)",
  card: "#fbf8f0",
  emerald: "#0a6247",
  signal: "var(--signal)",
} as const

export const DIAGRAM_TEXT = {
  subDrop: 0.92,
  titleLift: 0.62,
} as const

export const DIAGRAM_STATUS_LABEL_X = 14

export interface DiagramPoint {
  readonly x: number
  readonly y: number
}

export type DiagramRoute = readonly [DiagramPoint, DiagramPoint, ...DiagramPoint[]]

export interface DiagramTanglePoint extends DiagramPoint {
  readonly rotate: number
}

interface DiagramBox {
  readonly height: number
  readonly width: number
  readonly x: number
  readonly y: number
}

interface DiagramSegment {
  readonly x1: number
  readonly x2: number
  readonly y1: number
  readonly y2: number
}

export interface DiagramCoreEdge extends DiagramLink {
  readonly born?: number
  readonly route: DiagramRoute
}

interface DiagramFlow {
  readonly duration: number
  readonly points: readonly DiagramPoint[]
  readonly tone: DiagramFlowTone
}

export interface DiagramNodePlacement {
  readonly at: DiagramPoint
  readonly tangle: DiagramTanglePoint
  readonly width?: number
}

export interface DiagramLayout {
  readonly core: readonly DiagramCoreEdge[]
  readonly dividers: readonly { readonly y: number }[]
  readonly findings: Readonly<Partial<Record<DiagramFindingKey, DiagramPoint>>>
  readonly flows: readonly DiagramFlow[]
  readonly font: { readonly finding: number; readonly label: number; readonly sub: number; readonly title: number }
  readonly height: number
  readonly legend?: DiagramPoint
  readonly node: { readonly height: number; readonly storeHeight: number; readonly width: number }
  readonly nodes: Readonly<Record<DiagramNodeId, DiagramNodePlacement>>
  readonly packetRadius: number
  readonly platform: DiagramBox & { readonly hasSubs: boolean }
  readonly rail: { readonly label: DiagramPoint; readonly sub?: DiagramPoint; readonly x1: number; readonly x2: number; readonly y: number }
  readonly rows: readonly { readonly key: string; readonly y: number }[]
  readonly status: { readonly gap: number; readonly y: number }
  readonly stubs: readonly DiagramSegment[]
  readonly width: number
  readonly zones: readonly DiagramBox[]
}
