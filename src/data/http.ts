import { APP_DOMAIN } from "~/src/presentation/branding"

export const HTTP_STATUS = {
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  OK: 200,
  PERMANENT_REDIRECT: 308,
} as const

export const IP_ADDRESS_HEADER = "cf-connecting-ip"

export const DEPLOYED_HOSTS = {
  preview: `preview.${APP_DOMAIN}`,
  production: APP_DOMAIN,
} as const
