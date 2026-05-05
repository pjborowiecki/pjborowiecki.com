import arcjet, { fixedWindow, shield, validateEmail } from "@arcjet/next"

import { env } from "~/src/environment"

export const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 5,
    }),
    validateEmail({
      mode: "LIVE",
      deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
  ],
})
