import type { JSX } from "react"

import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Tailwind, Text, pixelBasedPreset } from "react-email"
import { createTranslator } from "use-intl"

import type { SupportedLocale } from "~/src/integrations/use-intl/i18n.config"

import type { ContactMessage } from "~/src/lib/contact"

import type emailMessages from "~/messages/en-US/emails.contact-email.json"

export const CONTACT_EMAIL_NAMESPACE = "emails.contact-email"

const TAILWIND_CONFIG = { presets: [pixelBasedPreset] }

export const createContactEmailTranslator = ({ locale, messages }: { locale: SupportedLocale; messages: typeof emailMessages }) =>
  createTranslator({ locale, messages: { emails: { "contact-email": messages } }, namespace: CONTACT_EMAIL_NAMESPACE })

interface ContactEmailProps {
  readonly isSenderDomainVerified: boolean
  readonly message: ContactMessage
  readonly t: ReturnType<typeof createContactEmailTranslator>
}

export const ContactEmail = ({ isSenderDomainVerified, message, t }: ContactEmailProps): JSX.Element => (
  <Html lang={message.locale}>
    <Tailwind config={TAILWIND_CONFIG}>
      <Head />
      <Body className="bg-white font-sans text-gray-900">
        <Preview>{t("preview", { name: message.name })}</Preview>
        <Container className="mx-auto px-5 py-10">
          <Section>
            <Heading className="m-0 mb-4 text-2xl font-bold">{t("title")}</Heading>
            <Text className="text-base">
              <strong>{t("name")}</strong> {message.name}
            </Text>
            <Text className="text-base">
              <strong>{t("email")}</strong> {message.email}
            </Text>
            {!isSenderDomainVerified && <Text className="text-base text-amber-700">{t("unverifiedDomain")}</Text>}
            <Text className="text-base">
              <strong>{t("company")}</strong> {message.company === "" ? t("notProvided") : message.company}
            </Text>
            <Hr className="my-6 border-gray-300" />
            <Heading className="m-0 mb-4 text-xl font-bold">{t("details")}</Heading>
            <Text className="text-base whitespace-pre-wrap">{message.details}</Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
)
