import { type JSX, type RefObject, useEffect, useRef } from "react"

import { useTranslations } from "use-intl/react"

import { MOTION_OK, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { NAV_ITEMS, SECTION_IDS, sectionHref } from "~/src/data/marketing"

import { ArrowRightIcon, ArrowUpRightIcon } from "~/src/presentation/components/custom/icons"
import { CtaLink } from "~/src/presentation/components/custom/landing-page/components/cta-link"
import { NameMark } from "~/src/presentation/components/custom/landing-page/components/name-mark"

import { CONTACT_EMAIL, SOCIAL_PROFILES } from "~/src/presentation/branding"

const HALF = 2
const DIAMETER_PER_RADIUS = 2
const OPEN_SPEED = 1
const CLOSE_SPEED = 1.7

const MENU_AT = { disc: 0, foot: 0.62, glow: 0.3, name: 0.58, rule: 0.3, word: 0.32 } as const

interface MobileMenuProps {
  readonly isOpen: boolean
  readonly onClosed: () => void
  readonly onNavigate: () => void
  readonly originRef: RefObject<HTMLButtonElement | null>
}

const growDiscFrom = (disc: HTMLElement, origin: HTMLElement | null): void => {
  const button = origin?.getBoundingClientRect()
  const centreX = button ? button.left + button.width / HALF : globalThis.innerWidth
  const centreY = button ? button.top + button.height / HALF : 0
  const radius = Math.hypot(Math.max(centreX, globalThis.innerWidth - centreX), Math.max(centreY, globalThis.innerHeight - centreY))
  const diameter = `${radius * DIAMETER_PER_RADIUS}px`

  disc.style.width = diameter
  disc.style.height = diameter
  disc.style.left = `${centreX - radius}px`
  disc.style.top = `${centreY - radius}px`
}

const buildMenuTimeline = (disc: HTMLElement | null, onReverseComplete: () => void): gsap.core.Timeline =>
  gsap
    .timeline({ defaults: { ease: "expo.out" }, onReverseComplete, paused: true })
    .fromTo(disc, { scale: 0 }, { duration: 0.85, ease: "power3.inOut", scale: 1 }, MENU_AT.disc)
    .fromTo("[data-menu-glow]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: "power2.out" }, MENU_AT.glow)
    .fromTo("[data-menu-rule]", { scaleX: 0 }, { duration: 0.9, scaleX: 1, stagger: 0.05 }, MENU_AT.rule)
    .fromTo("[data-menu-word]", { yPercent: 115 }, { duration: 0.9, stagger: 0.05, yPercent: 0 }, MENU_AT.word)
    .fromTo(
      "[data-menu-foot]",
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, duration: 0.7, ease: "power3.out", stagger: 0.07, y: 0 },
      MENU_AT.foot,
    )
    .fromTo("[data-menu-name]", { yPercent: 105 }, { duration: 1, yPercent: 0 }, MENU_AT.name)

const MenuLinks = ({ onNavigate }: { readonly onNavigate: () => void }): JSX.Element => {
  const t = useTranslations("components.custom.navigation")

  return (
    <nav aria-label={t("primaryNav")} className="[--ring:var(--cream)]">
      <ul>
        {NAV_ITEMS.map((item) => (
          <li className="relative overflow-hidden" key={item.key}>
            <a
              className="flex items-center justify-between gap-4 py-[clamp(0.45rem,1.35svh,0.95rem)] transition-colors duration-200 active:text-champagne data-active:text-champagne"
              data-nav={sectionHref(item.section)}
              href={sectionHref(item.section)}
              onClick={onNavigate}
            >
              <span className="block type-display text-[min(10.6vw,6.2svh)] leading-[1.06]!" data-menu-word>
                {t(`items.${item.key}`)}
              </span>
              <span className="block" data-menu-word>
                <ArrowRightIcon className="size-[min(5.6vw,3.2svh)]" />
              </span>
            </a>
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left bg-cream/22" data-menu-rule />
          </li>
        ))}
      </ul>
    </nav>
  )
}

const MenuFoot = ({ onNavigate }: { readonly onNavigate: () => void }): JSX.Element => {
  const t = useTranslations("components.custom.navigation")

  return (
    <div className="mt-[clamp(1rem,3.2svh,2.25rem)] [--cta-bg:var(--cream)] [--cta-hover:var(--champagne)] [--cta-ink:#0d1526] [--ring:var(--cream)]">
      <div data-menu-foot>
        <CtaLink className="w-full justify-between" href={sectionHref(SECTION_IDS.CONTACT)} onClick={onNavigate}>
          {t("letsTalk")}
        </CtaLink>
      </div>
      <div
        className="mt-[clamp(0.75rem,2svh,1.25rem)] flex flex-wrap items-center justify-between gap-x-5 gap-y-1 text-[0.9375rem] font-medium tracking-[-0.01em]"
        data-menu-foot
      >
        <a className="py-1 text-champagne" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        <div className="flex gap-4">
          {SOCIAL_PROFILES.map((link) => (
            <a className="inline-flex items-center gap-1 py-1" href={link.url} key={link.name} rel="noopener noreferrer" target="_blank">
              {link.name}
              <ArrowUpRightIcon className="size-[0.85em]" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export const MobileMenu = ({ isOpen, onClosed, onNavigate, originRef }: MobileMenuProps): JSX.Element => {
  const rootRef = useRef<HTMLDivElement>(null)
  const discRef = useRef<HTMLSpanElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | undefined>(undefined)
  const onClosedRef = useRef(onClosed)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    onClosedRef.current = onClosed
  }, [onClosed])

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        timelineRef.current = buildMenuTimeline(discRef.current, () => {
          gsap.set(rootRef.current, { autoAlpha: 0 })
          onClosedRef.current()
        })

        return () => {
          timelineRef.current = undefined
        }
      })
    },
    { scope: rootRef },
  )

  useEffect(() => {
    const root = rootRef.current
    const disc = discRef.current

    if (!root || !disc) {
      return
    }

    if (isOpen) {
      wasOpenRef.current = true
      growDiscFrom(disc, originRef.current)
      gsap.set(root, { autoAlpha: 1 })
      timelineRef.current?.timeScale(OPEN_SPEED).play()

      return
    }

    if (!wasOpenRef.current) {
      return
    }

    wasOpenRef.current = false

    if (timelineRef.current) {
      timelineRef.current.timeScale(CLOSE_SPEED).reverse()
    } else {
      gsap.set(root, { autoAlpha: 0 })
      onClosedRef.current()
    }
  }, [isOpen, originRef])

  return (
    <div
      aria-hidden={!isOpen}
      className="invisible fixed inset-0 overflow-hidden text-cream opacity-0 lg:hidden"
      id="mobile-menu"
      inert={!isOpen}
      ref={rootRef}
    >
      <span aria-hidden className="absolute rounded-full bg-[#084f3a] will-change-transform" ref={discRef} />
      <span aria-hidden className="absolute inset-0 bg-[radial-gradient(95%_55%_at_78%_16%,#16855f_0%,transparent_100%)]" data-menu-glow />

      <div className="relative flex h-dvh flex-col px-(--gutter) pt-[calc(var(--nav-bar-height)+clamp(0.5rem,2.4svh,1.75rem))]">
        <MenuLinks onNavigate={onNavigate} />
        <MenuFoot onNavigate={onNavigate} />

        <div className="mt-auto overflow-hidden pt-3 pb-[clamp(0.75rem,2svh,1.25rem)]">
          <div data-menu-name>
            <NameMark className="block h-auto w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
