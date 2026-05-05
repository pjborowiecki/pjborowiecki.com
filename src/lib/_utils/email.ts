import { env } from "~/src/environment"

import type { RequireAtLeastOne } from "~/src/types/utilities"

type SendEmailProps = {
  to: string | string[]
  from: string | { address: string; name: string }
  reply_to?: string | { address: string; name: string }
  subject: string
} & RequireAtLeastOne<{ html: string; text: string }>
type SendEmailResult = { success: true; status: number } | { success: false; status: number; error: string }

export async function sendEmail(props: Readonly<SendEmailProps>): Promise<SendEmailResult> {
  if (!props.html?.trim() && !props.text?.trim()) {
    return { success: false, status: 400, error: "Missing body" }
  }

  try {
    const response = await fetch(env.CLOUDFLARE_EMAIL_SERVICE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(props),
    })

    if (!response.ok) throw new Error(await response.text())
    return { success: true, status: response.status }
  } catch (error) {
    console.error("[Email Error]:", error)
    return { success: false, status: 500, error: "Failed to send email." }
  }
}
