import type { JSX } from "react"

export function BackgroundGrid(): JSX.Element {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 flex justify-center">
      <div className="container mx-auto flex h-full justify-between px-6 opacity-[0.03] md:px-12">
        <div className="h-full w-px bg-foreground" />
        <div className="hidden h-full w-px bg-foreground md:block" />
        <div className="h-full w-px bg-foreground" />
      </div>
    </div>
  )
}
