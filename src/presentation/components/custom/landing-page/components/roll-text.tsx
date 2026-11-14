import type { JSX } from "react"

export const RollText = ({ children }: { readonly children: string }): JSX.Element => (
  <span className="roll">
    <span>{children}</span>
    <span aria-hidden>{children}</span>
  </span>
)
