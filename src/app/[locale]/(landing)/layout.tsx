import type { JSX } from "react"

import { BackgroundGrid } from "~/src/components/custom/background-grid"
import { CustomCursor as Cursor } from "~/src/components/custom/custom-cursor"
import { Navbar } from "~/src/components/custom/navbar"
import { NoiseOverlay } from "~/src/components/custom/noise-overlay"
import { SmoothScroll } from "~/src/components/custom/smooth-scroll"

export default function LandingPageLayout({ children }: Readonly<LayoutProps<"/[locale]">>): JSX.Element {
  return (
    <SmoothScroll>
      <div className="relative min-h-screen bg-background font-sans text-foreground selection:bg-foreground selection:text-background">
        <Navbar />

        {children}

        <BackgroundGrid />
        <NoiseOverlay />
        <Cursor />
      </div>
    </SmoothScroll>
  )
}
