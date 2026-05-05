export interface Project {
  id: string
  title: string
  category: string
  year: string
  techStack: string[]
  image: string
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
}

export interface Skill {
  name: string
  level?: number
  category?: string
}

export interface NavItem {
  label: string
  href: string
}
