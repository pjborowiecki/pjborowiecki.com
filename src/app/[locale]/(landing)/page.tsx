import type { Metadata } from "next"
import type { JSX } from "react"

import { getTranslations } from "next-intl/server"

import { AboutSection } from "~/src/components/custom/sections/about-section"
import { AiSection } from "~/src/components/custom/sections/ai-section"
import { CertificationsSection } from "~/src/components/custom/sections/certifications-section"
import { ConsultSection } from "~/src/components/custom/sections/consult-section"
import { ContactSection } from "~/src/components/custom/sections/contact-section"
import { HeroSection } from "~/src/components/custom/sections/hero-section"
import { InsightsSection } from "~/src/components/custom/sections/insights-section"
import { OfferSection } from "~/src/components/custom/sections/offer-section"
import { PersonSection } from "~/src/components/custom/sections/person-section"
import { PhilosophySection } from "~/src/components/custom/sections/philosophy-section"
import { PricingSection } from "~/src/components/custom/sections/pricing-section"
import { SkillsSection } from "~/src/components/custom/sections/skills-section"
import { WorkSection } from "~/src/components/custom/sections/work-section"

export async function generateMetadata({ params }: Readonly<PageProps<"/[locale]">>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "landingPage" })

  return {
    title: { absolute: t("metadata.title") },
    description: t("metadata.description"),
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      type: "profile",
      images: [{ url: "/images/promo/social/pjborowiecki-og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
  }
}

export default function LandingPage(): JSX.Element {
  return (
    <main className="relative">
      <HeroSection />
      <AboutSection />
      <PhilosophySection />
      <SkillsSection />
      <AiSection />
      <PersonSection />
      {/* Preview deployments show the certificates still in progress; production waits for each verification link. */}
      <CertificationsSection includeUnverified={process.env.VERCEL_ENV === "preview"} />
      <WorkSection />
      <ConsultSection />
      <InsightsSection />
      <OfferSection />
      <PricingSection />
      <ContactSection />
    </main>
  )
}
