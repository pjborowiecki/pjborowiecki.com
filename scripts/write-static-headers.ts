import { writeFileSync } from "node:fs"

import { staticHeaders } from "~/src/lib/static-headers"

const HEADERS_FILE = "dist/client/_headers"

writeFileSync(HEADERS_FILE, staticHeaders())

process.stdout.write(`Wrote ${HEADERS_FILE} from the security headers and cache rules in src/data/http.ts.\n`)
