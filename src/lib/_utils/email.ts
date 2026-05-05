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
    return { success: false, status: 400, error: "sendEmail requires a non-empty html or text body" }
  }

  const response = await fetch(env.CLOUDFLARE_EMAIL_SERVICE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(props),
  }).catch((error: unknown) => {
    return error instanceof Error ? error : new Error(String(error))
  })

  if (response instanceof Error) {
    return { success: false, status: 500, error: `Network error: ${response.message}` }
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unparseable error response")
    console.error(`[Cloudflare Email API Error] Status: ${response.status}, Body: ${errorText}`)
    return { success: false, status: response.status, error: "Failed to send email due to an API error." }
  }

  return { success: true, status: response.status }
}
