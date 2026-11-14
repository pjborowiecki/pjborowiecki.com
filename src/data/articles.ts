export interface Article {
  readonly id: "microservicesPitfalls" | "nodejsScalability" | "reactPerformance"
  readonly publishedOn: string
}

export const ARTICLES: readonly Article[] = [
  { id: "microservicesPitfalls", publishedOn: "2025-12-01" },
  { id: "reactPerformance", publishedOn: "2026-01-01" },
  { id: "nodejsScalability", publishedOn: "2026-03-01" },
]
