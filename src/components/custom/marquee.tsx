"use client"

import { type JSX, type ReactNode, useRef } from "react"

import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"

gsap.registerPlugin(useGSAP)

export interface MarqueeItem {
  id: string
  content: ReactNode
}

interface MarqueeProps {
  items: MarqueeItem[]
  direction?: "left" | "right"
  className?: string
  gapClass?: string
}

export function Marquee({
  items,
  direction = "left",
  className = "",
  gapClass = "gap-16 pr-16 md:gap-32 md:pr-32",
}: Readonly<MarqueeProps>): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const track = trackRef.current
      if (!track) return

      gsap.to(track, {
        xPercent: direction === "left" ? -50 : 50,
        ease: "none",
        duration: 35,
        repeat: -1,
      })

      if (direction === "right") {
        gsap.set(track, { xPercent: -50 })
      }
    },
    { scope: containerRef },
  )

  return (
    <div ref={containerRef} className={`relative flex w-full select-none overflow-x-hidden ${className}`}>
      <div ref={trackRef} className="flex w-fit shrink-0 items-center">
        <div className={`flex min-w-full shrink-0 items-center justify-around ${gapClass}`}>
          {items.map((item) => (
            <span key={`original-${item.id}`} className="whitespace-nowrap">
              {item.content}
            </span>
          ))}
        </div>

        <div className={`flex min-w-full shrink-0 items-center justify-around ${gapClass}`}>
          {items.map((item) => (
            <span key={`clone-${item.id}`} className="whitespace-nowrap">
              {item.content}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
