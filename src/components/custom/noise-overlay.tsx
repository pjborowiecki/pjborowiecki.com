import type { JSX } from "react"

export function NoiseOverlay(): JSX.Element {
  return <div className="pointer-events-none fixed inset-0 z-9999 bg-noise opacity-[0.04] mix-blend-overlay" />
}
