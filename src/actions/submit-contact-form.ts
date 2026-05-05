"use server"

import { render } from "@react-email/render"

import { CONSTANTS } from "~/src/constants"
import type { Locale } from "~/src/constants/types"

import { sendEmail } from "~/src/lib/utils"

import ContactEmail from "~/src/components/custom/contact-email"

export async function submitContactForm(data: { name: string; email: string; company?: string; details: string }, locale: Locale) {
  try {
    const html = await render(ContactEmail({ locale, ...data }))

    const companyText = data.company ? ` (${data.company})` : ""
    const subject = `New Contact Request from ${data.name}${companyText}`
    const text = `Name: ${data.name}\nCompany: ${data.company || "N/A"}\nEmail: ${data.email}\nDetails:\n${data.details}`

    return await sendEmail({
      to: CONSTANTS.EMAIL,
      from: { address: CONSTANTS.EMAIL, name: "pjborowiecki.com" },
      reply_to: { address: data.email, name: data.name },
      subject,
      html,
      text,
    })
  } catch (error) {
    console.error("Server Action Error in submitContactForm:", error)
    return {
      success: false,
      status: 500,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
