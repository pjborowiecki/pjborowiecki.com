import { type JSX, type ReactNode, useRef } from "react"

import { MOTION_OK, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { cn } from "~/src/lib/cn"

import { ResponsiveImage } from "~/src/presentation/components/custom/landing-page/components/responsive-image"

interface ImageRevealProps {
  readonly alt: string
  readonly caption?: ReactNode
  readonly className?: string
  readonly name: string
  readonly sizes: string
}

const FRAME_CLOSED: gsap.TweenVars = { clipPath: "inset(9% 16% 9% 16%)" }
const FRAME_OPEN: gsap.TweenVars = { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }
const FRAME_SCROLL: ScrollTrigger.Vars = { end: "top 8%", scrub: 0.4, start: "top 96%" }

const IMAGE_ZOOMED: gsap.TweenVars = { scale: 1.18 }
const IMAGE_SETTLED: gsap.TweenVars = { ease: "none", scale: 1 }
const IMAGE_SCROLL: ScrollTrigger.Vars = { end: "bottom bottom", scrub: true, start: "top bottom" }

export const ImageReveal = ({ alt, caption, className, name, sizes }: ImageRevealProps): JSX.Element => {
  const frameRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.fromTo(frameRef.current, { ...FRAME_CLOSED }, { ...FRAME_OPEN, scrollTrigger: { ...FRAME_SCROLL, trigger: frameRef.current } })
        gsap.fromTo(
          imageRef.current,
          { ...IMAGE_ZOOMED },
          { ...IMAGE_SETTLED, scrollTrigger: { ...IMAGE_SCROLL, trigger: frameRef.current } },
        )
      })
    },
    { scope: frameRef },
  )

  return (
    <div className={cn("group relative overflow-hidden bg-muted", className)} ref={frameRef}>
      <div className="absolute inset-0" ref={imageRef}>
        <ResponsiveImage alt={alt} className="object-cover" isFill name={name} sizes={sizes} />
      </div>
      {caption !== undefined && (
        <div className="absolute bottom-0 left-(--gutter) overflow-hidden">
          <div className="translate-y-0 bg-emerald px-5 py-3 text-cream transition-transform delay-75 duration-500 ease-out md:translate-y-full md:group-hover:translate-y-0">
            {caption}
          </div>
        </div>
      )}
    </div>
  )
}
