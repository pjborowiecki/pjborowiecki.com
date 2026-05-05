"use client"

import { type JSX, type ReactNode, useRef } from "react"

import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface RevealProps {
  children: ReactNode
  width?: "fit-content" | "100%"
  delay?: number
  duration?: number
  variant?: "slide-up" | "blur" | "scale" | "slide-right" | "text-mask" | "blur-slide"
  className?: string
  threshold?: number
}

export function Reveal({
  children,
  width = "fit-content",
  delay = 0,
  duration = 0.8,
  variant = "slide-up",
  className = "",
  threshold = 0.2,
}: Readonly<RevealProps>): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = elementRef.current
      if (!el) return

      let fromVars: gsap.TweenVars = {}
      const toVars: gsap.TweenVars = {
        scrollTrigger: {
          trigger: containerRef.current,
          start: `top ${100 - threshold * 100}%`,
          toggleActions: "play none none none",
        },
        duration,
        delay,
        ease: "power3.out",
        clearProps: "all",
      }

      switch (variant) {
        case "slide-up":
          fromVars = { y: 40, opacity: 0 }
          toVars.y = 0
          toVars.opacity = 1
          break
        case "slide-right":
          fromVars = { x: -40, opacity: 0 }
          toVars.x = 0
          toVars.opacity = 1
          break
        case "blur":
          fromVars = { filter: "blur(12px)", scale: 1.05, opacity: 0.5 }
          toVars.filter = "blur(0px)"
          toVars.scale = 1
          toVars.opacity = 1
          break
        case "scale":
          fromVars = { scale: 0.95, opacity: 0 }
          toVars.scale = 1
          toVars.opacity = 1
          break
        case "text-mask":
          fromVars = { yPercent: 100 }
          toVars.yPercent = 0
          break
        case "blur-slide":
          fromVars = { filter: "blur(10px)", y: 20, scale: 0.98, opacity: 0 }
          toVars.filter = "blur(0px)"
          toVars.y = 0
          toVars.scale = 1
          toVars.opacity = 1
          break
      }

      gsap.fromTo(el, fromVars, toVars)
    },
    { scope: containerRef },
  )

  if (variant === "text-mask") {
    return (
      <div ref={containerRef} style={{ width }} className={`relative overflow-hidden ${className}`}>
        <div ref={elementRef}>{children}</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ width }} className={`relative ${className}`}>
      <div ref={elementRef}>{children}</div>
    </div>
  )
}
