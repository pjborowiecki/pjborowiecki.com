"use client"

import { type JSX, useRef, useState } from "react"

import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"

gsap.registerPlugin(useGSAP)

export function CustomCursor(): JSX.Element {
  const cursorRef = useRef<HTMLDivElement>(null)
  const trailingRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  useGSAP(() => {
    const mainCursor = cursorRef.current
    const trailingCursor = trailingRef.current

    const xToMain = gsap.quickTo(mainCursor, "x", { duration: 0.1, ease: "power3" })
    const yToMain = gsap.quickTo(mainCursor, "y", { duration: 0.1, ease: "power3" })

    const xToTrailing = gsap.quickTo(trailingCursor, "x", { duration: 0.3, ease: "power3" })
    const yToTrailing = gsap.quickTo(trailingCursor, "y", { duration: 0.3, ease: "power3" })

    const onMouseMove = (e: MouseEvent) => {
      xToMain(e.clientX - 6)
      yToMain(e.clientY - 6)

      xToTrailing(e.clientX - 20)
      yToTrailing(e.clientY - 20)
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "A" || target.tagName === "BUTTON" || target.closest("a") || target.closest("button")) {
        setHovered(true)
      } else {
        setHovered(false)
      }
    }

    globalThis.addEventListener("mousemove", onMouseMove)
    globalThis.addEventListener("mouseover", onMouseOver)

    return () => {
      globalThis.removeEventListener("mousemove", onMouseMove)
      globalThis.removeEventListener("mouseover", onMouseOver)
    }
  })

  useGSAP(() => {
    if (hovered) {
      gsap.to(cursorRef.current, { scale: 0.5, duration: 0.2 })
      gsap.to(trailingRef.current, { scale: 1.5, backgroundColor: "rgba(255,255,255,0.1)", duration: 0.2 })
    } else {
      gsap.to(cursorRef.current, { scale: 1, duration: 0.2 })
      gsap.to(trailingRef.current, { scale: 1, backgroundColor: "transparent", duration: 0.2 })
    }
  }, [hovered])

  return (
    <>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-9999 hidden h-3 w-3 rounded-full bg-foreground mix-blend-difference md:block"
      />
      <div
        ref={trailingRef}
        className="pointer-events-none fixed top-0 left-0 z-9998 hidden h-10 w-10 rounded-full border border-foreground/50 mix-blend-difference md:block"
      />
    </>
  )
}
