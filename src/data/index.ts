import type { Article, Certification, NavItem, Project } from "~/src/types"

export const NAV_ITEMS: NavItem[] = [
  { key: "philosophy", href: "#philosophy" },
  { key: "expertise", href: "#skills" },
  { key: "ai", href: "#ai" },
  { key: "about", href: "#about" },
  { key: "work", href: "#work" },
  { key: "insights", href: "#insights" },
]

export const PROJECTS: Project[] = [
  {
    id: "shoppeya",
    discipline: "architecture",
    title: "Shoppeya.com",
    category: "Modular, Serverless E-commerce Platform",
    year: "2026",
    image: "/images/work/generic.jpg",
    shortDescription: "",
    challenge: "",
    solution: "",
    techStack: ["React"],
    outcome: "",
    draft: true,
  },
  {
    id: "marte",
    featured: true,
    title: "MarteBizuteria.pl",
    category: "Premium e-commerce platform for a Polish jewellery brand",
    year: "2024",
    image: "/images/site/work-marte.webp",
    imageWidth: 1600,
    imageHeight: 3925,
    shortDescription:
      "A highly polished, ultra-fast e-commerce storefront and admin management system for a real-world jewelry brand in Poland.",
    challenge:
      "The brand needed a sophisticated, premium digital presence that didn't compromise on performance. Traditional e-commerce platforms were either too slow or lacked the bespoke design capabilities required for a luxury brand.",
    solution:
      "Architected a custom, edge-native platform using TanStack Start deployed on Cloudflare Workers. Leveraged KV for lightning-fast caching, R2 for optimized media delivery, and implemented aggressive prefetching. The frontend features elegant GSAP animations to deliver a high-end luxury feel.",
    techStack: ["TanStack Start", "Cloudflare Workers", "KV", "R2", "GSAP", "TypeScript"],
    outcome:
      "Delivered an exceptionally fast, SEO-optimized e-commerce experience. The elegant animations and instant page loads significantly improved user engagement and conversions.",
    draft: false,
  },
  {
    id: "saasyland",
    featured: true,
    title: "SaaSyLand.com",
    category: "Production-ready SaaS foundation that saves teams hundreds of hours",
    year: "2023",
    image: "/images/site/work-saasyland.webp",
    imageWidth: 1600,
    imageHeight: 4051,
    url: "https://saasyland.com",
    github: { stars: "430+", url: "https://github.com/saasyland/saasyland.com" },
    shortDescription: "An opinionated SaaS starter kit: one command scaffolds auth, billing, an admin and a visual page builder.",
    challenge:
      "Starting a new SaaS requires configuring authentication, databases, payment gateways, and dashboards from scratch. This repetitive boilerplate wastes valuable development time and delays time-to-market.",
    solution:
      "Engineered a pre-configured, highly optimized boilerplate that includes everything a SaaS might need (authentication, database setup, a custom dashboard, payments, and sample products), all ready to build on.",
    techStack: ["TanStack Start", "Bun", "Cloudflare", "Drizzle", "Better Auth", "Polar", "Vitest", "Playwright"],
    outcome:
      "Saves developers hundreds of hours of configuration, accelerating MVP development and ensuring a production-ready foundation out of the box.",
    draft: false,
  },
  {
    id: "seatfrenzy",
    discipline: "products",
    title: "SeatFrenzy.com",
    category: "Venue management and Table Booking System",
    year: "2024",
    image: "/images/work/generic.jpg",
    shortDescription: "Predictive maintenance and route optimization for logistics fleets using edge AI and satellite data.",
    challenge:
      "Trucking fleets suffered from unpredictable downtime and inefficient routing, leading to fuel wastage and missed delivery windows. Integrating real-time sensor data with weather and traffic patterns proved computationally expensive.",
    solution:
      "Developed an edge-to-cloud architecture. Edge devices run lightweight ML models (TensorFlow Lite) to detect anomalies in vehicle telemetry. The cloud platform aggregates data, optimizes routes using reinforcement learning, and provides a real-time dashboard with geospatial visualization.",
    techStack: ["Python", "TensorFlow Lite", "FastAPI", "WebSockets", "PostgreSQL with PostGIS", "Grafana", "AWS IoT Core"],
    outcome:
      "Reduced fuel consumption by 18% and cut maintenance-related downtime by 30% in pilot deployments. The prediction engine achieves 92% accuracy in identifying potential component failures 7 days in advance.",
    draft: true,
  },
  {
    id: "skillslay",
    discipline: "ai",
    title: "SkillSlay.com",
    category: "AI-powered Fleet Management & Telematics",
    year: "2026",
    image: "/images/work/generic.jpg",
    shortDescription: "Predictive maintenance and route optimization for logistics fleets using edge AI and satellite data.",
    challenge:
      "Trucking fleets suffered from unpredictable downtime and inefficient routing, leading to fuel wastage and missed delivery windows. Integrating real-time sensor data with weather and traffic patterns proved computationally expensive.",
    solution:
      "Developed an edge-to-cloud architecture. Edge devices run lightweight ML models (TensorFlow Lite) to detect anomalies in vehicle telemetry. The cloud platform aggregates data, optimizes routes using reinforcement learning, and provides a real-time dashboard with geospatial visualization.",
    techStack: ["Python", "TensorFlow Lite", "FastAPI", "WebSockets", "PostgreSQL with PostGIS", "Grafana", "AWS IoT Core"],
    outcome:
      "Reduced fuel consumption by 18% and cut maintenance-related downtime by 30% in pilot deployments. The prediction engine achieves 92% accuracy in identifying potential component failures 7 days in advance.",
    draft: true,
  },
  {
    id: "pilartrack",
    discipline: "ai",
    title: "PilarTrack.com",
    category: "AI-powered Fleet Management & Telematics",
    year: "2026",
    image: "/images/work/generic.jpg",
    shortDescription: "Predictive maintenance and route optimization for logistics fleets using edge AI and satellite data.",
    challenge:
      "Trucking fleets suffered from unpredictable downtime and inefficient routing, leading to fuel wastage and missed delivery windows. Integrating real-time sensor data with weather and traffic patterns proved computationally expensive.",
    solution:
      "Developed an edge-to-cloud architecture. Edge devices run lightweight ML models (TensorFlow Lite) to detect anomalies in vehicle telemetry. The cloud platform aggregates data, optimizes routes using reinforcement learning, and provides a real-time dashboard with geospatial visualization.",
    techStack: ["Python", "TensorFlow Lite", "FastAPI", "WebSockets", "PostgreSQL with PostGIS", "Grafana", "AWS IoT Core"],
    outcome:
      "Reduced fuel consumption by 18% and cut maintenance-related downtime by 30% in pilot deployments. The prediction engine achieves 92% accuracy in identifying potential component failures 7 days in advance.",
    draft: true,
  },
  {
    id: "glambooker",
    discipline: "architecture",
    title: "GlamBooker.com",
    category: "Multitenant SaaS Booking Platform for Beauty Industry",
    year: "2026",
    image: "/images/work/generic.jpg",
    shortDescription: "Self-hosted LLM integration for secure enterprise data.",
    challenge: "Enterprise clients needed Generative AI capabilities but could not expose sensitive financial data to public models.",
    solution:
      "Architected a private cloud solution hosting fine-tuned Llama models. Built a RAG (Retrieval-Augmented Generation) pipeline using Vector Databases. The React frontend implements streaming responses and complex data visualization.",
    techStack: ["React", "Python", "LangChain", "Pinecone", "Docker", "FastAPI"],
    outcome: "Enabled secure, natural language querying of proprietary data. Adoption rate of 85% among C-level executives.",
    draft: true,
  },
  {
    id: "reactprojects",
    discipline: "products",
    title: "ReactProjects.com",
    category: "Advanced Learning Management System",
    year: "2024",
    image: "/images/work/generic.jpg",
    shortDescription: "End-to-end supply chain visibility platform.",
    challenge:
      "Unifying fragmented data from 40+ legacy ERPs and IoT devices into a single source of truth for a Fortune 500 logistics company.",
    solution:
      'Designed a "Data Mesh" architecture. Built high-throughput ingestion pipelines using Go and Node.js. The frontend utilizes React with WebGL to visualize global shipping routes in real-time, handling 50k+ concurrent entity updates.',
    techStack: ["React", "WebGL", "Go", "PostgreSQL", "RabbitMQ", "AWS IoT", "Terraform"],
    outcome: "Operational costs reduced by 18% due to predictive route optimization. Data latency reduced from 24 hours to 300ms.",
    draft: true,
  },
  {
    id: "arka",
    discipline: "products",
    title: "Arka-Weterynaria.pl",
    category: "Landing Page and a Booking System for a real Vet Clinic in Poland",
    year: "2024",
    image: "/images/work/generic.jpg",
    shortDescription: "Self-hosted LLM integration for secure enterprise data.",
    challenge: "Enterprise clients needed Generative AI capabilities but could not expose sensitive financial data to public models.",
    solution:
      "Architected a private cloud solution hosting fine-tuned Llama models. Built a RAG (Retrieval-Augmented Generation) pipeline using Vector Databases. The React frontend implements streaming responses and complex data visualization.",
    techStack: ["React", "Python", "LangChain", "Pinecone", "Docker", "FastAPI"],
    outcome: "Enabled secure, natural language querying of proprietary data. Adoption rate of 85% among C-level executives.",
    draft: true,
  },
]

export const ARTICLES: Article[] = [
  {
    id: "microservices-pitfalls",
    title: "The Pragmatic Architect: When to Choose Modular Monoliths over Microservices",
    category: "Architecture",
    date: "Dec 2025",
    readTime: "8 min read",
    image: "/images/insights/microservices-pitfalls.jpg",
    excerpt:
      "A deep dive into distributed system complexity, analyzing why a well-structured monolith often outperforms microservices for 90% of enterprise use cases.",
  },
  {
    id: "react-performance",
    title: "Next.js at Scale: Architectural Patterns for High-Performance Web Apps",
    category: "Frontend Engineering",
    date: "Jan 2026",
    readTime: "6 min read",
    image: "/images/insights/react-performance.jpg",
    excerpt:
      "Moving beyond basic rendering: How to orchestrate server-side caching, edge-side delivery, and robust data-fetching patterns for complex, multi-tenant platforms.",
  },
  {
    id: "nodejs-scalability",
    title: "High-Throughput Services: Bridging Node.js and Go in Distributed Systems",
    category: "Backend",
    date: "Mar 2026",
    readTime: "10 min read",
    image: "/images/insights/nodejs-scalability.jpg",
    excerpt:
      "Identifying performance bottlenecks in the JS ecosystem and leveraging Go microservices to handle concurrent, compute-intensive workloads at scale.",
  },
]

/** None of these has been earned yet. Each goes live when its `url` is set to the issuer's verification page. */
export const CERTIFICATIONS: Certification[] = [
  { id: "awsArchitect", issuer: "AWS Certified", logo: "aws", name: "Solutions Architect – Associate" },
  { id: "awsGenAi", issuer: "AWS Certified", logo: "aws", name: "Generative AI Developer – Professional" },
  { id: "claudeArchitect", issuer: "Anthropic", logo: "anthropic", name: "Claude Certified Architect – Foundations" },
  { id: "gcpArchitect", issuer: "Google Cloud", logo: "googleCloud", name: "Professional Cloud Architect" },
  { id: "awsBusiness", issuer: "AWS Certified", logo: "aws", name: "AI Business Strategist" },
  { id: "msAgentic", issuer: "Microsoft Certified", logo: "microsoft", name: "Agentic AI Business Solutions Architect" },
  { id: "googleAi", issuer: "Google", logo: "google", name: "AI Professional Certificate" },
]

export const CORE_TECHNOLOGIES = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Go (Golang)",
  "Python",
  "PostgreSQL",
  "Docker",
  "Kubernetes",
  "AI / LLMs",
]
