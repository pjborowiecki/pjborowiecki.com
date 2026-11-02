import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

// A phone's address bar sliding away must not re-measure the whole page mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true })

export const MOTION_OK = "(prefers-reduced-motion: no-preference)"

export { gsap, ScrollTrigger, SplitText, useGSAP }
