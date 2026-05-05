import type { Article, NavItem, Project, Skill } from "~/src/types"

export const NAV_ITEMS: NavItem[] = [
  { label: "Profile", href: "#about" },
  { label: "Philosophy", href: "#philosophy" },
  { label: "Selected Work", href: "#work" },
  { label: "Insights", href: "#insights" },
  { label: "Expertise", href: "#skills" },
]

export const PROJECTS: Project[] = [
  {
    id: "shoppeya",
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
    id: "saasyland",
    title: "SaaSyLand.com",
    category: "Modern, opinionated SaaS Starter Kit",
    year: "2023",
    image: "/images/work/saasyland.jpg",
    shortDescription: "An opinionated SaaS starter kit optimized for performance, using the Bun runtime on Vercel.",
    challenge:
      "Starting a new SaaS requires configuring authentication, databases, payment gateways, and dashboards from scratch. This repetitive boilerplate wastes valuable development time and delays time-to-market.",
    solution:
      "Engineered a pre-configured, highly optimized boilerplate that includes everything a SaaS might need—authentication, database setup, a custom dashboard, payments, and sample products—all ready to build on.",
    techStack: ["Next.js", "Bun", "Vercel", "Stripe", "PostgreSQL", "TailwindCSS"],
    outcome:
      "Saves developers hundreds of hours of configuration, accelerating MVP development and ensuring a production-ready foundation out of the box.",
    draft: false,
  },
  {
    id: "marte",
    title: "Marte-Bizuteria.pl",
    category: "Real-life Jewellery Brand from Poland",
    year: "2024",
    image: "/images/work/marte.jpg",
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
    id: "seatfrenzy",
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

export const SKILLS: Skill[] = [
  { name: "System Design", level: 98, category: "Architecture" },
  { name: "Microservices", level: 95, category: "Architecture" },
  { name: "Node.js / Go", level: 92, category: "Backend" },
  { name: "Kubernetes", level: 90, category: "DevOps" },
  { name: "React / Next.js", level: 95, category: "Frontend" },
  { name: "Event Driven", level: 88, category: "Architecture" },
  { name: "AWS / GCP", level: 90, category: "DevOps" },
  { name: "CI/CD Pipelines", level: 85, category: "DevOps" },
]
