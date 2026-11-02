"use client"

import { type JSX, type ReactNode, useRef } from "react"

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "~/src/lib/gsap"
import { cn } from "~/src/lib/utils"

interface MarqueeProps {
  children: ReactNode
  className?: string
  /** How many times the items repeat per pass. One pass has to be wider than the widest screen, or the strip shows a gap. */
  copies?: number
  direction?: "left" | "right"
  /** Seconds for one full pass. */
  duration?: number
}

const MAX_SCROLL_BOOST = 5
const SLOW_UNDER_POINTER = 0.2
const GROUP = "flex shrink-0 items-center motion-reduce:shrink motion-reduce:flex-wrap"

/** An endless strip that runs faster the harder the page is scrolled, and eases off under the pointer. */
export function Marquee({ children, className, copies = 1, direction = "left", duration = 60 }: Readonly<MarqueeProps>): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const root = rootRef.current
        if (!root) return

        const [from, to] = direction === "left" ? [0, -50] : [-50, 0]
        const pass = gsap.fromTo(trackRef.current, { xPercent: from }, { xPercent: to, ease: "none", duration, repeat: -1, paused: true })
        const speed = { value: 1 }
        let rest = 1
        // One long-lived tween that gets retargeted, so scrolling allocates nothing per frame.
        const toSpeed = gsap.quickTo(speed, "value", {
          duration: 0.7,
          ease: "power2.out",
          onUpdate: () => void pass.timeScale(speed.value),
        })
        const settle = gsap.delayedCall(0.12, () => toSpeed(rest)).pause()
        const setRest = (value: number) => {
          rest = value
          toSpeed(rest)
        }
        const onEnter = () => setRest(SLOW_UNDER_POINTER)
        const onLeave = () => setRest(1)

        // Asked of the browser rather than a ScrollTrigger: nothing runs while it is out of sight.
        const observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) pass.play()
          else pass.pause()
        })
        observer.observe(root)

        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            if (pass.paused()) return
            toSpeed(rest + Math.min(Math.abs(self.getVelocity()) / 400, MAX_SCROLL_BOOST))
            settle.restart(true)
          },
        })

        root.addEventListener("pointerenter", onEnter)
        root.addEventListener("pointerleave", onLeave)

        return () => {
          observer.disconnect()
          root.removeEventListener("pointerenter", onEnter)
          root.removeEventListener("pointerleave", onLeave)
        }
      })
    },
    { scope: rootRef },
  )

  return (
    <div ref={rootRef} className={cn("overflow-hidden", className)}>
      <div ref={trackRef} className="flex w-fit will-change-transform motion-reduce:w-full motion-reduce:will-change-auto">
        <div className={GROUP}>{children}</div>
        {Array.from({ length: copies * 2 - 1 }, (_, repeat) => `repeat-${repeat}`).map((id) => (
          <div key={id} aria-hidden className={cn(GROUP, "motion-reduce:hidden")}>
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}
