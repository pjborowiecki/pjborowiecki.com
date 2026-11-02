"use client"

import { type JSX, type RefObject, useEffect, useRef } from "react"

import { useTranslations } from "next-intl"

import { CONSTANTS } from "~/src/constants"

import { gsap, MOTION_OK, useGSAP } from "~/src/lib/gsap"

import { CtaLink } from "~/src/components/custom/cta-link"
import { ArrowRightIcon, ArrowUpRightIcon } from "~/src/components/custom/icons"
import { NameMark } from "~/src/components/custom/name-mark"

import { NAV_ITEMS } from "~/src/data"

interface MobileMenuProps {
  onClosed: () => void
  onNavigate: () => void
  open: boolean
  originRef: RefObject<HTMLButtonElement | null>
}

/** Emerald grows out of the menu button until it fills the screen. The rules draw across, the links rise, and the name lands at the bottom. */
export function MobileMenu({ onClosed, onNavigate, open, originRef }: Readonly<MobileMenuProps>): JSX.Element {
  const t = useTranslations("custom.navbar")
  const rootRef = useRef<HTMLDivElement>(null)
  const discRef = useRef<HTMLSpanElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const onClosedRef = useRef(onClosed)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    onClosedRef.current = onClosed
  }, [onClosed])

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        timelineRef.current = gsap
          .timeline({
            paused: true,
            defaults: { ease: "expo.out" },
            onReverseComplete: () => {
              gsap.set(rootRef.current, { autoAlpha: 0 })
              onClosedRef.current()
            },
          })
          .fromTo(discRef.current, { scale: 0 }, { scale: 1, duration: 0.85, ease: "power3.inOut" }, 0)
          .fromTo("[data-menu-glow]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: "power2.out" }, 0.3)
          .fromTo("[data-menu-rule]", { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.05 }, 0.3)
          .fromTo("[data-menu-word]", { yPercent: 115 }, { yPercent: 0, duration: 0.9, stagger: 0.05 }, 0.32)
          .fromTo(
            "[data-menu-foot]",
            { y: 18, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.07, ease: "power3.out" },
            0.62,
          )
          .fromTo("[data-menu-name]", { yPercent: 105 }, { yPercent: 0, duration: 1 }, 0.58)

        return () => {
          timelineRef.current = null
        }
      })
    },
    { scope: rootRef },
  )

  useEffect(() => {
    const root = rootRef.current
    const disc = discRef.current
    if (!root || !disc) return

    if (open) {
      wasOpenRef.current = true
      // The disc starts on the button and is big enough to reach the farthest corner.
      const button = originRef.current?.getBoundingClientRect()
      const x = button ? button.left + button.width / 2 : globalThis.innerWidth
      const y = button ? button.top + button.height / 2 : 0
      const radius = Math.hypot(Math.max(x, globalThis.innerWidth - x), Math.max(y, globalThis.innerHeight - y))
      disc.style.width = `${radius * 2}px`
      disc.style.height = `${radius * 2}px`
      disc.style.left = `${x - radius}px`
      disc.style.top = `${y - radius}px`

      gsap.set(root, { autoAlpha: 1 })
      timelineRef.current?.timeScale(1).play()
      return
    }

    if (!wasOpenRef.current) return
    wasOpenRef.current = false
    if (timelineRef.current) {
      timelineRef.current.timeScale(1.7).reverse()
    } else {
      gsap.set(root, { autoAlpha: 0 })
      onClosedRef.current()
    }
  }, [open, originRef])

  return (
    <div
      ref={rootRef}
      id="mobile-menu"
      aria-hidden={!open}
      inert={!open}
      className="invisible fixed inset-0 overflow-hidden text-cream opacity-0 lg:hidden"
    >
      <span ref={discRef} aria-hidden className="absolute rounded-full bg-[#084f3a] will-change-transform" />
      <span aria-hidden data-menu-glow className="absolute inset-0 bg-[radial-gradient(95%_55%_at_78%_16%,#16855f_0%,transparent_100%)]" />

      <div className="relative flex h-dvh flex-col px-(--gutter) pt-[calc(var(--nav-bar-height)+clamp(0.5rem,2.4svh,1.75rem))]">
        <nav aria-label={t("primaryNav")} className="[--ring:var(--cream)]">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="relative overflow-hidden">
                <a
                  href={item.href}
                  data-nav={item.href}
                  onClick={onNavigate}
                  className="flex items-center justify-between gap-4 py-[clamp(0.45rem,1.35svh,0.95rem)] transition-colors duration-200 active:text-champagne data-active:text-champagne"
                >
                  <span data-menu-word className="type-display block text-[min(10.6vw,6.2svh)] leading-[1.06]!">
                    {t(item.key)}
                  </span>
                  <span data-menu-word className="block">
                    <ArrowRightIcon className="size-[min(5.6vw,3.2svh)]" />
                  </span>
                </a>
                <span data-menu-rule aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left bg-cream/22" />
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-[clamp(1rem,3.2svh,2.25rem)] [--cta-bg:var(--cream)] [--cta-hover:var(--champagne)] [--cta-ink:#0d1526] [--ring:var(--cream)]">
          <div data-menu-foot>
            <CtaLink href="#contact" onClick={onNavigate} className="w-full justify-between">
              {t("letsTalk")}
            </CtaLink>
          </div>
          <div
            data-menu-foot
            className="mt-[clamp(0.75rem,2svh,1.25rem)] flex flex-wrap items-center justify-between gap-x-5 gap-y-1 font-medium text-[0.9375rem] tracking-[-0.01em]"
          >
            <a href={`mailto:${CONSTANTS.EMAIL}`} className="py-1 text-champagne">
              {CONSTANTS.EMAIL}
            </a>
            <div className="flex gap-4">
              {CONSTANTS.SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 py-1"
                >
                  {link.name}
                  <ArrowUpRightIcon className="size-[0.85em]" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto overflow-hidden pt-3 pb-[clamp(0.75rem,2svh,1.25rem)]">
          <div data-menu-name>
            <NameMark className="block h-auto w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
