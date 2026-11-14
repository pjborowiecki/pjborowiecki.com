import { z } from "~/src/integrations/zod/zod.config"

const DNS_OVER_HTTPS_RESOLVERS = ["https://cloudflare-dns.com/dns-query", "https://dns.google/resolve"] as const
const DNS_JSON = "application/dns-json"
const LOOKUP_TIMEOUT_MS = 2000

const DNS_STATUS_NO_ERROR = 0
const DNS_RECORD_TYPE_MX = 15
const NULL_MX_EXCHANGE = "."
const DOMAIN_SEPARATOR = "@"

export const MAIL_EXCHANGE = {
  ACCEPTS: "accepts",
  REFUSES: "refuses",
  UNKNOWN: "unknown",
} as const

export type MailExchangeVerdict = (typeof MAIL_EXCHANGE)[keyof typeof MAIL_EXCHANGE]

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

const askResolver = async (resolver: string, domain: string): Promise<MailExchangeVerdict> => {
  const url = new URL(resolver)
  url.searchParams.set("name", domain)
  url.searchParams.set("type", "MX")

  try {
    const response = await fetch(url, { headers: { accept: DNS_JSON }, signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS) })
    const { Answer, Status } = dnsAnswerSchema.parse(await response.json())

    return Status === DNS_STATUS_NO_ERROR && Answer.some((record) => isMailExchange(record)) ? MAIL_EXCHANGE.ACCEPTS : MAIL_EXCHANGE.REFUSES
  } catch {
    return MAIL_EXCHANGE.UNKNOWN
  }
}

const firstAnswer = async ([resolver, ...fallbacks]: readonly string[], domain: string): Promise<MailExchangeVerdict> => {
  if (resolver === undefined) {
    return MAIL_EXCHANGE.UNKNOWN
  }

  const verdict = await askResolver(resolver, domain)

  return verdict === MAIL_EXCHANGE.UNKNOWN ? firstAnswer(fallbacks, domain) : verdict
}

export const checkMailExchange = (domain: string): Promise<MailExchangeVerdict> => firstAnswer(DNS_OVER_HTTPS_RESOLVERS, domain)
