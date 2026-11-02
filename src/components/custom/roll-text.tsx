import type { JSX } from "react"

/** A label that rolls over to its twin on hover. The twin is invisible to assistive technology. */
export function RollText({ children }: Readonly<{ children: string }>): JSX.Element {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
  )
}
