import { describe, expect, it } from "vite-plus/test"

import * as client from "~/src/integrations/gsap/gsap.config"
import * as server from "~/src/integrations/gsap/gsap.server"

describe("GSAP integration", () => {
  it("hands the browser GSAP with ScrollTrigger, SplitText and the React hook", () => {
    expect(client.gsap.version).toMatch(/^3\./u)
    expect(client.ScrollTrigger).toBeTypeOf("function")
    expect(client.SplitText).toBeTypeOf("function")
    expect(client.useGSAP).toBeTypeOf("function")
  })

  it("gives the Worker the same names without loading GSAP, whose ticker may not start there", () => {
    expect(Object.keys(server).toSorted()).toStrictEqual(Object.keys(client).toSorted())
    expect(server.useGSAP).not.toThrow()
  })
})
