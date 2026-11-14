interface RateLimitDecision {
  readonly success: boolean
}

const sentEmails: EmailMessageBuilder[] = []
const rateLimit: { decision: RateLimitDecision; keys: string[] } = { decision: { success: true }, keys: [] }
const delivery: { failure?: Error } = {}

export const getSentEmails = (): readonly EmailMessageBuilder[] => sentEmails

export const getRateLimitKeys = (): readonly string[] => rateLimit.keys

export const refuseRateLimit = (): void => {
  rateLimit.decision = { success: false }
}

export const failEmailDelivery = (failure: Error): void => {
  delivery.failure = failure
}

export const resetTestBindings = (): void => {
  sentEmails.length = 0
  rateLimit.decision = { success: true }
  rateLimit.keys.length = 0
  delete delivery.failure
}

export const env = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  CONTACT_RATE_LIMIT: {
    limit: async ({ key }: { key: string }) => {
      rateLimit.keys.push(key)
      return rateLimit.decision
    },
  },
  EMAIL: {
    send: async (message: EmailMessageBuilder) => {
      if (delivery.failure !== undefined) {
        throw delivery.failure
      }
      sentEmails.push(message)
      return { messageId: crypto.randomUUID() }
    },
  },
}
