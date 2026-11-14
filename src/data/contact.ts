export const CONTACT_FORM_ID = "contact-form"

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
