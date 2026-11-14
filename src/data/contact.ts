export const CONTACT_NEED = {
  AI: "ai",
  AUDIT: "audit",
  ONGOING: "ongoing",
  PROJECT: "project",
} as const

export const CONTACT_NEEDS = [CONTACT_NEED.AUDIT, CONTACT_NEED.AI, CONTACT_NEED.PROJECT, CONTACT_NEED.ONGOING] as const

export type ContactNeed = (typeof CONTACT_NEEDS)[number]

export const CONTACT_BUDGET = {
  FROM_100K: "from100k",
  FROM_15K: "from15k",
  FROM_40K: "from40k",
  FROM_500K: "from500k",
  RETAINER: "retainer",
  UNDECIDED: "undecided",
} as const

export const CONTACT_BUDGETS = [
  CONTACT_BUDGET.RETAINER,
  CONTACT_BUDGET.FROM_15K,
  CONTACT_BUDGET.FROM_40K,
  CONTACT_BUDGET.FROM_100K,
  CONTACT_BUDGET.FROM_500K,
  CONTACT_BUDGET.UNDECIDED,
] as const

export type ContactBudget = (typeof CONTACT_BUDGETS)[number]

export const CONTACT_ERROR = {
  INVALID_EMAIL: "INVALID_EMAIL",
  RATE_LIMITED: "RATE_LIMITED",
  SEND_FAILED: "SEND_FAILED",
} as const

export type ContactError = (typeof CONTACT_ERROR)[keyof typeof CONTACT_ERROR]

export const CONTACT_VALIDATION_PARAMS = {
  companyTooLong: { max: 160 },
  detailsTooLong: { max: 5000 },
  nameTooLong: { max: 120 },
} as const
