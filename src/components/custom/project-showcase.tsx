"use client"

import Image from "next/image"
import { type JSX, useRef } from "react"

import { useTranslations } from "next-intl"

import { gsap, MOTION_OK, useGSAP } from "~/src/lib/gsap"
import { cn } from "~/src/lib/utils"

import { ArrowRightIcon, StarIcon } from "~/src/components/custom/icons"

import type { Project } from "~/src/types"

/** A featured project also needs its copy in the messages under these ids, a tone below, and show-<id>-{main,back,phone}.webp. */
type FeaturedId = "marte" | "saasyland"

const PROOFS = ["Proof1", "Proof2", "Proof3"] as const
const FEATURES = ["Feature1", "Feature2", "Feature3", "Feature4"] as const
const COMPOSED = `${MOTION_OK} and (min-width: 900px) and (min-aspect-ratio: 11 / 10)`

// The left column uses four sizes and nothing else: name, statement, text, and the small labels.
const LABEL = "text-[clamp(0.8125rem,min(0.84vw,1.42svh),1.0625rem)] font-medium leading-[1.35] tracking-[-0.004em]"
const TEXT = "text-[clamp(0.9375rem,min(1vw,1.7svh),1.3125rem)] leading-[1.5] tracking-[-0.009em]"
const GAP = "mt-[clamp(1rem,3.4svh,3.25rem)]"

// Each project sits in its own world, taken from its own site. The top of each ground is the colour of the nav bar.
const TONES: Record<string, { ground: string; nav: string }> = {
  marte: {
    ground:
      "bg-[#1c120c] bg-[linear-gradient(to_bottom,#1c120c_var(--nav-bar-height),transparent_24%),radial-gradient(85%_95%_at_66%_40%,#8a5531_0%,#4d2e1a_44%,#1c120c_100%)] [--tone:#e6bd83]",
    nav: "bronze",
  },
  saasyland: {
    ground:
      "bg-[#0a1316] bg-[linear-gradient(to_bottom,#0a1316_var(--nav-bar-height),transparent_24%),radial-gradient(85%_95%_at_66%_38%,#176a70_0%,#0c3238_44%,#0a1316_100%)] [--tone:#62d6d0]",
    nav: "graphite",
  },
}

// The shadows are gradients, not blurred box-shadows: a 120px blur on a layer this size took 100ms to paint the first time it appeared.
function BrowserFrame({ alt, dim, sizes, src }: Readonly<{ alt: string; dim?: boolean; sizes: string; src: string }>): JSX.Element {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="absolute -inset-x-[7%] top-[14%] -bottom-[16%] bg-[radial-gradient(closest-side,rgb(0_0_0/62%)_35%,transparent)]"
      />
      <div className="relative overflow-hidden rounded-[clamp(0.4rem,0.7vw,0.9rem)] bg-[#17191d] ring-1 ring-white/14">
        <div aria-hidden className="flex h-[clamp(1rem,1.5vw,1.9rem)] items-center gap-[0.35vw] px-[0.8vw]">
          <span className="size-[clamp(0.3rem,0.45vw,0.6rem)] rounded-full bg-white/25" />
          <span className="size-[clamp(0.3rem,0.45vw,0.6rem)] rounded-full bg-white/25" />
          <span className="size-[clamp(0.3rem,0.45vw,0.6rem)] rounded-full bg-white/25" />
        </div>
        <div className="relative aspect-[16/10]">
          <Image fill src={src} alt={alt} sizes={sizes} quality={88} className="object-cover object-top" />
          {dim && <span aria-hidden className="absolute inset-0 bg-black/38" />}
        </div>
      </div>
    </div>
  )
}

export function ProjectShowcase({ onOpen, project }: Readonly<{ onOpen: () => void; project: Project }>): JSX.Element {
  const t = useTranslations("custom.work")
  const holdRef = useRef<HTMLDivElement>(null)
  const id = project.id as FeaturedId
  const tone = TONES[project.id] ?? TONES.saasyland
  const screen = (name: string) => `/images/site/show-${project.id}-${name}.webp`

  useGSAP(
    () => {
      const hold = holdRef.current
      if (!hold) return
      const q = gsap.utils.selector(hold)

      gsap.matchMedia().add(COMPOSED, () => {
        const main = q("[data-layer='main']")
        const back = q("[data-layer='back']")
        const phone = q("[data-layer='phone']")
        gsap.set([main, back, phone], { transformPerspective: 1800 })

        // The screens fan out of the dark as the panel arrives, then drift apart at different depths while it holds.
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: hold, start: "top bottom", end: "bottom bottom", scrub: true },
          })
          .fromTo(main, { y: "30svh", rotationY: -14, scale: 0.92 }, { y: 0, rotationY: 0, scale: 1, duration: 2, ease: "power2.out" }, 0)
          .fromTo(back, { y: "46svh", x: "10vw", rotationY: -18 }, { y: 0, x: 0, rotationY: 0, duration: 2.2, ease: "power2.out" }, 0)
          .fromTo(phone, { y: "60svh", rotationZ: -5 }, { y: 0, rotationZ: 0, duration: 2.3, ease: "power3.out" }, 0)
          .to(main, { y: "-2svh", duration: 1 }, 2.3)
          .to(back, { y: "3svh", duration: 1 }, 2.3)
          .to(phone, { y: "-7svh", duration: 1 }, 2.3)

        gsap.from(q("[data-rise]"), {
          y: 18,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.06,
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: hold, start: "top 45%", once: true },
        })

        // The proof counts up the first time it comes into view.
        for (const element of q<HTMLElement>("[data-proof]")) {
          const match = element.textContent?.match(/^(\D*)(\d+)(\D*)$/)
          if (!match || Number(match[2]) === 0) continue
          const [, before, value, after] = match
          const counter = { value: 0 }
          gsap.to(counter, {
            value: Number(value),
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => {
              element.textContent = `${before}${Math.round(counter.value)}${after}`
            },
            scrollTrigger: { trigger: hold, start: "top 45%", once: true },
          })
        }

        // The next project slides over this one, which steps back into the page.
        const next = hold.nextElementSibling
        if (next?.matches("[data-hold]")) {
          const scrollTrigger = { trigger: next, start: "top bottom", end: "top top", scrub: true }
          gsap.to(q("[data-panel]"), { scale: 0.93, ease: "none", scrollTrigger })
          gsap.fromTo(q("[data-dim]"), { opacity: 0 }, { opacity: 0.6, ease: "none", scrollTrigger })
        }

        if (!globalThis.matchMedia("(pointer: fine)").matches) return

        // Additive only: the composition is complete without it.
        const panel = q<HTMLElement>("[data-panel]")[0]
        const tilt = q("[data-tilt]")
        const toRotateY = gsap.quickTo(tilt, "rotationY", { duration: 1.2, ease: "power3" })
        const toRotateX = gsap.quickTo(tilt, "rotationX", { duration: 1.2, ease: "power3" })
        const depths = [
          { target: q("[data-depth='back']"), amount: -14 },
          { target: q("[data-depth='main']"), amount: 8 },
          { target: q("[data-depth='phone']"), amount: 26 },
        ].map(({ target, amount }) => ({
          amount,
          toX: gsap.quickTo(target, "x", { duration: 1.2, ease: "power3" }),
          toY: gsap.quickTo(target, "y", { duration: 1.2, ease: "power3" }),
        }))
        const point = (nx: number, ny: number) => {
          toRotateY(nx * 5)
          toRotateX(ny * -3)
          for (const depth of depths) {
            depth.toX(nx * depth.amount)
            depth.toY(ny * depth.amount * 0.6)
          }
        }
        const onMove = (event: PointerEvent) => point(event.clientX / innerWidth - 0.5, event.clientY / innerHeight - 0.5)
        const onLeave = () => point(0, 0)

        panel?.addEventListener("pointermove", onMove, { passive: true })
        panel?.addEventListener("pointerleave", onLeave)
        return () => {
          panel?.removeEventListener("pointermove", onMove)
          panel?.removeEventListener("pointerleave", onLeave)
        }
      })
    },
    { scope: holdRef },
  )

  return (
    <div ref={holdRef} data-hold data-nav-ground={tone.nav} className="relative cover:live:h-[150svh]">
      <div
        data-panel
        className={cn(
          "group relative cover:live:sticky cover:live:top-0 cover:h-svh cover:min-h-[38rem] overflow-hidden cover:pb-0 pb-8 text-cream cover:will-change-transform",
          tone.ground,
        )}
      >
        <div aria-hidden className="absolute inset-0 bg-[url(/images/site/grain.png)] bg-size-[220px_220px]" />

        <div className="frame relative z-20 pt-[calc(var(--nav-bar-height)+0.75rem)]">
          <div className="flex flex-wrap items-end gap-x-[clamp(1rem,1.5vw,2.25rem)] gap-y-2">
            <h3 className="type-display text-[clamp(2.75rem,min(7.4vw,14svh),11rem)]">{project.title}</h3>
            {project.github && (
              <p
                data-rise
                className="flex items-center gap-[0.35em] pb-[0.2em] font-display font-medium text-(--tone) text-[clamp(1.5rem,min(2.4vw,4.4svh),3.75rem)] leading-none tracking-[-0.03em]"
              >
                <StarIcon className="size-[0.82em]" />
                <span>{project.github.stars}</span>
                <span className={cn("ml-[0.35em] max-w-[6ch] text-cream/80", LABEL)}>{t("starsLabel")}</span>
              </p>
            )}
          </div>
        </div>

        {/* On the composed layout this leaves the flow, so the copy below follows straight on from the name. */}
        <div className="cover:absolute relative cover:inset-y-0 cover:right-0 cover:mt-0 mt-5 aspect-[6/5] cover:aspect-auto cover:w-[68vw] [perspective:1800px]">
          <div data-tilt className="absolute inset-0 cover:will-change-transform">
            <div
              data-layer="back"
              className="absolute cover:top-[8.5%] top-[4%] cover:right-[-14%] right-[-22%] cover:w-[60%] w-[66%] cover:will-change-transform"
            >
              <div data-depth="back">
                <div className="[transform:perspective(1800px)_rotateY(18deg)_rotateX(3deg)]">
                  <BrowserFrame dim src={screen("back")} alt="" sizes="(min-width: 900px) 42vw, 66vw" />
                </div>
              </div>
            </div>

            <div
              data-layer="main"
              className="absolute cover:top-[25%] top-[22%] cover:left-[18%] left-[20%] cover:w-[90%] w-[100%] cover:will-change-transform"
            >
              <div data-depth="main">
                <div className="[transform:perspective(1800px)_rotateY(10deg)_rotateX(3deg)]">
                  <BrowserFrame src={screen("main")} alt={`${project.title}: ${project.category}`} sizes="(min-width: 900px) 62vw, 100vw" />
                </div>
              </div>
            </div>

            <div
              data-layer="phone"
              className="absolute bottom-[2%] cover:bottom-[6%] cover:left-[6%] left-[3%] cover:w-[17%] w-[26%] cover:will-change-transform"
            >
              <div data-depth="phone">
                <div className="relative [transform:perspective(1800px)_rotateY(6deg)_rotateX(2deg)]">
                  <span
                    aria-hidden
                    className="absolute -inset-x-[16%] top-[8%] -bottom-[8%] bg-[radial-gradient(closest-side,rgb(0_0_0/70%)_30%,transparent)]"
                  />
                  <div className="relative overflow-hidden rounded-[clamp(0.9rem,1.9vw,2.6rem)] bg-black ring-[#0b0c0e] ring-[clamp(2px,0.32vw,5px)]">
                    <div className="relative aspect-[390/844]">
                      <Image
                        fill
                        src={screen("phone")}
                        alt=""
                        sizes="(min-width: 900px) 12vw, 26vw"
                        quality={88}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 cover:mt-[clamp(1rem,4.2svh,3.75rem)] mt-6 cover:w-[calc(29vw+var(--gutter))] px-(--gutter) cover:pr-0">
          <div
            data-rise
            className={cn("flex items-baseline justify-between gap-4 border-cream/18 border-b pb-[clamp(0.5rem,1.1svh,0.9rem)]", LABEL)}
          >
            <span className="text-(--tone)">{t(`${id}Tag`)}</span>
            <span className="text-cream/60 tabular-nums">{project.year}</span>
          </div>

          <p
            data-rise
            className="mt-[clamp(0.75rem,2svh,1.75rem)] text-balance font-display font-normal text-[clamp(1.375rem,min(2.1vw,3.5svh),3.25rem)] leading-[1.14] tracking-[-0.022em]"
          >
            {t(`${id}Headline`)}
          </p>
          <p data-rise className={cn("mt-[clamp(0.5rem,1.3svh,1.1rem)] text-pretty text-cream/68", TEXT)}>
            {t(`${id}Body`)}
          </p>

          <dl data-rise className={cn("border-cream/18 border-t", GAP)}>
            {FEATURES.map((feature) => (
              <div
                key={feature}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,3fr)] gap-x-4 border-cream/18 border-b py-[clamp(0.4rem,1.2svh,1.15rem)]"
              >
                <dt className={cn("pt-[0.1em] text-cream/55", LABEL)}>{t(`${id}${feature}Label`)}</dt>
                <dd className={cn("text-pretty text-cream leading-[1.35]!", TEXT)}>{t(`${id}${feature}Value`)}</dd>
              </div>
            ))}
          </dl>

          <dl data-rise className={cn("showcase-proof grid grid-cols-3 gap-x-4", GAP)}>
            {PROOFS.map((proof) => (
              <div key={proof} className="flex flex-col-reverse gap-[0.45em]">
                <dt className={cn("text-cream/60", LABEL)}>{t(`${id}${proof}Label`)}</dt>
                <dd
                  data-proof
                  className="font-display text-[clamp(1.5rem,min(2.1vw,3.6svh),3.25rem)] tabular-nums leading-none tracking-[-0.03em]"
                >
                  {t(`${id}${proof}Value`)}
                </dd>
              </div>
            ))}
          </dl>

          <span
            data-rise
            className={cn(
              "inline-flex items-center gap-3 bg-cream px-5 py-[clamp(0.55rem,1.3svh,0.95rem)] font-medium text-[#14100c] text-[clamp(0.9375rem,0.95vw,1.125rem)] tracking-[-0.01em]",
              GAP,
            )}
          >
            {t("readCaseStudy")}
            <ArrowRightIcon className="size-[1.15em] transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </span>
        </div>

        <div data-dim aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-black opacity-0" />

        <button
          type="button"
          data-cursor={t("view")}
          aria-label={`${t("readCaseStudy")}: ${project.title}`}
          onClick={onOpen}
          className="absolute inset-0 z-40 cursor-pointer focus-visible:outline-offset-[-6px]"
        />
      </div>
    </div>
  )
}
