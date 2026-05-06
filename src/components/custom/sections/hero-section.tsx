"use client"

import { type JSX, useRef, useState } from "react"

import { useGSAP } from "@gsap/react"
import { useTranslations } from "next-intl"

import { Reveal } from "~/src/components/custom/reveal"

export function HeroSection(): JSX.Element {
  const t = useTranslations("custom.hero")
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useGSAP(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setMousePos({ x, y })
    }

    globalThis.addEventListener("mousemove", handleMouseMove)
    return () => globalThis.removeEventListener("mousemove", handleMouseMove)
  })

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden border-border border-b bg-background pt-20 selection:bg-primary selection:text-primary-foreground"
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-primary/10 opacity-40 blur-[150px] transition-transform duration-100 ease-out"
          style={{ transform: `translate3d(calc(-50% + ${mousePos.x * -20}px), calc(-50% + ${mousePos.y * -20}px), 0)` }}
        />

        <div className="pointer-events-none absolute inset-0 flex justify-between px-6 opacity-5 md:px-12 md:opacity-10">
          <div className="h-full w-px bg-foreground"></div>
          <div className="hidden h-full w-px bg-foreground md:block"></div>
          <div className="h-full w-px bg-foreground"></div>
        </div>
      </div>

      <div className="container relative z-10 mx-auto flex h-full flex-col justify-center px-6 md:px-12">
        <div className="mb-6 flex items-end justify-between border-border border-b pb-6 md:mb-24">
          <Reveal variant="slide-right">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span className="font-bold font-sans text-foreground text-xs uppercase tracking-widest">{t("available")}</span>
            </div>
          </Reveal>
          <Reveal delay={0.1} variant="slide-right">
            <div className="hidden text-right md:block">
              <span className="font-mono text-muted-foreground text-xs">{t("basedIn")}</span>
            </div>
          </Reveal>
        </div>

        <div className="perspective-1000 mx-auto mb-12 flex w-full max-w-[95vw] flex-col md:mb-24">
          <div
            className="flex items-center justify-start transition-transform duration-200 ease-out will-change-transform"
            style={{ transform: `translate3d(${mousePos.x * 10}px, ${mousePos.y * 5}px, 0)` }}
          >
            <Reveal variant="text-mask" duration={1}>
              <h1 className="font-black font-sans text-[12vw] text-foreground leading-[0.85] tracking-tighter mix-blend-difference sm:text-[15vw] md:text-[10vw]">
                {t("full")}
              </h1>
            </Reveal>
            <Reveal delay={0.5} variant="blur-slide">
              <span className="mt-4 ml-12 hidden max-w-xs font-mono text-muted-foreground text-sm leading-relaxed lg:block">
                {t("specialized")}
              </span>
            </Reveal>
          </div>

          <div
            className="ml-2 flex items-center gap-4 border-primary/50 border-l-2 pl-4 transition-transform duration-200 ease-out will-change-transform md:ml-[5vw] md:gap-12 md:pl-[10vw]"
            style={{ transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 10}px, 0)` }}
          >
            <Reveal delay={0.3} variant="scale">
              <div className="hidden h-[2px] w-[6vw] bg-linear-to-r from-primary to-primary/50 md:block"></div>
            </Reveal>
            <Reveal delay={0.2} variant="text-mask" duration={1}>
              <h1 className="font-black font-sans text-[12vw] text-foreground leading-[0.85] tracking-tighter sm:text-[15vw] md:text-[10vw]">
                {t("stack")}
              </h1>
            </Reveal>
          </div>

          <div
            className="relative mt-4 flex items-center justify-start transition-transform duration-200 ease-out will-change-transform md:mt-8 md:justify-end"
            style={{ transform: `translate3d(${mousePos.x * 30}px, ${mousePos.y * 15}px, 0)` }}
          >
            <Reveal delay={0.4} variant="text-mask" duration={1}>
              <h1 className="bg-linear-to-b from-foreground to-foreground/60 bg-clip-text font-black font-sans text-[10vw] text-transparent leading-[0.85] tracking-tighter sm:text-[12vw] md:text-[10vw]">
                {t("developer")}
              </h1>
            </Reveal>
          </div>
        </div>

        <div className="relative flex flex-col items-start justify-between gap-6 border-border border-t pt-6 md:flex-row md:items-end md:gap-8 md:pt-8">
          <Reveal delay={0.8} variant="slide-up">
            <p className="max-w-2xl pr-4 font-sans text-base text-muted-foreground leading-relaxed sm:text-lg md:pr-0 md:text-xl">
              {t.rich("building", {
                strong: (chunks) => <strong className="font-semibold text-foreground">{chunks}</strong>,
              })}
            </p>
          </Reveal>

          <Reveal delay={0.9} variant="slide-up">
            <div className="mt-8 flex gap-8 md:mt-0">
              <a
                href="#work"
                className="border-transparent border-b pb-1 font-mono text-foreground text-sm uppercase tracking-widest transition-colors hover:border-primary hover:text-primary"
              >
                {t("viewWork")}
              </a>
              <a
                href="#contact"
                className="border-transparent border-b pb-1 font-mono text-foreground text-sm uppercase tracking-widest transition-colors hover:border-primary hover:text-primary"
              >
                {t("contactMe")}
              </a>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 md:bottom-4">
          <Reveal delay={1.2} variant="blur-slide">
            <a href="#about" className="block cursor-pointer p-4 text-foreground/50 transition-colors hover:text-foreground">
              <svg className="h-5 w-5 animate-bounce md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <title>{"Scroll down"}</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
