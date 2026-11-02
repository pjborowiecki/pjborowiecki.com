import type { JSX } from "react"

import { CustomCursor } from "~/src/components/custom/custom-cursor"
import { Navbar } from "~/src/components/custom/navbar"
import { SmoothScroll } from "~/src/components/custom/smooth-scroll"

export default function LandingPageLayout({ children }: Readonly<LayoutProps<"/[locale]">>): JSX.Element {
  return (
    <SmoothScroll>
      <div className="relative min-h-screen bg-background font-sans text-foreground">
        <CustomCursor />
        <Navbar />

        {children}
      </div>
    </SmoothScroll>
  )
}
