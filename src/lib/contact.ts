import { env } from "cloudflare:workers"

import { createElement } from "react"

import { mutationOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { render, toPlainText } from "react-email"
import { createTranslator } from "use-intl"
import { z } from "zod/v4"

import { I18N } from "~/src/integrations/use-intl/i18n.config"
import { loadNamespace } from "~/src/integrations/use-intl/i18n.messages"

import { CONTACT_BUDGETS, CONTACT_ERROR, CONTACT_NEEDS, CONTACT_VALIDATION_PARAMS } from "~/src/data/contact"
import { IP_ADDRESS_HEADER } from "~/src/data/http"

import { acceptsMail, emailDomain } from "~/src/lib/mail-exchange"

import type emailMessages from "~/messages/en-US/emails.contact-email.json"
import { APP_DOMAIN, CONTACT_EMAIL } from "~/src/presentation/branding"
import { CONTACT_EMAIL_NAMESPACE, ContactEmail } from "~/src/presentation/emails/contact-email"

const REQUIRED_LENGTH = 1
const UNKNOWN_CLIENT = "unknown"

const CONTACT_MUTATION_KEY = ["contact", "submit"] as const

export const contactFormSchema = z.object({
  budget: z.enum(CONTACT_BUDGETS).optional(),
  company: z.string().trim().max(CONTACT_VALIDATION_PARAMS.companyTooLong.max, "companyTooLong"),
  details: z.string().trim().min(REQUIRED_LENGTH, "detailsRequired").max(CONTACT_VALIDATION_PARAMS.detailsTooLong.max, "detailsTooLong"),
  email: z.email("emailRequired"),
  name: z.string().trim().min(REQUIRED_LENGTH, "nameRequired").max(CONTACT_VALIDATION_PARAMS.nameTooLong.max, "nameTooLong"),
  need: z.enum(CONTACT_NEEDS).optional(),
})

export const contactMessageSchema = contactFormSchema.extend({ locale: z.enum(I18N.SUPPORTED_LOCALES) })

export type ContactForm = z.input<typeof contactFormSchema>

export type ContactMessage = z.output<typeof contactMessageSchema>

const assertWithinRateLimit = async (request: Request): Promise<void> => {
  const { success } = await env.CONTACT_RATE_LIMIT.limit({ key: request.headers.get(IP_ADDRESS_HEADER) ?? UNKNOWN_CLIENT })

  if (!success) {
    throw new Error(CONTACT_ERROR.RATE_LIMITED)
  }
}

const assertDeliverableAddress = async (email: string): Promise<void> => {
  if (!(await acceptsMail(emailDomain(email)))) {
    throw new Error(CONTACT_ERROR.INVALID_EMAIL)
  }
}

const sendContactEmail = async (message: ContactMessage): Promise<void> => {
  const messages = await loadNamespace<typeof emailMessages>({ locale: message.locale, namespace: CONTACT_EMAIL_NAMESPACE })
  const t = createTranslator({
    locale: message.locale,
    messages: { emails: { "contact-email": messages } },
    namespace: CONTACT_EMAIL_NAMESPACE,
  })
  const html = await render(createElement(ContactEmail, { message, messages }))
  const subject =
    message.company === ""
      ? t("subject", { name: message.name })
      : t("subjectWithCompany", { company: message.company, name: message.name })

  try {
    await env.EMAIL.send({
      from: { email: CONTACT_EMAIL, name: APP_DOMAIN },
      html,
      replyTo: { email: message.email, name: message.name },
      subject,
      text: toPlainText(html),
      to: CONTACT_EMAIL,
    })
  } catch (error) {
    console.error("[contact] the enquiry could not be sent", error)
    throw new Error(CONTACT_ERROR.SEND_FAILED, { cause: error })
  }
}

export const submitContactMessage = createServerFn({ method: "POST" })
  .validator(contactMessageSchema)
  .handler(async ({ data }) => {
    await assertWithinRateLimit(getRequest())
    await assertDeliverableAddress(data.email)
    await sendContactEmail(data)
  })

export const submitContactMessageMutation = mutationOptions({
  mutationFn: (message: z.input<typeof contactMessageSchema>) => submitContactMessage({ data: message }),
  mutationKey: CONTACT_MUTATION_KEY,
})
