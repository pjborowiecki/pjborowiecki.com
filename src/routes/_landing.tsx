import type { JSX } from "react"

import { Outlet, createFileRoute } from "@tanstack/react-router"

import { SECTION_IDS } from "~/src/data/marketing"

import { CustomCursor } from "~/src/presentation/components/custom/custom-cursor"
import { Footer } from "~/src/presentation/components/custom/footer"
import { Navigation } from "~/src/presentation/components/custom/navigation"
import { SmoothScroll } from "~/src/presentation/components/custom/smooth-scroll"

const LandingLayout = (): JSX.Element => (
  <div className="relative min-h-screen bg-background font-sans text-foreground">
    <SmoothScroll />
    <CustomCursor />
    <Navigation />
    <main className="relative" id={SECTION_IDS.MAIN}>
      <Outlet />
    </main>
    <Footer />
  </div>
)

export const Route = createFileRoute("/_landing")({
  component: LandingLayout,
})
