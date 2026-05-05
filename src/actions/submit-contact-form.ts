"use server"

import { request } from "@arcjet/next"
import { render } from "@react-email/render"

import { CONSTANTS } from "~/src/constants"
import type { Locale } from "~/src/constants/types"

import { aj } from "~/src/integrations/arcjet/arcjet.config"

import { sendEmail } from "~/src/lib/utils"

import ContactEmail from "~/src/components/custom/contact-email"

export async function submitContactForm(data: { name: string; email: string; company?: string; details: string }, locale: Locale) {
  const req = await request()
  const decision = await aj.protect(req, { email: data.email })

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) return { success: false, status: 429, error: CONSTANTS.ERRORS.RATE_LIMIT }
    if (decision.reason.isEmail()) return { success: false, status: 400, error: CONSTANTS.ERRORS.INVALID_EMAIL }
    return { success: false, status: 403, error: CONSTANTS.ERRORS.SECURITY_BLOCKED }
  }

  const html = await render(ContactEmail({ locale, ...data }))
  const companyText = data.company ? ` (${data.company})` : ""

  return sendEmail({
    to: CONSTANTS.EMAIL,
    from: { address: CONSTANTS.EMAIL, name: "pjborowiecki.com" },
    reply_to: { address: data.email, name: data.name },
    subject: `New Contact Request from ${data.name}${companyText}`,
    text: `Name: ${data.name}\nCompany: ${data.company || "N/A"}\nEmail: ${data.email}\nDetails:\n${data.details}`,
    html,
  })
}
