import { ERRORS } from "~/src/constants/_constants/errors"
import { DEFAULT_LOCALE, LOCALES } from "~/src/constants/_constants/locales"
import { SOCIAL_LINKS } from "~/src/constants/_constants/social-links"

export const CONSTANTS = {
  APP_NAME: "pjborowiecki.com",
  DEFAULT_APP_URL: "http://localhost:3000",
  APP_GITHUB_OWNER: "pjborowiecki",
  APP_GITHUB_REPO: "pjborowiecki.com",
  EMAIL: "hello@pjborowiecki.com",
  ERRORS,
  SOCIAL_LINKS,
  DEFAULT_LOCALE,
  LOCALES,
} as const
