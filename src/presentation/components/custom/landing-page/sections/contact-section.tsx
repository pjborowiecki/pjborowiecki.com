import type { JSX } from "react"

import { useTranslations } from "use-intl/react"

import { NAV_GROUND, SECTION_IDS } from "~/src/data/marketing"

import { Footer } from "~/src/presentation/components/custom/footer"
import { ContactForm } from "~/src/presentation/components/custom/landing-page/components/contact-form"
import { Reveal } from "~/src/presentation/components/custom/landing-page/components/reveal"
import { SplitHeading } from "~/src/presentation/components/custom/landing-page/components/split-heading"

export const ContactSection = (): JSX.Element => {
  const t = useTranslations("pages.landing.contact")

  return (
    <section
      className="ground-lit relative z-10 overflow-hidden ground-emerald pt-[calc(var(--nav-height)+clamp(1rem,3vw,3.5rem))]"
      data-nav-ground={NAV_GROUND.LIT}
      id={SECTION_IDS.CONTACT}
    >
      <div className="relative frame grid gap-y-10 pb-[clamp(2.5rem,5vw,6rem)] md:grid-cols-12 md:gap-x-6">
        <div className="flex flex-col justify-between gap-10 md:col-span-5">
          <div>
            <Reveal variant="slide-right">
              <p className="type-label text-champagne">{t("label")}</p>
            </Reveal>
            <SplitHeading className="mt-4 type-display text-[clamp(3.25rem,7.6vw,11rem)] text-cream max-md:text-[2.75rem]">
              {t("start")}
            </SplitHeading>
            <Reveal className="mt-[clamp(1.25rem,2.4vw,2.75rem)]">
              <p className="max-w-[30ch] type-lead text-[clamp(1.1875rem,1.65vw,2.125rem)] text-cream">{t("interested")}</p>
            </Reveal>
          </div>
        </div>

        <Reveal className="md:col-span-7" variant="scale-in">
          <div className="surface-paper p-[clamp(1.5rem,3vw,4rem)] shadow-[0_50px_100px_-50px_rgb(0_0_0/65%)] max-sm:p-5" data-light-ground>
            <div className="flex items-baseline justify-between gap-6 border-b border-foreground pb-3">
              <h3 className="type-title text-[clamp(1.5rem,2.2vw,3rem)]">{t("formTitle")}</h3>
              <p className="hidden type-label sm:block">{t("formNote")}</p>
            </div>
            <ContactForm />
          </div>
        </Reveal>
      </div>

      <Footer />
    </section>
  )
}
