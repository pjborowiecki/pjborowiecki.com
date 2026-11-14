export const APP_NAME = "Piotr J. Borowiecki"
export const APP_DOMAIN = "pjborowiecki.com"

export const APP_URL = `https://${APP_DOMAIN}`
export const CONTACT_EMAIL = `hello@${APP_DOMAIN}`

export const APP_GITHUB_OWNER = "pjborowiecki"
export const APP_GITHUB_REPO = APP_DOMAIN
export const APP_GITHUB_URL = `https://github.com/${APP_GITHUB_OWNER}/${APP_GITHUB_REPO}`

export const GITHUB_PROFILE_URL = `https://github.com/${APP_GITHUB_OWNER}`
export const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/pjborowiecki"

export const SAASY_LAND_URL = "https://saasyland.com"
export const REACT_PROJECTS_URL = "https://reactprojects.com"
export const ANGULAR_PROJECTS_URL = "https://angularprojects.com"

export const PROJECT_SITES = [
  { name: "SaaSy Land", url: SAASY_LAND_URL },
  { name: "ReactProjects", url: REACT_PROJECTS_URL },
  { name: "AngularProjects", url: ANGULAR_PROJECTS_URL },
] as const

export const SOCIAL_PROFILES = [
  { name: "LinkedIn", url: LINKEDIN_PROFILE_URL },
  { name: "GitHub", url: GITHUB_PROFILE_URL },
] as const
