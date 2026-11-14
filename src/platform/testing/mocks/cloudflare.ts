interface RateLimitDecision {
  readonly success: boolean
}

export const RATE_LIMIT_BINDING = {
  CONTACT: "CONTACT_RATE_LIMIT",
  GLOBAL: "CONTACT_GLOBAL_RATE_LIMIT",
} as const

type RateLimitBinding = (typeof RATE_LIMIT_BINDING)[keyof typeof RATE_LIMIT_BINDING]

interface RateLimitState {
  isRefusingAll: boolean
  readonly keys: string[]
  readonly refusedKeys: Set<string>
}

const createRateLimitState = (): RateLimitState => ({ isRefusingAll: false, keys: [], refusedKeys: new Set() })

const sentEmails: EmailMessageBuilder[] = []
const rateLimits: Record<RateLimitBinding, RateLimitState> = {
  [RATE_LIMIT_BINDING.CONTACT]: createRateLimitState(),
  [RATE_LIMIT_BINDING.GLOBAL]: createRateLimitState(),
}
const delivery: { failure?: Error } = {}

export const getSentEmails = (): readonly EmailMessageBuilder[] => sentEmails

export const getRateLimitKeys = (binding: RateLimitBinding = RATE_LIMIT_BINDING.CONTACT): readonly string[] => rateLimits[binding].keys

export const refuseRateLimit = (binding: RateLimitBinding = RATE_LIMIT_BINDING.CONTACT): void => {
  rateLimits[binding].isRefusingAll = true
}

export const refuseRateLimitKey = (key: string): void => {
  rateLimits[RATE_LIMIT_BINDING.CONTACT].refusedKeys.add(key)
}

const rateLimiter = (binding: RateLimitBinding) => ({
  limit: async ({ key }: { key: string }): Promise<RateLimitDecision> => {
    const state = rateLimits[binding]
    state.keys.push(key)
    return { success: !state.isRefusingAll && !state.refusedKeys.has(key) }
  },
})

export const failEmailDelivery = (failure: Error): void => {
  delivery.failure = failure
}

export const resetTestBindings = (): void => {
  sentEmails.length = 0
  for (const state of Object.values(rateLimits)) {
    state.isRefusingAll = false
    state.keys.length = 0
    state.refusedKeys.clear()
  }
  delete delivery.failure
}

export const env = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  CONTACT_GLOBAL_RATE_LIMIT: rateLimiter(RATE_LIMIT_BINDING.GLOBAL),
  CONTACT_RATE_LIMIT: rateLimiter(RATE_LIMIT_BINDING.CONTACT),
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
