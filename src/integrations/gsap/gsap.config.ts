import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

ScrollTrigger.config({ ignoreMobileResize: true })

export { MOTION_OK } from "~/src/integrations/gsap/gsap.constants"

export { useGSAP } from "@gsap/react"
export { gsap } from "gsap"
export { ScrollTrigger } from "gsap/ScrollTrigger"
export { SplitText } from "gsap/SplitText"
