export const CERTIFICATION_LOGO = {
  ANTHROPIC: "anthropic",
  AWS: "aws",
  GOOGLE: "google",
  GOOGLE_CLOUD: "googleCloud",
  MICROSOFT: "microsoft",
} as const

export type CertificationLogo = (typeof CERTIFICATION_LOGO)[keyof typeof CERTIFICATION_LOGO]

export interface Certification {
  readonly id: "awsArchitect" | "awsBusiness" | "awsGenAi" | "claudeArchitect" | "gcpArchitect" | "googleAi" | "msAgentic"
  readonly issuer: string
  readonly logo: CertificationLogo
  readonly name: string
  readonly url?: string
}

export const CERTIFICATIONS: readonly Certification[] = [
  { id: "awsArchitect", issuer: "AWS Certified", logo: CERTIFICATION_LOGO.AWS, name: "Solutions Architect – Associate" },
  { id: "awsGenAi", issuer: "AWS Certified", logo: CERTIFICATION_LOGO.AWS, name: "Generative AI Developer – Professional" },
  { id: "claudeArchitect", issuer: "Anthropic", logo: CERTIFICATION_LOGO.ANTHROPIC, name: "Claude Certified Architect – Foundations" },
  { id: "gcpArchitect", issuer: "Google Cloud", logo: CERTIFICATION_LOGO.GOOGLE_CLOUD, name: "Professional Cloud Architect" },
  { id: "awsBusiness", issuer: "AWS Certified", logo: CERTIFICATION_LOGO.AWS, name: "AI Business Strategist" },
  { id: "msAgentic", issuer: "Microsoft Certified", logo: CERTIFICATION_LOGO.MICROSOFT, name: "Agentic AI Business Solutions Architect" },
  { id: "googleAi", issuer: "Google", logo: CERTIFICATION_LOGO.GOOGLE, name: "AI Professional Certificate" },
]
