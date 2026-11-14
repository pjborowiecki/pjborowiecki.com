import { type JSX, createElement, useRef } from "react"

import { MOTION_OK, SplitText, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

interface SplitHeadingProps {
  readonly as?: "h2" | "h3" | "p"
  readonly children: string
  readonly className?: string
}

const WORD_RISE: gsap.TweenVars = { duration: 1.15, ease: "expo.out", stagger: 0.055, yPercent: 112 }

const SPLIT_START = "top 88%"

export const SplitHeading = ({ as = "h2", children, className }: SplitHeadingProps): JSX.Element => {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const rise: { current?: gsap.core.Tween } = {}

        SplitText.create(ref.current, {
          autoSplit: true,
          mask: "words",
          onSplit: (self) => {
            rise.current?.revert()
            rise.current = gsap.from(self.words, { ...WORD_RISE, scrollTrigger: { once: true, start: SPLIT_START, trigger: ref.current } })
          },
          type: "words",
          wordsClass: "split",
        })
      })
    },
    { dependencies: [children], scope: ref },
  )

  return createElement(as, { className, ref }, children)
}
