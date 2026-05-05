import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod/v4"

import { CONSTANTS } from "~/src/constants"

const env = createEnv({
  server: {
    CLOUDFLARE_EMAIL_SERVICE_URL: z.url(),
    CLOUDFLARE_API_TOKEN: z.string().min(32).startsWith("cfat_"),
    ARCJET_KEY: z.string().startsWith("ajkey_"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url().default(CONSTANTS.DEFAULT_APP_URL),
  },
  runtimeEnv: {
    CLOUDFLARE_EMAIL_SERVICE_URL: process.env.CLOUDFLARE_EMAIL_SERVICE_URL,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    ARCJET_KEY: process.env.ARCJET_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
})

export { env }
