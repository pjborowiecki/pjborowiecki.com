import type { JSX } from "react"

import { Outlet, createFileRoute } from "@tanstack/react-router"

import { CustomCursor } from "~/src/presentation/components/custom/custom-cursor"
import { Navigation } from "~/src/presentation/components/custom/navigation"
import { SmoothScroll } from "~/src/presentation/components/custom/smooth-scroll"

const LandingLayout = (): JSX.Element => (
  <div className="relative min-h-screen bg-background font-sans text-foreground">
    <SmoothScroll />
    <CustomCursor />
    <Navigation />
    <main className="relative">
      <Outlet />
    </main>
  </div>
)

export const Route = createFileRoute("/_landing")({
  component: LandingLayout,
})
