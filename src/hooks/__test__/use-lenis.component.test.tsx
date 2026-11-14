import { renderToString } from "react-dom/server"

import { act, renderHook } from "@testing-library/react"
import Lenis from "lenis"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { shareLenis, useLenis } from "~/src/hooks/use-lenis"

const LenisProbe = () => <output>{String(useLenis() === undefined)}</output>

const lenisInstances: Lenis[] = []

const fakeLenis = (): Lenis => {
  const lenis = new Lenis({ autoRaf: false })
  lenisInstances.push(lenis)
  return lenis
}

class TestResizeObserver {
  disconnect = vi.fn()
  observe = vi.fn()
  unobserve = vi.fn()
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", TestResizeObserver)
  vi.stubGlobal("matchMedia", () => ({ addEventListener: vi.fn(), matches: false, removeEventListener: vi.fn() }))
})

afterEach(() => {
  shareLenis(undefined)
  for (const lenis of lenisInstances.splice(0)) {
    lenis.destroy()
  }
  vi.unstubAllGlobals()
})

describe("useLenis", () => {
  it("returns the shared instance and follows it when it changes", () => {
    const { result } = renderHook(() => useLenis())
    expect(result.current).toBeUndefined()

    const lenis = fakeLenis()
    act(() => {
      shareLenis(lenis)
    })
    expect(result.current).toBe(lenis)

    act(() => {
      shareLenis(undefined)
    })
    expect(result.current).toBeUndefined()
  })

  it("has no instance while rendering on the server", () => {
    shareLenis(fakeLenis())

    expect(renderToString(<LenisProbe />)).toBe("<output>true</output>")
  })
})
