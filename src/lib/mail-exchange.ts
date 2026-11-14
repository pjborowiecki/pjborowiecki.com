import { z } from "~/src/integrations/zod/zod.config"

const DNS_OVER_HTTPS_RESOLVERS = ["https://cloudflare-dns.com/dns-query", "https://dns.google/resolve"] as const
const DNS_JSON = "application/dns-json"
const LOOKUP_TIMEOUT_MS = 2000

const DNS_STATUS = {
  NAME_ERROR: 3,
  NO_ERROR: 0,
} as const

const DNS_RECORD_TYPE_MX = 15
const NULL_MX_EXCHANGE = "."
const DOMAIN_SEPARATOR = "@"

export const MAIL_EXCHANGE = {
  ACCEPTS: "accepts",
  REFUSES: "refuses",
  UNKNOWN: "unknown",
} as const

type MailExchangeVerdict = (typeof MAIL_EXCHANGE)[keyof typeof MAIL_EXCHANGE]

const dnsRecordSchema = z.object({ data: z.string(), type: z.number() })

const dnsAnswerSchema = z.object({
  Answer: z.array(dnsRecordSchema).default([]),
  Status: z.number(),
})

const exchangeOf = (record: string): string => record.slice(record.lastIndexOf(" ") + " ".length)

const verdictOf = ({ Answer, Status }: z.infer<typeof dnsAnswerSchema>): MailExchangeVerdict => {
  if (Status === DNS_STATUS.NAME_ERROR) {
    return MAIL_EXCHANGE.REFUSES
  }

  if (Status !== DNS_STATUS.NO_ERROR) {
    return MAIL_EXCHANGE.UNKNOWN
  }

  const exchanges = Answer.filter(({ type }) => type === DNS_RECORD_TYPE_MX)
  const publishesNullMx = exchanges.length > 0 && exchanges.every(({ data }) => exchangeOf(data) === NULL_MX_EXCHANGE)

  return publishesNullMx ? MAIL_EXCHANGE.REFUSES : MAIL_EXCHANGE.ACCEPTS
}

export const emailDomain = (email: string): string =>
  email.slice(email.lastIndexOf(DOMAIN_SEPARATOR) + DOMAIN_SEPARATOR.length).toLowerCase()

const askResolver = async (resolver: string, domain: string): Promise<MailExchangeVerdict> => {
  const url = new URL(resolver)
  url.searchParams.set("name", domain)
  url.searchParams.set("type", "MX")

  try {
    const response = await fetch(url, { headers: { accept: DNS_JSON }, signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS) })

    return response.ok ? verdictOf(dnsAnswerSchema.parse(await response.json())) : MAIL_EXCHANGE.UNKNOWN
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
