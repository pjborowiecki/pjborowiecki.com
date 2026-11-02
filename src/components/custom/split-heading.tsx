"use client"

import { createElement, type JSX, useRef } from "react"

import { gsap, MOTION_OK, SplitText, useGSAP } from "~/src/lib/gsap"

interface SplitHeadingProps {
  as?: "h2" | "h3" | "p"
  children: string
  className?: string
}

/** Reveals a heading word by word. SplitText keeps the unsplit text as the accessible name. */
export function SplitHeading({ as = "h2", children, className }: Readonly<SplitHeadingProps>): JSX.Element {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        SplitText.create(ref.current, {
          type: "words",
          mask: "words",
          wordsClass: "split",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 112,
              duration: 1.15,
              ease: "expo.out",
              stagger: 0.055,
              scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
            }),
        })
      })
    },
    { scope: ref, dependencies: [children] },
  )

  return createElement(as, { ref, className }, children)
}
