import { describe, expect, it } from "vite-plus/test"

import * as client from "~/src/integrations/gsap/gsap.config"
import { MOTION_OK } from "~/src/integrations/gsap/gsap.constants"
import * as server from "~/src/integrations/gsap/gsap.server"

describe("GSAP integration", () => {
  it("hands the browser GSAP with ScrollTrigger, SplitText and the React hook", () => {
    expect(client.gsap.version).toMatch(/^3\./u)
    expect(client.ScrollTrigger).toBeTypeOf("function")
    expect(client.SplitText).toBeTypeOf("function")
    expect(client.useGSAP).toBeTypeOf("function")
    expect(client.MOTION_OK).toBe(MOTION_OK)
  })

  it("gives the Worker the same names without loading GSAP, whose ticker may not start there", () => {
    expect(Object.keys(server).toSorted()).toStrictEqual(Object.keys(client).toSorted())
    expect(server.MOTION_OK).toBe(MOTION_OK)
    expect(server.useGSAP).not.toThrow()
  })
})
