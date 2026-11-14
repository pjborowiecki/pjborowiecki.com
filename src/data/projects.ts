import { SAASY_LAND_URL } from "~/src/presentation/branding"

export const PROJECT_DISCIPLINE = {
  AI: "ai",
  ARCHITECTURE: "architecture",
  CONCEPTS: "concepts",
  PRODUCTS: "products",
} as const

export type ProjectDiscipline = (typeof PROJECT_DISCIPLINE)[keyof typeof PROJECT_DISCIPLINE]

export const PROJECT_DISCIPLINES = [
  PROJECT_DISCIPLINE.AI,
  PROJECT_DISCIPLINE.ARCHITECTURE,
  PROJECT_DISCIPLINE.PRODUCTS,
  PROJECT_DISCIPLINE.CONCEPTS,
] as const

export const PROJECT_ID = {
  ARKA: "arka",
  GLAMBOOKER: "glambooker",
  MARTE: "marte",
  PILARTRACK: "pilartrack",
  REACTPROJECTS: "reactprojects",
  SAASYLAND: "saasyland",
  SEATFRENZY: "seatfrenzy",
  SHOPPEYA: "shoppeya",
  SKILLSLAY: "skillslay",
} as const

export type ProjectId = (typeof PROJECT_ID)[keyof typeof PROJECT_ID]

export interface Project {
  readonly discipline?: ProjectDiscipline
  readonly github?: { readonly stars: number; readonly url: string }
  readonly id: ProjectId
  readonly image: string
  readonly isDraft: boolean
  readonly isFeatured: boolean
  readonly techStack: readonly string[]
  readonly title: string
  readonly url?: string
  readonly year: string
}

export const SAASYLAND_GITHUB_STARS = 440

export const ARKA_GITHUB_STARS = 160

const ARKA_REPOSITORY_URL = "https://github.com/pjborowiecki/ARKA-Veterinary-Clinic-Page-and-Appointment-Booking-System"

const PLACEHOLDER_IMAGE = "project-placeholder"

export const PROJECTS: readonly Project[] = [
  {
    discipline: PROJECT_DISCIPLINE.ARCHITECTURE,
    id: PROJECT_ID.SHOPPEYA,
    image: PLACEHOLDER_IMAGE,
    isDraft: true,
    isFeatured: false,
    techStack: ["React"],
    title: "Shoppeya.com",
    year: "2026",
  },
  {
    id: PROJECT_ID.MARTE,
    image: "work-marte",
    isDraft: false,
    isFeatured: true,
    techStack: ["TanStack Start", "Cloudflare Workers", "KV", "R2", "GSAP", "TypeScript"],
    title: "MarteBizuteria.pl",
    year: "2024",
  },
  {
    github: { stars: SAASYLAND_GITHUB_STARS, url: "https://github.com/saasyland/saasyland.com" },
    id: PROJECT_ID.SAASYLAND,
    image: "work-saasyland",
    isDraft: false,
    isFeatured: true,
    techStack: ["TanStack Start", "Bun", "Cloudflare", "Drizzle", "Better Auth", "Polar", "Vitest", "Playwright"],
    title: "SaaSyLand.com",
    url: SAASY_LAND_URL,
    year: "2023",
  },
  {
    discipline: PROJECT_DISCIPLINE.PRODUCTS,
    id: PROJECT_ID.SEATFRENZY,
    image: PLACEHOLDER_IMAGE,
    isDraft: true,
    isFeatured: false,
    techStack: ["Python", "TensorFlow Lite", "FastAPI", "WebSockets", "PostgreSQL with PostGIS", "Grafana", "AWS IoT Core"],
    title: "SeatFrenzy.com",
    year: "2024",
  },
  {
    discipline: PROJECT_DISCIPLINE.AI,
    id: PROJECT_ID.SKILLSLAY,
    image: PLACEHOLDER_IMAGE,
    isDraft: true,
    isFeatured: false,
    techStack: ["Python", "TensorFlow Lite", "FastAPI", "WebSockets", "PostgreSQL with PostGIS", "Grafana", "AWS IoT Core"],
    title: "SkillSlay.com",
    year: "2026",
  },
  {
    discipline: PROJECT_DISCIPLINE.AI,
    id: PROJECT_ID.PILARTRACK,
    image: PLACEHOLDER_IMAGE,
    isDraft: true,
    isFeatured: false,
    techStack: ["Python", "TensorFlow Lite", "FastAPI", "WebSockets", "PostgreSQL with PostGIS", "Grafana", "AWS IoT Core"],
    title: "PilarTrack.com",
    year: "2026",
  },
  {
    discipline: PROJECT_DISCIPLINE.ARCHITECTURE,
    id: PROJECT_ID.GLAMBOOKER,
    image: PLACEHOLDER_IMAGE,
    isDraft: true,
    isFeatured: false,
    techStack: ["React", "Python", "LangChain", "Pinecone", "Docker", "FastAPI"],
    title: "GlamBooker.com",
    year: "2026",
  },
  {
    discipline: PROJECT_DISCIPLINE.PRODUCTS,
    id: PROJECT_ID.REACTPROJECTS,
    image: PLACEHOLDER_IMAGE,
    isDraft: true,
    isFeatured: false,
    techStack: ["React", "WebGL", "Go", "PostgreSQL", "RabbitMQ", "AWS IoT", "Terraform"],
    title: "ReactProjects.com",
    year: "2024",
  },
  {
    discipline: PROJECT_DISCIPLINE.PRODUCTS,
    github: { stars: ARKA_GITHUB_STARS, url: ARKA_REPOSITORY_URL },
    id: PROJECT_ID.ARKA,
    image: PLACEHOLDER_IMAGE,
    isDraft: false,
    isFeatured: false,
    techStack: ["Next.js", "TypeScript", "Auth.js", "PostgreSQL", "Drizzle", "Tailwind CSS"],
    title: "Arka-Weterynaria.pl",
    url: ARKA_REPOSITORY_URL,
    year: "2023",
  },
]

export const FEATURED_PROJECTS = PROJECTS.filter(({ isFeatured, isDraft }) => isFeatured && !isDraft)
