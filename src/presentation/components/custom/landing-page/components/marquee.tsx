import { type JSX, type ReactNode, useRef } from "react"

import { ScrollTrigger, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { MEDIA } from "~/src/data/media"

import { cn } from "~/src/lib/cn"

type MarqueeDirection = "left" | "right"

interface MarqueeProps {
  readonly children: ReactNode
  readonly className?: string
  readonly copies?: number
  readonly direction?: MarqueeDirection
  readonly duration?: number
}

const PASS: Record<MarqueeDirection, { readonly from: number; readonly to: number }> = {
  left: { from: 0, to: -50 },
  right: { from: -50, to: 0 },
}

const FULL_SPEED = 1
const SLOW_UNDER_POINTER = 0.2
const MAX_SCROLL_BOOST = 5
const VELOCITY_PER_BOOST = 400
const SETTLE_DELAY = 0.12

const SPEED_EASE: gsap.TweenVars = { duration: 0.7, ease: "power2.out" }

const GROUPS_PER_COPY = 2
const ORIGINAL_GROUP = 1

const GROUP = "flex shrink-0 items-center motion-reduce:shrink motion-reduce:flex-wrap"

interface MarqueeRun {
  readonly direction: MarqueeDirection
  readonly duration: number
  readonly root: HTMLDivElement
  readonly track: HTMLDivElement
}

const runMarquee = ({ direction, duration, root, track }: MarqueeRun): (() => void) => {
  const { from, to } = PASS[direction]
  const pass = gsap.fromTo(track, { xPercent: from }, { duration, ease: "none", paused: true, repeat: -1, xPercent: to })
  const speed = { value: FULL_SPEED }
  const resting = { value: FULL_SPEED }

  const toSpeed = gsap.quickTo(speed, "value", {
    ...SPEED_EASE,
    onUpdate: () => {
      pass.timeScale(speed.value)
    },
  })
  const settle = gsap.delayedCall(SETTLE_DELAY, () => toSpeed(resting.value)).pause()

  const setRest = (value: number): void => {
    resting.value = value
    toSpeed(resting.value)
  }
  const onEnter = (): void => {
    setRest(SLOW_UNDER_POINTER)
  }
  const onLeave = (): void => {
    setRest(FULL_SPEED)
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting === true) {
      pass.play()
    } else {
      pass.pause()
    }
  })
  observer.observe(root)

  ScrollTrigger.create({
    end: "max",
    onUpdate: (self) => {
      if (pass.paused()) {
        return
      }

      const velocity = Math.abs(self.getVelocity())
      toSpeed(resting.value + Math.min(velocity / VELOCITY_PER_BOOST, MAX_SCROLL_BOOST))
      settle.restart(true)
    },
    start: 0,
  })

  root.addEventListener("pointerenter", onEnter)
  root.addEventListener("pointerleave", onLeave)

  return () => {
    observer.disconnect()
    root.removeEventListener("pointerenter", onEnter)
    root.removeEventListener("pointerleave", onLeave)
  }
}

export const Marquee = ({ children, className, copies = 1, direction = "left", duration = 60 }: MarqueeProps): JSX.Element => {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add(MEDIA.MOTION_OK, () => {
        const root = rootRef.current
        const track = trackRef.current

        if (!root || !track) {
          return
        }

        return runMarquee({ direction, duration, root, track })
      })
    },
    { scope: rootRef },
  )

  const repeats = Array.from({ length: copies * GROUPS_PER_COPY - ORIGINAL_GROUP }, (_, repeat) => `repeat-${String(repeat)}`)

  return (
    <div className={cn("overflow-hidden", className)} ref={rootRef}>
      <div className="flex w-fit will-change-transform motion-reduce:w-full motion-reduce:will-change-auto" ref={trackRef}>
        <div className={GROUP}>{children}</div>
        {repeats.map((id) => (
          <div aria-hidden className={cn(GROUP, "motion-reduce:hidden")} key={id}>
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}
