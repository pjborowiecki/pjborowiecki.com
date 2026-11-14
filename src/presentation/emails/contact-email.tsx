import type { JSX } from "react"

import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Tailwind, Text, pixelBasedPreset } from "react-email"
import { createTranslator } from "use-intl"

import type { ContactMessage } from "~/src/lib/contact"

import type emailMessages from "~/messages/en-US/emails.contact-email.json"

export const CONTACT_EMAIL_NAMESPACE = "emails.contact-email"

const TAILWIND_CONFIG = { presets: [pixelBasedPreset] }

interface ContactEmailProps {
  readonly message: ContactMessage
  readonly messages: typeof emailMessages
}

export const ContactEmail = ({ message, messages }: ContactEmailProps): JSX.Element => {
  const t = createTranslator({
    locale: message.locale,
    messages: { emails: { "contact-email": messages } },
    namespace: "emails.contact-email",
  })

  return (
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
}
