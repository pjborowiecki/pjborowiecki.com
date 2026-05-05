"use client"

import Image from "next/image"
import { type JSX, useRef } from "react"

import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useTranslations } from "next-intl"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function PhilosophySection(): JSX.Element {
  const t = useTranslations("custom.philosophy")
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const track = trackRef.current
      const progress = progressRef.current
      if (!track || !progress) return

      const getScrollAmount = () => track.scrollWidth - window.innerWidth

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${getScrollAmount()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      tl.to(
        track,
        {
          x: () => -getScrollAmount(),
          ease: "none",
        },
        0,
      )

      tl.to(
        progress,
        {
          width: "100%",
          ease: "none",
        },
        0,
      )
    },
    { scope: containerRef },
  )

  return (
    <section id="philosophy" ref={containerRef} className="relative h-screen overflow-hidden bg-background">
      <div className="container pointer-events-none absolute top-32 left-0 z-20 mx-auto w-full px-6 md:px-12">
        <div className="border-primary border-l-2 pl-6">
          <h2 className="mb-2 font-mono text-primary text-xs uppercase tracking-widest">{t("methodology")}</h2>
          <p className="font-bold font-sans text-3xl text-foreground tracking-tighter md:text-4xl">
            {t.rich("engineeringStandards", {
              span: (chunks) => <span className="text-muted-foreground">{chunks}</span>,
            })}
          </p>
        </div>
      </div>

      <div className="container pointer-events-none absolute bottom-24 left-0 z-20 mx-auto w-full px-6 md:px-12">
        <div className="h-px w-full bg-foreground/10 md:w-1/3">
          <div ref={progressRef} className="h-full w-0 bg-foreground" />
        </div>
        <div className="mt-4 font-mono text-muted-foreground text-xs uppercase tracking-widest">{t("scrollExplore")}</div>
      </div>

      <div ref={trackRef} className="flex h-full w-fit items-center gap-12 px-6 will-change-transform md:gap-24 md:px-12">
        <div className="flex h-1/2 min-w-[85vw] flex-col justify-center border-border border-l pl-6 md:min-w-[40vw] md:pl-12 lg:min-w-[30vw]">
          <h3 className="mb-8 font-black font-sans text-4xl text-foreground leading-[0.9] tracking-tighter md:text-6xl">
            {t.rich("buildingForTomorrow", {
              span: (chunks) => <span className="text-muted-foreground">{chunks}</span>,
              br: () => <br />,
            })}
          </h3>
          <p className="max-w-md font-sans text-lg text-muted-foreground leading-relaxed">{t("buildingDesc")}</p>
        </div>

        {[
          {
            title: t("card1Title"),
            desc: t("card1Desc"),
            number: "01",
            image: "/images/philosophy/simplicity.jpg",
          },
          {
            title: t("card2Title"),
            desc: t("card2Desc"),
            number: "02",
            image: "/images/philosophy/performance.jpg",
          },
          {
            title: t("card3Title"),
            desc: t("card3Desc"),
            number: "03",
            image: "/images/philosophy/scalability.jpg",
          },
          {
            title: t("card4Title"),
            desc: t("card4Desc"),
            number: "04",
            image: "/images/philosophy/user-centric.jpg",
          },
        ].map((card) => (
          <article
            key={card.number}
            className="group relative aspect-[4/5] min-w-[70vw] overflow-hidden border border-border bg-card md:aspect-[3/4] md:min-w-[30vw] lg:min-w-[20vw]"
          >
            <div className="absolute inset-0 z-0">
              <Image
                fill
                src={card.image}
                alt={card.title}
                sizes="(max-width: 768px) 100vw, 30vw"
                className="object-cover opacity-30 contrast-125 grayscale transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-50"
              />
              <div className="absolute inset-0 bg-linear-to-b from-background/50 via-background/20 to-background/90"></div>
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
              <div className="flex items-start justify-between">
                <span className="font-black font-sans text-5xl text-foreground/10 transition-colors duration-500 group-hover:text-foreground/30 md:text-7xl">
                  {card.number}
                </span>
              </div>

              <div>
                <h3 className="mb-4 font-bold font-sans text-foreground text-xl uppercase tracking-tight drop-shadow-md md:text-2xl">
                  {card.title}
                </h3>
                <div className="mb-4 h-px w-8 bg-primary"></div>
                <p className="text-foreground/80 text-sm leading-relaxed drop-shadow-sm">{card.desc}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
