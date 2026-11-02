export type ProjectDiscipline = "ai" | "architecture" | "products" | "concepts"

export interface Project {
  id: string
  title: string
  category: string
  year: string
  techStack: string[]
  image: string
  /** Featured projects get a full-screen showcase and a case study. Everything else goes in the index below them. */
  featured?: boolean
  /** Which filter of the project index a non-featured project appears under. */
  discipline?: ProjectDiscipline
  imageWidth?: number
  imageHeight?: number
  url?: string
  /** Public repository, for projects whose star count is worth showing. */
  github?: { stars: string; url: string }
  shortDescription?: string
  challenge?: string
  solution?: string
  outcome?: string
  draft: boolean
}

export interface Article {
  id: string
  category: string
  date: string
  readTime: string
  title: string
  excerpt: string
  image: string
  href?: string
}

export interface Certification {
  id: "awsArchitect" | "awsGenAi" | "claudeArchitect" | "gcpArchitect" | "awsBusiness" | "msAgentic" | "googleAi"
  issuer: string
  logo: "aws" | "anthropic" | "google" | "googleCloud" | "microsoft"
  name: string
  /** The issuer's public verification page. Set it once the exam is passed: only then does the certificate go live. */
  url?: string
}

export interface NavItem {
  key: "philosophy" | "ai" | "expertise" | "work" | "about" | "insights"
  href: string
}
