"use client"

import { type JSX, useRef, useState } from "react"

import { useTranslations } from "next-intl"

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "~/src/lib/gsap"
import { cn } from "~/src/lib/utils"

import { ArrowUpRightIcon } from "~/src/components/custom/icons"
import { Reveal } from "~/src/components/custom/reveal"
import { SplitHeading } from "~/src/components/custom/split-heading"

import { PROJECTS } from "~/src/data"
import type { Project, ProjectDiscipline } from "~/src/types"

// Every project that is not featured. Setting `draft: false` publishes one here. Drafts show in development as a marked
// preview and never reach production. Only the title, one-liner and year are shown, because the drafts' longer
// descriptions are still placeholders.
const LISTED = PROJECTS.filter((project) => !project.featured && (!project.draft || process.env.NODE_ENV === "development"))
const HAS_DRAFTS = LISTED.some((project) => project.draft)

const DISCIPLINE_LABELS = {
  ai: "disciplineAi",
  architecture: "disciplineArchitecture",
  products: "disciplineProducts",
  concepts: "disciplineConcepts",
} as const

// A category shows to visitors once it holds a project. In development they all show, empty ones included.
const DISCIPLINES = (Object.keys(DISCIPLINE_LABELS) as ProjectDiscipline[]).filter(
  (discipline) => process.env.NODE_ENV === "development" || LISTED.some((project) => project.discipline === discipline),
)

type Filter = ProjectDiscipline | "all"

function ProjectRow({ project }: Readonly<{ project: Project }>): JSX.Element {
  const t = useTranslations("custom.work")
  const content = (
    <>
      {/* Hover: the rule is redrawn in emerald and the title leans into it, as on the Insights rows. */}
      <span
        aria-hidden
        className="absolute -top-px left-0 h-0.5 w-full origin-left scale-x-0 bg-emerald transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
      <span className="type-title block text-[clamp(1.5rem,2.5vw,3.25rem)] text-foreground transition-[color,translate] duration-500 ease-out group-hover:translate-x-2 group-hover:text-emerald md:col-span-5">
        {project.title}
      </span>
      <span className="type-body block md:col-span-4">{project.category}</span>
      <span className="type-label block md:col-span-2">{project.discipline && t(DISCIPLINE_LABELS[project.discipline])}</span>
      <span className="type-label flex items-baseline justify-between gap-3 md:col-span-1">
        {project.year}
        {project.url && (
          <ArrowUpRightIcon className="size-[1.1em] text-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}
      </span>
    </>
  )
  const rowClass =
    "group relative grid gap-y-2 border-border border-b py-[clamp(1rem,1.7vw,2rem)] md:grid-cols-12 md:items-baseline md:gap-x-6"

  return project.url ? (
    <a href={project.url} target="_blank" rel="noopener noreferrer" className={rowClass}>
      {content}
    </a>
  ) : (
    <div className={rowClass}>{content}</div>
  )
}

export function ProjectIndex(): JSX.Element | null {
  const t = useTranslations("custom.work")
  const listRef = useRef<HTMLUListElement>(null)
  const changedRef = useRef(false)
  const [filter, setFilter] = useState<Filter>("all")
  const visible = filter === "all" ? LISTED : LISTED.filter((project) => project.discipline === filter)

  useGSAP(
    () => {
      if (!changedRef.current || !listRef.current) return
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from(listRef.current?.children ?? [], {
          y: 18,
          autoAlpha: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.04,
          clearProps: "transform,opacity,visibility",
        })
      })
      // The page below has just changed height.
      ScrollTrigger.refresh()
    },
    { dependencies: [filter], scope: listRef },
  )

  if (LISTED.length === 0) return null

  const choose = (next: Filter) => {
    changedRef.current = true
    setFilter(next)
  }
  const count = (key: Filter) => (key === "all" ? LISTED.length : LISTED.filter((project) => project.discipline === key).length)

  return (
    <div data-nav-ground="paper" className="relative z-10 bg-background pt-(--section-y) pb-(--section-y)">
      <div className="frame">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-foreground border-t pt-3">
          <p className="type-label text-foreground">{t("otherLabel")}</p>
          {HAS_DRAFTS && (
            <p className="border border-current border-dashed px-2.5 py-1 font-medium text-[0.8125rem] text-foreground tracking-[-0.005em]">
              {t("previewTag")}
            </p>
          )}
        </div>
        <SplitHeading as="h3" className="type-display mt-[clamp(1.25rem,2.4vw,2.75rem)] text-[clamp(2.25rem,4.6vw,6.5rem)]">
          {t("otherTitle")}
        </SplitHeading>

        <Reveal className="mt-[clamp(1.5rem,3vw,3.5rem)]">
          <fieldset className="flex flex-wrap gap-x-[clamp(1rem,2vw,2.5rem)] gap-y-1">
            <legend className="sr-only">{t("filterLabel")}</legend>
            {(["all", ...DISCIPLINES] as Filter[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => choose(key)}
                className="group/filter relative py-2 font-medium text-[clamp(0.9375rem,0.95vw,1.125rem)] text-muted-foreground tracking-[-0.011em] transition-colors duration-200 hover:text-foreground aria-pressed:text-foreground"
              >
                {key === "all" ? t("filterAll") : t(DISCIPLINE_LABELS[key])}
                <sup className="ml-1 text-[0.7em] tabular-nums">{count(key)}</sup>
                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-emerald transition-transform duration-500 ease-out group-aria-pressed/filter:scale-x-100"
                />
              </button>
            ))}
          </fieldset>
        </Reveal>

        <ul ref={listRef} className={cn("mt-[clamp(1rem,1.6vw,2rem)] border-border border-t")}>
          {visible.map((project) => (
            <li key={project.id}>
              <ProjectRow project={project} />
            </li>
          ))}
          {visible.length === 0 && <li className="type-body border-border border-b py-[clamp(1rem,1.7vw,2rem)]">{t("emptyCategory")}</li>}
        </ul>
      </div>
    </div>
  )
}
