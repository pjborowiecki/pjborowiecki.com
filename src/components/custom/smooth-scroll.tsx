"use client"

import { forwardRef, type JSX, useEffect } from "react"

import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import Lenis from "lenis"

gsap.registerPlugin(ScrollTrigger)

type SmoothScrollProps = React.ComponentPropsWithoutRef<"div">

export const SmoothScroll = forwardRef<HTMLDivElement, SmoothScrollProps>(({ children, ...props }, ref): JSX.Element => {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
    })

    lenis.on("scroll", ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000)
      })
    }
  }, [])

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
})

SmoothScroll.displayName = "SmoothScroll"
