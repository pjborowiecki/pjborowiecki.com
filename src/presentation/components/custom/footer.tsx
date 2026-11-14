import type { JSX } from "react"

import { useTranslations } from "use-intl/react"

import { NAV_ITEMS, SECTION_IDS, sectionHref } from "~/src/data/marketing"

import { ArrowUpRightIcon } from "~/src/presentation/components/custom/icons"
import { NameMark } from "~/src/presentation/components/custom/landing-page/components/name-mark"
import { RollText } from "~/src/presentation/components/custom/landing-page/components/roll-text"

import { CONTACT_EMAIL, SOCIAL_PROFILES } from "~/src/presentation/branding"

const SERVICES = ["serviceAi", "serviceArchitecture", "serviceProduct", "serviceAdvisory"] as const
const COLUMN_HEAD = "type-label pb-3 text-champagne"
const COLUMN_LINK = "inline-block py-1 font-medium text-[clamp(0.9375rem,1vw,1.1875rem)] tracking-[-0.011em]"

export const Footer = (): JSX.Element => {
  const t = useTranslations()

  return (
    <footer className="relative z-10 text-cream">
      <div className="frame">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 border-t border-border pt-[clamp(1.75rem,3vw,3.5rem)] pb-[clamp(2.5rem,5vw,6rem)] md:grid-cols-12 md:gap-y-10">
          <div className="col-span-2 md:col-span-5">
            <p className="max-w-[20ch] type-title text-[clamp(1.625rem,2.5vw,3.5rem)] max-md:text-[1.5rem]">
              {t("components.custom.footer.footerLine")}
            </p>
            <a
              className="mt-[clamp(1rem,1.8vw,2rem)] inline-block border-b border-champagne/70 pb-0.5 text-[clamp(1rem,1.2vw,1.5rem)] font-medium tracking-[-0.015em] text-champagne"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              <RollText>{CONTACT_EMAIL}</RollText>
            </a>
          </div>

          <nav aria-label={t("components.custom.footer.footerExplore")} className="row-span-2 md:col-span-2 md:col-start-7 md:row-span-1">
            <p className={COLUMN_HEAD}>{t("components.custom.footer.footerExplore")}</p>
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <a className={COLUMN_LINK} href={sectionHref(item.section)}>
                    <RollText>{t(`components.custom.navigation.items.${item.key}`)}</RollText>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2">
            <p className={COLUMN_HEAD}>{t("components.custom.footer.footerServices")}</p>
            <ul>
              {SERVICES.map((service) => (
                <li key={service}>
                  <a className={COLUMN_LINK} href={sectionHref(SECTION_IDS.SKILLS)}>
                    <RollText>{t(`components.custom.footer.${service}`)}</RollText>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className={COLUMN_HEAD}>{t("components.custom.footer.footerElsewhere")}</p>
            <ul>
              {SOCIAL_PROFILES.map((link) => (
                <li key={link.name}>
                  <a
                    className={`group ${COLUMN_LINK} inline-flex items-center gap-1`}
                    href={link.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <RollText>{link.name}</RollText>
                    <ArrowUpRightIcon className="size-[0.85em] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </li>
              ))}
              <li className={`${COLUMN_LINK} text-muted-foreground`}>{t("components.custom.footer.location")}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col">
          <p className="pb-[clamp(0.75rem,1.4vw,1.5rem)] type-label max-md:order-2 max-md:pt-5 max-md:pb-[calc(2rem+env(safe-area-inset-bottom))]">
            {t("components.custom.footer.copyright")}
          </p>
          <NameMark className="-mb-px block h-auto w-full overflow-visible max-md:order-1 max-md:mb-0" />
        </div>
      </div>
    </footer>
  )
}
