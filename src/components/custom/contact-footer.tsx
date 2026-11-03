"use client"

import type { JSX } from "react"

import { useTranslations } from "next-intl"

import { CONSTANTS } from "~/src/constants"

import { ArrowUpRightIcon } from "~/src/components/custom/icons"
import { NameMark } from "~/src/components/custom/name-mark"
import { RollText } from "~/src/components/custom/roll-text"

import { NAV_ITEMS } from "~/src/data"

const SERVICES = ["serviceAi", "serviceArchitecture", "serviceProduct", "serviceAdvisory"] as const
const COLUMN_HEAD = "type-label pb-3 text-champagne"
const COLUMN_LINK = "inline-block py-1 font-medium text-[clamp(0.9375rem,1vw,1.1875rem)] tracking-[-0.011em]"

export function ContactFooter(): JSX.Element {
  const t = useTranslations("custom.contact")
  const nav = useTranslations("custom.navbar")

  return (
    <footer className="relative z-10 text-cream">
      <div className="frame">
        {/* Phones: the line and address across the top, then the link columns side by side instead of one long list. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 border-border border-t pt-[clamp(1.75rem,3vw,3.5rem)] pb-[clamp(2.5rem,5vw,6rem)] md:grid-cols-12 md:gap-y-10">
          <div className="col-span-2 md:col-span-5">
            <p className="type-title max-w-[20ch] text-[clamp(1.625rem,2.5vw,3.5rem)] max-md:text-[1.5rem]">{t("footerLine")}</p>
            <a
              href={`mailto:${CONSTANTS.EMAIL}`}
              className="mt-[clamp(1rem,1.8vw,2rem)] inline-block border-champagne/70 border-b pb-0.5 font-medium text-[clamp(1rem,1.2vw,1.5rem)] text-champagne tracking-[-0.015em]"
            >
              <RollText>{CONSTANTS.EMAIL}</RollText>
            </a>
          </div>

          <nav aria-label={t("footerExplore")} className="row-span-2 md:col-span-2 md:col-start-7 md:row-span-1">
            <p className={COLUMN_HEAD}>{t("footerExplore")}</p>
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={COLUMN_LINK}>
                    <RollText>{nav(item.key)}</RollText>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2">
            <p className={COLUMN_HEAD}>{t("footerServices")}</p>
            <ul>
              {SERVICES.map((service) => (
                <li key={service}>
                  <a href="#skills" className={COLUMN_LINK}>
                    <RollText>{t(service)}</RollText>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className={COLUMN_HEAD}>{t("footerElsewhere")}</p>
            <ul>
              {CONSTANTS.SOCIAL_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group ${COLUMN_LINK} inline-flex items-center gap-1`}
                  >
                    <RollText>{link.name}</RollText>
                    <ArrowUpRightIcon className="size-[0.85em] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </li>
              ))}
              <li className={`${COLUMN_LINK} text-muted-foreground`}>{t("location")}</li>
            </ul>
          </div>
        </div>

        {/* The last thing on the page, resting on its bottom edge. Phones keep a margin below it for the browser's own
            bar, and let the copyright line sit there, level with the back-to-top button. */}
        <div className="flex flex-col">
          <p className="type-label pb-[clamp(0.75rem,1.4vw,1.5rem)] max-md:order-2 max-md:pt-5 max-md:pb-[calc(2rem+env(safe-area-inset-bottom))]">
            {t("copyright")}
          </p>
          <NameMark className="-mb-px block h-auto w-full overflow-visible max-md:order-1 max-md:mb-0" />
        </div>
      </div>
    </footer>
  )
}
