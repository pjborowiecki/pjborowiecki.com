import { resolve } from "node:path"
import type { Plugin } from "vite-plus"

const MOTION_CONFIG = /^~\/src\/integrations\/gsap\/gsap\.config$/u
const SERVER_MOTION = resolve(import.meta.dirname, "../src/integrations/gsap/gsap.server.ts")

export const serverMotion = (): Plugin => ({
  applyToEnvironment: (environment) => environment.name === "ssr",
  enforce: "pre",
  name: "pjborowiecki:server-motion",
  resolveId: {
    filter: { id: MOTION_CONFIG },
    handler: () => SERVER_MOTION,
  },
})
