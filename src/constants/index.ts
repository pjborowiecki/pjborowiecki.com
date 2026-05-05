import { DEFAULT_LOCALE, LOCALES } from "~/src/constants/_constants/locales"

export const CONSTANTS = {
  APP_NAME: "pjborowiecki.com",
  DEFAULT_APP_URL: "http://localhost:3000",
  APP_GITHUB_OWNER: "pjborowiecki",
  APP_GITHUB_REPO: "pjborowiecki.com",
  EMAIL: "contact@pjborowiecki.com",
  SOCIAL_LINKS: [
    { name: "LinkedIn", url: "https://www.linkedin.com/in/pjborowiecki" },
    { name: "GitHub", url: "https://github.com/pjborowiecki" },
  ],
  DEFAULT_LOCALE,
  LOCALES,
} as const
