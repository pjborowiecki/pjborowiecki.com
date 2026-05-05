import type { Metadata } from "next"
import type { JSX } from "react"

import { getTranslations } from "next-intl/server"

import { AboutSection } from "~/src/components/custom/sections/about-section"
import { ContactSection } from "~/src/components/custom/sections/contact-section"
import { HeroSection } from "~/src/components/custom/sections/hero-section"
import { InsightsSection } from "~/src/components/custom/sections/insights-section"
import { PhilosophySection } from "~/src/components/custom/sections/philosophy-section"
import { SkillsSection } from "~/src/components/custom/sections/skills-section"
import { WorkSection } from "~/src/components/custom/sections/work-section"

export async function generateMetadata({ params }: Readonly<PageProps<"/[locale]">>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "landingPage" })

  return {
    description: t("metadata.description"),
  }
}

export default function LandingPage(): JSX.Element {
  return (
    <main className="relative z-10">
      <HeroSection />
      <AboutSection />
      <PhilosophySection />
      <WorkSection />
      <InsightsSection />
      <SkillsSection />
      <ContactSection />
    </main>
  )
}
