import type { JSX } from "react"

import { createFileRoute } from "@tanstack/react-router"

import { loadPageMetadata, preloadNamespaces } from "~/src/integrations/use-intl/i18n.messages"
import { getCurrentLocale } from "~/src/integrations/use-intl/i18n.utils"

import { pageHead } from "~/src/lib/seo"

import { AboutSection } from "~/src/presentation/components/custom/landing-page/sections/about-section"
import { AiSection } from "~/src/presentation/components/custom/landing-page/sections/ai-section"
import { CertificationsSection } from "~/src/presentation/components/custom/landing-page/sections/certifications-section"
import { ContactSection } from "~/src/presentation/components/custom/landing-page/sections/contact-section"
import { HeroSection } from "~/src/presentation/components/custom/landing-page/sections/hero-section"
import { PersonSection } from "~/src/presentation/components/custom/landing-page/sections/person-section"
import { PhilosophySection } from "~/src/presentation/components/custom/landing-page/sections/philosophy-section"
import { SkillsSection } from "~/src/presentation/components/custom/landing-page/sections/skills-section"
import { WorkSection } from "~/src/presentation/components/custom/landing-page/sections/work-section"

import { ROUTES } from "~/src/routes"

const LandingPage = (): JSX.Element => (
  <>
    <HeroSection />
    <AboutSection />
    <PhilosophySection />
    <SkillsSection />
    <AiSection />
    <PersonSection />
    <CertificationsSection />
    <WorkSection />
    <ContactSection />
  </>
)

const NAMESPACE = "pages.landing"

export const Route = createFileRoute("/_landing/")({
  component: LandingPage,
  head: pageHead(ROUTES.HOME),
  loader: async ({ context }) => {
    const locale = getCurrentLocale()
    const [metadata] = await Promise.all([
      loadPageMetadata({ locale, namespace: NAMESPACE }),
      preloadNamespaces({ locale, namespaces: [NAMESPACE], queryClient: context.queryClient }),
    ])
    return { locale, metadata }
  },
  staticData: { namespaces: [NAMESPACE] },
})
