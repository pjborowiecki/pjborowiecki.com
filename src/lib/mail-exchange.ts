import { z } from "zod/v4"

const DNS_OVER_HTTPS = "https://cloudflare-dns.com/dns-query"
const DNS_JSON = "application/dns-json"
const LOOKUP_TIMEOUT_MS = 2000

const DNS_STATUS_NO_ERROR = 0
const DNS_RECORD_TYPE_MX = 15
const NULL_MX_EXCHANGE = "."
const DOMAIN_SEPARATOR = "@"

const dnsRecordSchema = z.object({ data: z.string(), type: z.number() })

const dnsAnswerSchema = z.object({
  Answer: z.array(dnsRecordSchema).default([]),
  Status: z.number(),
})

const exchangeOf = (record: string): string => record.slice(record.lastIndexOf(" ") + " ".length)

const isMailExchange = ({ data, type }: z.infer<typeof dnsRecordSchema>): boolean =>
  type === DNS_RECORD_TYPE_MX && exchangeOf(data) !== NULL_MX_EXCHANGE

export const emailDomain = (email: string): string =>
  email.slice(email.lastIndexOf(DOMAIN_SEPARATOR) + DOMAIN_SEPARATOR.length).toLowerCase()

export const acceptsMail = async (domain: string): Promise<boolean> => {
  const url = new URL(DNS_OVER_HTTPS)
  url.searchParams.set("name", domain)
  url.searchParams.set("type", "MX")

  try {
    const response = await fetch(url, { headers: { accept: DNS_JSON }, signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS) })
    const { Answer, Status } = dnsAnswerSchema.parse(await response.json())

    return Status === DNS_STATUS_NO_ERROR && Answer.some((record) => isMailExchange(record))
  } catch {
    return true
  }
}
