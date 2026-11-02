"use client"

import Image from "next/image"
import { type JSX, type ReactNode, useRef } from "react"

import { gsap, MOTION_OK, useGSAP } from "~/src/lib/gsap"
import { cn } from "~/src/lib/utils"

interface ImageRevealProps {
  alt: string
  caption?: ReactNode
  className?: string
  sizes: string
  src: string
}

/** Opens inside the page's margins and grows out to the edge of the screen under the reader's scroll. */
export function ImageReveal({ alt, caption, className, sizes, src }: Readonly<ImageRevealProps>): JSX.Element {
  const frameRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.fromTo(
          frameRef.current,
          { clipPath: "inset(9% 16% 9% 16%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: { trigger: frameRef.current, start: "top 96%", end: "top 8%", scrub: 0.4 },
          },
        )
        gsap.fromTo(
          imageRef.current,
          { scale: 1.18 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: frameRef.current, start: "top bottom", end: "bottom bottom", scrub: true },
          },
        )
      })
    },
    { scope: frameRef },
  )

  return (
    <div ref={frameRef} className={cn("group relative overflow-hidden bg-muted", className)}>
      <div ref={imageRef} className="absolute inset-0">
        <Image fill src={src} alt={alt} sizes={sizes} quality={88} className="object-cover" />
      </div>
      {caption && (
        <div className="absolute bottom-0 left-(--gutter) overflow-hidden">
          <div className="translate-y-0 bg-emerald px-5 py-3 text-cream transition-transform delay-75 duration-500 ease-out md:translate-y-full md:group-hover:translate-y-0">
            {caption}
          </div>
        </div>
      )}
    </div>
  )
}
