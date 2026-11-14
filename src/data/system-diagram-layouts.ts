import {
  DIAGRAM_FLOW_TONE,
  DIAGRAM_NODE,
  type DiagramLayout,
  type DiagramLayoutName,
  type DiagramRoute,
  type DiagramTanglePoint,
} from "~/src/data/system-diagram"

const WIDE_COLUMN_1 = 179.2
const WIDE_COLUMN_2 = 361.6
const WIDE_COLUMN_3 = 544
const WIDE_COLUMN_4 = 726.4
const WIDE_COLUMN_5 = 908.8

const WIDE_COLUMNS = [WIDE_COLUMN_1, WIDE_COLUMN_2, WIDE_COLUMN_3, WIDE_COLUMN_4, WIDE_COLUMN_5] as const

const WIDE_HALF_ZONE = 85
const WIDE_ZONE_WIDTH = 170
const WIDE_NODE_HALF_WIDTH = 75
const WIDE_LANE_GAP = 6.2

const WIDE_SHARED_STORE: DiagramTanglePoint = { rotate: 0, x: 520, y: 318 }
const TALL_SHARED_STORE: DiagramTanglePoint = { rotate: 0, x: 220, y: 296 }

const placeSideLane = (column: number): number => column + WIDE_HALF_ZONE + WIDE_LANE_GAP

const placeSideExit = (column: number): number => column + WIDE_NODE_HALF_WIDTH

const fanOutFromGateway = (column: number): DiagramRoute => {
  if (column === WIDE_COLUMN_3) {
    return [
      { x: WIDE_COLUMN_3, y: 212 },
      { x: WIDE_COLUMN_3, y: 256 },
    ]
  }

  return [
    { x: WIDE_COLUMN_3, y: 212 },
    { x: WIDE_COLUMN_3, y: 232 },
    { x: column, y: 232 },
    { x: column, y: 256 },
  ]
}

const WIDE: DiagramLayout = {
  core: [
    {
      from: DIAGRAM_NODE.WEB,
      route: [
        { x: WIDE_COLUMN_2, y: 68 },
        { x: WIDE_COLUMN_2, y: 88 },
        { x: WIDE_COLUMN_3, y: 88 },
        { x: WIDE_COLUMN_3, y: 104 },
      ],
      to: DIAGRAM_NODE.CDN,
    },
    {
      from: DIAGRAM_NODE.MOBILE,
      route: [
        { x: WIDE_COLUMN_3, y: 68 },
        { x: WIDE_COLUMN_3, y: 104 },
      ],
      to: DIAGRAM_NODE.CDN,
    },
    {
      from: DIAGRAM_NODE.PARTNERS,
      route: [
        { x: WIDE_COLUMN_4, y: 68 },
        { x: WIDE_COLUMN_4, y: 88 },
        { x: WIDE_COLUMN_3, y: 88 },
        { x: WIDE_COLUMN_3, y: 104 },
      ],
      to: DIAGRAM_NODE.CDN,
    },
    {
      born: 0.42,
      from: DIAGRAM_NODE.CDN,
      route: [
        { x: WIDE_COLUMN_3, y: 148 },
        { x: WIDE_COLUMN_3, y: 168 },
      ],
      to: DIAGRAM_NODE.GATEWAY,
    },
    { born: 0.46, from: DIAGRAM_NODE.GATEWAY, route: fanOutFromGateway(WIDE_COLUMN_1), to: DIAGRAM_NODE.IDENTITY },
    { born: 0.49, from: DIAGRAM_NODE.GATEWAY, route: fanOutFromGateway(WIDE_COLUMN_2), to: DIAGRAM_NODE.ORDERS },
    { born: 0.46, from: DIAGRAM_NODE.GATEWAY, route: fanOutFromGateway(WIDE_COLUMN_3), to: DIAGRAM_NODE.PAYMENTS },
    { born: 0.49, from: DIAGRAM_NODE.GATEWAY, route: fanOutFromGateway(WIDE_COLUMN_4), to: DIAGRAM_NODE.CATALOG },
    { born: 0.54, from: DIAGRAM_NODE.GATEWAY, route: fanOutFromGateway(WIDE_COLUMN_5), to: DIAGRAM_NODE.AI },
    {
      from: DIAGRAM_NODE.IDENTITY,
      route: [
        { x: WIDE_COLUMN_1, y: 300 },
        { x: WIDE_COLUMN_1, y: 329 },
      ],
      to: DIAGRAM_NODE.DB_IDENTITY,
    },
    {
      from: DIAGRAM_NODE.ORDERS,
      route: [
        { x: WIDE_COLUMN_2, y: 300 },
        { x: WIDE_COLUMN_2, y: 329 },
      ],
      to: DIAGRAM_NODE.DB_ORDERS,
    },
    {
      from: DIAGRAM_NODE.PAYMENTS,
      route: [
        { x: WIDE_COLUMN_3, y: 300 },
        { x: WIDE_COLUMN_3, y: 329 },
      ],
      to: DIAGRAM_NODE.DB_PAYMENTS,
    },
    {
      from: DIAGRAM_NODE.CATALOG,
      route: [
        { x: WIDE_COLUMN_4, y: 300 },
        { x: WIDE_COLUMN_4, y: 329 },
      ],
      to: DIAGRAM_NODE.DB_CATALOG,
    },
    {
      born: 0.6,
      from: DIAGRAM_NODE.AI,
      route: [
        { x: WIDE_COLUMN_5, y: 300 },
        { x: WIDE_COLUMN_5, y: 329 },
      ],
      to: DIAGRAM_NODE.DB_VECTORS,
    },
    {
      from: DIAGRAM_NODE.PAYMENTS,
      route: [
        { x: placeSideExit(WIDE_COLUMN_3), y: 278 },
        { x: placeSideLane(WIDE_COLUMN_3), y: 278 },
        { x: placeSideLane(WIDE_COLUMN_3), y: 456 },
        { x: WIDE_COLUMN_3, y: 456 },
        { x: WIDE_COLUMN_3, y: 472 },
      ],
      to: DIAGRAM_NODE.PSP,
    },
    {
      born: 0.62,
      from: DIAGRAM_NODE.AI,
      route: [
        { x: placeSideExit(WIDE_COLUMN_5), y: 278 },
        { x: placeSideLane(WIDE_COLUMN_5), y: 278 },
        { x: placeSideLane(WIDE_COLUMN_5), y: 456 },
        { x: WIDE_COLUMN_5, y: 456 },
        { x: WIDE_COLUMN_5, y: 472 },
      ],
      to: DIAGRAM_NODE.LLM,
    },
  ],
  dividers: [{ y: 96 }, { y: 224 }, { y: 408 }, { y: 462 }, { y: 532 }],
  findings: {
    boundary: { x: 636, y: 128 },
    cron: { x: 468, y: 158 },
    cycle: { x: 448, y: 462 },
    llm: { x: 62, y: 240 },
    owner: { x: 800, y: 310 },
    shared: { x: 520, y: 366 },
    trace: { x: 744, y: 584 },
  },
  flows: [
    {
      duration: 6.4,
      points: [
        { x: WIDE_COLUMN_2, y: 68 },
        { x: WIDE_COLUMN_2, y: 88 },
        { x: WIDE_COLUMN_3, y: 88 },
        { x: WIDE_COLUMN_3, y: 232 },
        { x: WIDE_COLUMN_2, y: 232 },
        { x: WIDE_COLUMN_2, y: 329 },
      ],
      tone: DIAGRAM_FLOW_TONE.INK,
    },
    {
      duration: 7.6,
      points: [
        { x: WIDE_COLUMN_3, y: 68 },
        { x: WIDE_COLUMN_3, y: 278 },
        { x: placeSideLane(WIDE_COLUMN_3), y: 278 },
        { x: placeSideLane(WIDE_COLUMN_3), y: 456 },
        { x: WIDE_COLUMN_3, y: 456 },
        { x: WIDE_COLUMN_3, y: 472 },
      ],
      tone: DIAGRAM_FLOW_TONE.INK,
    },
    {
      duration: 8.8,
      points: [
        { x: WIDE_COLUMN_4, y: 68 },
        { x: WIDE_COLUMN_4, y: 88 },
        { x: WIDE_COLUMN_3, y: 88 },
        { x: WIDE_COLUMN_3, y: 232 },
        { x: WIDE_COLUMN_5, y: 232 },
        { x: WIDE_COLUMN_5, y: 278 },
        { x: placeSideLane(WIDE_COLUMN_5), y: 278 },
        { x: placeSideLane(WIDE_COLUMN_5), y: 456 },
        { x: WIDE_COLUMN_5, y: 456 },
        { x: WIDE_COLUMN_5, y: 472 },
      ],
      tone: DIAGRAM_FLOW_TONE.INK,
    },
    {
      duration: 5.2,
      points: [
        { x: WIDE_COLUMN_2, y: 396 },
        { x: WIDE_COLUMN_2, y: 434 },
        { x: WIDE_COLUMN_1, y: 434 },
        { x: WIDE_COLUMN_1, y: 472 },
      ],
      tone: DIAGRAM_FLOW_TONE.EMERALD,
    },
    {
      duration: 4.4,
      points: [
        { x: WIDE_COLUMN_4, y: 396 },
        { x: WIDE_COLUMN_4, y: 472 },
      ],
      tone: DIAGRAM_FLOW_TONE.EMERALD,
    },
    {
      duration: 6,
      points: [
        { x: WIDE_COLUMN_3, y: 396 },
        { x: WIDE_COLUMN_3, y: 434 },
        { x: WIDE_COLUMN_2, y: 434 },
        { x: WIDE_COLUMN_2, y: 472 },
      ],
      tone: DIAGRAM_FLOW_TONE.EMERALD,
    },
  ],
  font: { finding: 13, label: 12.5, sub: 11, title: 15 },
  height: 640,
  legend: { x: 94, y: 624 },
  node: { height: 44, storeHeight: 50, width: 150 },
  nodes: {
    ai: { at: { x: WIDE_COLUMN_5, y: 278 }, tangle: { rotate: 0, x: WIDE_COLUMN_5, y: 278 } },
    analytics: { at: { x: WIDE_COLUMN_2, y: 494 }, tangle: { rotate: 1.5, x: 918, y: 408 } },
    catalog: { at: { x: WIDE_COLUMN_4, y: 278 }, tangle: { rotate: -1.5, x: 336, y: 208 } },
    cdn: { at: { x: WIDE_COLUMN_3, y: 126 }, tangle: { rotate: 1.5, x: 352, y: 40 }, width: 240 },
    cron: { at: { x: 556, y: 112 }, tangle: { rotate: -1.5, x: 556, y: 112 } },
    csv: { at: { x: 924, y: 256 }, tangle: { rotate: -2, x: 924, y: 256 } },
    dbCatalog: { at: { x: WIDE_COLUMN_4, y: 354 }, tangle: WIDE_SHARED_STORE },
    dbIdentity: { at: { x: WIDE_COLUMN_1, y: 354 }, tangle: WIDE_SHARED_STORE },
    dbOrders: { at: { x: WIDE_COLUMN_2, y: 354 }, tangle: WIDE_SHARED_STORE },
    dbPayments: { at: { x: WIDE_COLUMN_3, y: 354 }, tangle: WIDE_SHARED_STORE },
    dbVectors: { at: { x: WIDE_COLUMN_5, y: 354 }, tangle: { rotate: 0, x: WIDE_COLUMN_5, y: 354 } },
    gateway: { at: { x: WIDE_COLUMN_3, y: 190 }, tangle: { rotate: 0, x: WIDE_COLUMN_3, y: 190 }, width: 240 },
    identity: { at: { x: WIDE_COLUMN_1, y: 278 }, tangle: { rotate: 1.5, x: 728, y: 196 } },
    legacy: { at: { x: 100, y: 178 }, tangle: { rotate: 2, x: 100, y: 178 } },
    llm: { at: { x: WIDE_COLUMN_5, y: 494 }, tangle: { rotate: -1.5, x: 116, y: 292 } },
    mobile: { at: { x: WIDE_COLUMN_3, y: 46 }, tangle: { rotate: -2, x: 918, y: 118 } },
    notifications: { at: { x: WIDE_COLUMN_1, y: 494 }, tangle: { rotate: -1.5, x: 392, y: 560 } },
    orders: { at: { x: WIDE_COLUMN_2, y: 278 }, tangle: { rotate: -2, x: 760, y: 372 } },
    partners: { at: { x: WIDE_COLUMN_4, y: 46 }, tangle: { rotate: -2, x: 134, y: 54 } },
    payments: { at: { x: WIDE_COLUMN_3, y: 278 }, tangle: { rotate: 2, x: 156, y: 500 } },
    psp: { at: { x: WIDE_COLUMN_3, y: 494 }, tangle: { rotate: 1.5, x: 656, y: 530 } },
    search: { at: { x: WIDE_COLUMN_4, y: 494 }, tangle: { rotate: 2, x: 118, y: 408 } },
    shared: { at: { x: 520, y: 318 }, tangle: WIDE_SHARED_STORE, width: 190 },
    web: { at: { x: WIDE_COLUMN_2, y: 46 }, tangle: { rotate: 2, x: 742, y: 44 } },
  },
  packetRadius: 3.6,
  platform: { hasSubs: true, height: 44, width: 900, x: 94, y: 546 },
  rail: { label: { x: 270, y: 420 }, sub: { x: 452.8, y: 420 }, x1: 94, x2: 994, y: 434 },
  rows: [
    { key: "clients", y: 46 },
    { key: "edge", y: 158 },
    { key: "domains", y: 320 },
    { key: "events", y: 434 },
    { key: "downstream", y: 494 },
    { key: "platform", y: 568 },
  ],
  status: { gap: 112, y: 8 },
  stubs: [
    ...WIDE_COLUMNS.map((column) => ({ x1: column, x2: column, y1: 396, y2: 434 })),
    { x1: WIDE_COLUMN_1, x2: WIDE_COLUMN_1, y1: 434, y2: 472 },
    { x1: WIDE_COLUMN_2, x2: WIDE_COLUMN_2, y1: 434, y2: 472 },
    { x1: WIDE_COLUMN_4, x2: WIDE_COLUMN_4, y1: 434, y2: 472 },
  ],
  width: 1000,
  zones: WIDE_COLUMNS.map((column) => ({ height: 152, width: WIDE_ZONE_WIDTH, x: column - WIDE_HALF_ZONE, y: 244 })),
}

const TALL: DiagramLayout = {
  core: [
    {
      from: DIAGRAM_NODE.WEB,
      route: [
        { x: 76, y: 59 },
        { x: 76, y: 70 },
        { x: 220, y: 70 },
        { x: 220, y: 79 },
      ],
      to: DIAGRAM_NODE.CDN,
    },
    {
      from: DIAGRAM_NODE.MOBILE,
      route: [
        { x: 220, y: 59 },
        { x: 220, y: 79 },
      ],
      to: DIAGRAM_NODE.CDN,
    },
    {
      from: DIAGRAM_NODE.PARTNERS,
      route: [
        { x: 364, y: 59 },
        { x: 364, y: 70 },
        { x: 220, y: 70 },
        { x: 220, y: 79 },
      ],
      to: DIAGRAM_NODE.CDN,
    },
    {
      born: 0.42,
      from: DIAGRAM_NODE.CDN,
      route: [
        { x: 220, y: 113 },
        { x: 220, y: 127 },
      ],
      to: DIAGRAM_NODE.GATEWAY,
    },
    {
      born: 0.46,
      from: DIAGRAM_NODE.GATEWAY,
      route: [
        { x: 220, y: 161 },
        { x: 220, y: 172 },
        { x: 76, y: 172 },
        { x: 76, y: 189 },
      ],
      to: DIAGRAM_NODE.IDENTITY,
    },
    {
      born: 0.46,
      from: DIAGRAM_NODE.GATEWAY,
      route: [
        { x: 220, y: 161 },
        { x: 220, y: 189 },
      ],
      to: DIAGRAM_NODE.ORDERS,
    },
    {
      born: 0.46,
      from: DIAGRAM_NODE.GATEWAY,
      route: [
        { x: 220, y: 161 },
        { x: 220, y: 172 },
        { x: 364, y: 172 },
        { x: 364, y: 189 },
      ],
      to: DIAGRAM_NODE.PAYMENTS,
    },
    {
      born: 0.49,
      from: DIAGRAM_NODE.GATEWAY,
      route: [
        { x: 220, y: 161 },
        { x: 220, y: 172 },
        { x: 148, y: 172 },
        { x: 148, y: 299 },
      ],
      to: DIAGRAM_NODE.CATALOG,
    },
    {
      born: 0.54,
      from: DIAGRAM_NODE.GATEWAY,
      route: [
        { x: 220, y: 161 },
        { x: 220, y: 172 },
        { x: 292, y: 172 },
        { x: 292, y: 299 },
      ],
      to: DIAGRAM_NODE.AI,
    },
    {
      from: DIAGRAM_NODE.IDENTITY,
      route: [
        { x: 76, y: 223 },
        { x: 76, y: 235 },
      ],
      to: DIAGRAM_NODE.DB_IDENTITY,
    },
    {
      from: DIAGRAM_NODE.ORDERS,
      route: [
        { x: 220, y: 223 },
        { x: 220, y: 235 },
      ],
      to: DIAGRAM_NODE.DB_ORDERS,
    },
    {
      from: DIAGRAM_NODE.PAYMENTS,
      route: [
        { x: 364, y: 223 },
        { x: 364, y: 235 },
      ],
      to: DIAGRAM_NODE.DB_PAYMENTS,
    },
    {
      from: DIAGRAM_NODE.CATALOG,
      route: [
        { x: 148, y: 333 },
        { x: 148, y: 345 },
      ],
      to: DIAGRAM_NODE.DB_CATALOG,
    },
    {
      born: 0.6,
      from: DIAGRAM_NODE.AI,
      route: [
        { x: 292, y: 333 },
        { x: 292, y: 345 },
      ],
      to: DIAGRAM_NODE.DB_VECTORS,
    },
    {
      from: DIAGRAM_NODE.PAYMENTS,
      route: [
        { x: 428, y: 206 },
        { x: 437, y: 206 },
        { x: 437, y: 496 },
        { x: 428, y: 496 },
      ],
      to: DIAGRAM_NODE.PSP,
    },
    {
      born: 0.62,
      from: DIAGRAM_NODE.AI,
      route: [
        { x: 292, y: 384 },
        { x: 292, y: 472 },
        { x: 148, y: 472 },
        { x: 148, y: 479 },
      ],
      to: DIAGRAM_NODE.LLM,
    },
  ],
  dividers: [],
  findings: {
    cycle: { x: 216, y: 456 },
    llm: { x: 8, y: 268 },
    shared: { x: 220, y: 332 },
  },
  flows: [
    {
      duration: 6,
      points: [
        { x: 220, y: 59 },
        { x: 220, y: 172 },
        { x: 76, y: 172 },
        { x: 76, y: 235 },
      ],
      tone: DIAGRAM_FLOW_TONE.INK,
    },
    {
      duration: 7.2,
      points: [
        { x: 364, y: 59 },
        { x: 364, y: 70 },
        { x: 220, y: 70 },
        { x: 220, y: 172 },
        { x: 292, y: 172 },
        { x: 292, y: 384 },
        { x: 292, y: 472 },
        { x: 148, y: 472 },
        { x: 148, y: 479 },
      ],
      tone: DIAGRAM_FLOW_TONE.INK,
    },
    {
      duration: 4.8,
      points: [
        { x: 220, y: 274 },
        { x: 220, y: 406 },
        { x: 76, y: 406 },
        { x: 76, y: 431 },
      ],
      tone: DIAGRAM_FLOW_TONE.EMERALD,
    },
    {
      duration: 4.2,
      points: [
        { x: 148, y: 384 },
        { x: 148, y: 406 },
        { x: 364, y: 406 },
        { x: 364, y: 431 },
      ],
      tone: DIAGRAM_FLOW_TONE.EMERALD,
    },
  ],
  font: { finding: 11.5, label: 11.5, sub: 0, title: 13 },
  height: 566,
  node: { height: 34, storeHeight: 34, width: 128 },
  nodes: {
    ai: { at: { x: 292, y: 316 }, tangle: { rotate: 0, x: 292, y: 316 } },
    analytics: { at: { x: 220, y: 448 }, tangle: { rotate: 1.5, x: 368, y: 306 } },
    catalog: { at: { x: 148, y: 316 }, tangle: { rotate: -1.5, x: 208, y: 182 } },
    cdn: { at: { x: 220, y: 96 }, tangle: { rotate: 1.5, x: 226, y: 70 }, width: 200 },
    cron: { at: { x: 224, y: 122 }, tangle: { rotate: -1.5, x: 224, y: 122 } },
    csv: { at: { x: 226, y: 400 }, tangle: { rotate: -2, x: 226, y: 400 } },
    dbCatalog: { at: { x: 148, y: 362 }, tangle: TALL_SHARED_STORE },
    dbIdentity: { at: { x: 76, y: 252 }, tangle: TALL_SHARED_STORE },
    dbOrders: { at: { x: 220, y: 252 }, tangle: TALL_SHARED_STORE },
    dbPayments: { at: { x: 364, y: 252 }, tangle: TALL_SHARED_STORE },
    dbVectors: { at: { x: 292, y: 362 }, tangle: { rotate: 0, x: 292, y: 362 } },
    gateway: { at: { x: 220, y: 144 }, tangle: { rotate: 0, x: 220, y: 144 }, width: 200 },
    identity: { at: { x: 76, y: 206 }, tangle: { rotate: 1.5, x: 364, y: 204 } },
    legacy: { at: { x: 80, y: 138 }, tangle: { rotate: 2, x: 80, y: 138 } },
    llm: { at: { x: 148, y: 496 }, tangle: { rotate: -1.5, x: 70, y: 232 } },
    mobile: { at: { x: 220, y: 42 }, tangle: { rotate: -2, x: 338, y: 124 } },
    notifications: { at: { x: 76, y: 448 }, tangle: { rotate: -1.5, x: 92, y: 498 } },
    orders: { at: { x: 220, y: 206 }, tangle: { rotate: -2, x: 346, y: 392 } },
    partners: { at: { x: 364, y: 42 }, tangle: { rotate: -2, x: 74, y: 46 } },
    payments: { at: { x: 364, y: 206 }, tangle: { rotate: 2, x: 92, y: 412 } },
    psp: { at: { x: 364, y: 496 }, tangle: { rotate: 1.5, x: 342, y: 486 } },
    search: { at: { x: 364, y: 448 }, tangle: { rotate: 2, x: 76, y: 322 } },
    shared: { at: { x: 220, y: 296 }, tangle: TALL_SHARED_STORE, width: 150 },
    web: { at: { x: 76, y: 42 }, tangle: { rotate: 2, x: 364, y: 42 } },
  },
  packetRadius: 3,
  platform: { hasSubs: false, height: 34, width: 424, x: 8, y: 524 },
  rail: { label: { x: 120, y: 397 }, x1: 8, x2: 432, y: 406 },
  rows: [],
  status: { gap: 104, y: 8 },
  stubs: [
    { x1: 76, x2: 76, y1: 274, y2: 406 },
    { x1: 220, x2: 220, y1: 274, y2: 406 },
    { x1: 364, x2: 364, y1: 274, y2: 406 },
    { x1: 148, x2: 148, y1: 384, y2: 406 },
    { x1: 268, x2: 268, y1: 384, y2: 406 },
    { x1: 76, x2: 76, y1: 406, y2: 431 },
    { x1: 220, x2: 220, y1: 406, y2: 431 },
    { x1: 364, x2: 364, y1: 406, y2: 431 },
  ],
  width: 440,
  zones: [
    { height: 86, width: 136, x: 8, y: 188 },
    { height: 86, width: 136, x: 152, y: 188 },
    { height: 86, width: 136, x: 296, y: 188 },
    { height: 86, width: 136, x: 80, y: 298 },
    { height: 86, width: 136, x: 224, y: 298 },
  ],
}

export const DIAGRAM_LAYOUTS: Readonly<Record<DiagramLayoutName, DiagramLayout>> = {
  tall: TALL,
  wide: WIDE,
}
