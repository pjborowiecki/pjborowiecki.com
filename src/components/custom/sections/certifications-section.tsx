"use client"

import { type JSX, useRef } from "react"

import { useTranslations } from "next-intl"

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "~/src/lib/gsap"

import { ArrowUpRightIcon, IssuerLogo } from "~/src/components/custom/icons"
import { Reveal } from "~/src/components/custom/reveal"
import { RollText } from "~/src/components/custom/roll-text"
import { SectionHead } from "~/src/components/custom/section-head"

import { CERTIFICATIONS } from "~/src/data"

// On the live site a certificate shows only once it has a verification link. In development and on Vercel preview
// deployments the rest show too, marked as previews, so the section can be judged before the exams are passed and
// cannot reach production early by accident.
interface CertificationsSectionProps {
  includeUnverified?: boolean
}

/** Pixels of scroll per pixel of sideways travel. */
const SCROLL_PER_PIXEL = 1.1

export function CertificationsSection({ includeUnverified = false }: Readonly<CertificationsSectionProps>): JSX.Element | null {
  const t = useTranslations("custom.certifications")
  const listed = CERTIFICATIONS.filter(
    (certification) => certification.url || includeUnverified || process.env.NODE_ENV === "development",
  )
  const outerRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)

  useGSAP(
    () => {
      // More panels than fit: the section holds still once it fills the screen and the row slides through. Phones too,
      // so scrolling down cannot pass the row by without seeing it move.
      gsap.matchMedia().add(MOTION_OK, () => {
        const outer = outerRef.current
        const root = rootRef.current
        const track = trackRef.current
        if (!outer || !root || !track) return
        const distance = () => Math.max(0, track.scrollWidth - globalThis.innerWidth)
        if (distance() === 0) return
        // Native sticky holds the section with its bottom edge on the bottom of the screen. This only sets how long it holds.
        const setLength = () => {
          root.style.top = `${Math.min(0, globalThis.innerHeight - root.offsetHeight)}px`
          outer.style.height = `${distance() * SCROLL_PER_PIXEL + root.offsetHeight}px`
        }
        setLength()
        ScrollTrigger.addEventListener("refreshInit", setLength)

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: outer,
              start: () => `top+=${Math.max(0, root.offsetHeight - globalThis.innerHeight)} top`,
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          })
          .to(track, { x: () => -distance(), duration: 1 }, 0)

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", setLength)
          outer.style.height = ""
          root.style.top = ""
        }
      })
    },
    { scope: outerRef },
  )

  if (listed.length === 0) return null

  return (
    <div ref={outerRef} id="certifications" data-nav-ground="emerald" className="relative z-10 bg-[#084f3a]">
      <section
        ref={rootRef}
        className="ground-emerald relative pt-[clamp(2rem,4vw,4.5rem)] max-md:live:pt-[calc(var(--nav-bar-height)+1.5rem)] live:sticky live:flex live:min-h-svh live:flex-col"
      >
        <SectionHead label={t("label")} title={t("title")} />

        <Reveal className="frame mt-[clamp(1.25rem,2.4vw,2.75rem)]">
          <p className="type-lead max-w-[44ch] text-foreground text-lead">{t("intro")}</p>
        </Reveal>

        {/* Phones show the next panel at the edge. Without scroll motion the row is swiped by hand instead, snapping to each one. */}
        <div className="mt-[clamp(2.5rem,5vw,6rem)] max-md:snap-x max-md:snap-mandatory max-md:overflow-x-auto max-md:overscroll-x-contain max-md:[scrollbar-width:none] live:flex live:flex-1 live:overflow-hidden max-md:[&::-webkit-scrollbar]:hidden">
          <ul
            ref={trackRef}
            className="grid w-full border-border border-t max-md:flex max-md:w-max live:flex live:w-fit live:min-w-full live:will-change-transform md:grid-cols-2 xl:grid-cols-4"
          >
            {listed.map(({ id, issuer, logo, name, url }, index) => (
              <li
                key={id}
                data-dark-ground
                className="group relative flex min-h-0 overflow-hidden border-border border-b px-(--gutter) py-[clamp(1.25rem,2.2vw,2.75rem)] max-md:w-[84vw] max-md:shrink-0 max-md:snap-start max-md:not-first:border-l md:min-h-[clamp(19rem,54svh,42rem)] md:live:w-[50vw] md:live:shrink-0 md:live:grow md:live:not-first:border-l md:even:border-l xl:live:w-[25vw] xl:not-first:border-l xl:px-[clamp(1.25rem,2vw,2.75rem)] xl:last:pr-(--gutter) xl:first:pl-(--gutter)"
              >
                {/* Hover: the panel fills with paper from the floor up, as in Expertise. */}
                <span
                  aria-hidden
                  className="absolute inset-0 origin-bottom scale-y-0 bg-cream transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-y-100"
                />
                <Reveal
                  delay={index * 0.06}
                  className="relative flex w-full flex-col justify-between gap-7 transition-colors duration-300 group-hover:text-emerald-deep md:gap-10"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="type-label text-champagne group-hover:text-emerald">{issuer}</span>
                    <span className="type-label text-right text-current opacity-75">{t(`${id}Focus`)}</span>
                  </div>

                  <div>
                    <h3 className="type-display text-[clamp(2.125rem,2.85vw,4.25rem)] max-md:text-[1.75rem]">{name}</h3>
                    <p className="type-body mt-4 text-current opacity-85">{t(`${id}Body`)}</p>
                    <div className="mt-5 flex items-end justify-between gap-4">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/verify inline-flex items-center gap-1.5 border-current border-b pb-0.5 font-medium tracking-[-0.012em]"
                        >
                          <RollText>{t("verify")}</RollText>
                          <ArrowUpRightIcon className="size-[0.85em] transition-transform duration-300 group-hover/verify:translate-x-0.5 group-hover/verify:-translate-y-0.5" />
                        </a>
                      ) : (
                        <p className="inline-block border border-current border-dashed px-2.5 py-1 font-medium text-[0.8125rem] tracking-[-0.005em]">
                          {t("previewTag")}
                        </p>
                      )}
                      <IssuerLogo logo={logo} className="size-[clamp(1.75rem,2.3vw,2.75rem)] shrink-0" />
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
