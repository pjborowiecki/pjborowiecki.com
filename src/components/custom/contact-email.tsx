import type { JSX } from "react"

import { createTranslator } from "next-intl"
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Tailwind, Text } from "react-email"

import type { Locale } from "~/src/constants/types"

interface ContactEmailProps {
  locale: Locale
  name: string
  email: string
  company?: string
  details: string
}

export default async function ContactEmail({ locale, name, email, company, details }: Readonly<ContactEmailProps>): Promise<JSX.Element> {
  const { default: messages } = await import(`~/src/integrations/next-intl/messages/${locale}.json`)
  const t = createTranslator({ locale, messages, namespace: "emails.contact" })

  return (
    <Html>
      <Head />
      <Preview>{t("preview", { name })}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans text-gray-900">
          <Container className="mx-auto px-5 py-10">
            <Section>
              <Heading className="m-0 mb-4 font-bold text-2xl">{t("title")}</Heading>
              <Text className="text-base">
                <strong>{t("name")}</strong> {name}
              </Text>
              <Text className="text-base">
                <strong>{t("email")}</strong> {email}
              </Text>
              {company && (
                <Text className="text-base">
                  <strong>{t("company")}</strong> {company}
                </Text>
              )}
              <Hr className="my-6 border-gray-300" />
              <Heading className="m-0 mb-4 font-bold text-xl">{t("details")}</Heading>
              <Text className="whitespace-pre-wrap text-base">{details}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
