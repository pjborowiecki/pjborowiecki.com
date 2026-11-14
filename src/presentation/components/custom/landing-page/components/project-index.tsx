import { type JSX, useRef, useState } from "react"

import { Button } from "react-aria-components"
import { useTranslations } from "use-intl/react"

import { MOTION_OK, ScrollTrigger, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { NAV_GROUND } from "~/src/data/marketing"
import { PROJECTS, PROJECT_DISCIPLINES, type Project, type ProjectDiscipline } from "~/src/data/projects"

import { ArrowUpRightIcon } from "~/src/presentation/components/custom/icons"
import { Reveal } from "~/src/presentation/components/custom/landing-page/components/reveal"
import { SplitHeading } from "~/src/presentation/components/custom/landing-page/components/split-heading"

const ALL = "all"

type Filter = ProjectDiscipline | typeof ALL

const LISTED = PROJECTS.filter((project) => !project.isFeatured && (!project.isDraft || import.meta.env.DEV))
const HAS_DRAFTS = LISTED.some((project) => project.isDraft)

const DISCIPLINE_LABELS = {
  ai: "disciplineAi",
  architecture: "disciplineArchitecture",
  concepts: "disciplineConcepts",
  products: "disciplineProducts",
} as const satisfies Record<ProjectDiscipline, string>

const FILTER_LABELS = { ...DISCIPLINE_LABELS, all: "filterAll" } as const satisfies Record<Filter, string>

const DISCIPLINES = PROJECT_DISCIPLINES.filter(
  (discipline) => import.meta.env.DEV || LISTED.some((project) => project.discipline === discipline),
)

const FILTERS: readonly Filter[] = [ALL, ...DISCIPLINES]

const FEWEST_DISCIPLINES_TO_FILTER = 2

const HAS_FILTERS = DISCIPLINES.length >= FEWEST_DISCIPLINES_TO_FILTER

const LIST_RISE: gsap.TweenVars = {
  autoAlpha: 0,
  clearProps: "transform,opacity,visibility",
  duration: 0.55,
  ease: "power3.out",
  stagger: 0.04,
  y: 18,
}

const ROW_CLASSNAME =
  "group relative grid gap-y-2 border-border border-b py-[clamp(1rem,1.7vw,2rem)] md:grid-cols-12 md:items-baseline md:gap-x-6"

const listProjects = (filter: Filter): readonly Project[] =>
  filter === ALL ? LISTED : LISTED.filter((project) => project.discipline === filter)

const ProjectRowContent = ({ project }: { readonly project: Project }): JSX.Element => {
  const t = useTranslations("pages.landing.work")

  return (
    <>
      <span
        aria-hidden
        className="absolute -top-px left-0 h-0.5 w-full origin-left scale-x-0 bg-emerald transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
      <span className="block type-title text-[clamp(1.5rem,2.5vw,3.25rem)] text-foreground transition-[color,translate] duration-500 ease-out group-hover:translate-x-2 group-hover:text-emerald md:col-span-5">
        {project.title}
      </span>
      <span className="block type-body md:col-span-4">{t(`projects.${project.id}.category`)}</span>
      <span className="block type-label md:col-span-2">{project.discipline !== undefined && t(DISCIPLINE_LABELS[project.discipline])}</span>
      <span className="flex items-baseline justify-between gap-3 type-label md:col-span-1">
        {project.year}
        {project.url !== undefined && (
          <ArrowUpRightIcon className="size-[1.1em] text-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}
      </span>
    </>
  )
}

const ProjectRow = ({ project }: { readonly project: Project }): JSX.Element => {
  if (project.url === undefined) {
    return (
      <div className={ROW_CLASSNAME}>
        <ProjectRowContent project={project} />
      </div>
    )
  }

  return (
    <a className={ROW_CLASSNAME} href={project.url} rel="noopener noreferrer" target="_blank">
      <ProjectRowContent project={project} />
    </a>
  )
}

export const ProjectIndex = (): JSX.Element | undefined => {
  const t = useTranslations("pages.landing.work")
  const listRef = useRef<HTMLUListElement>(null)
  const hasFilterChangedRef = useRef(false)

  const [filter, setFilter] = useState<Filter>(ALL)

  const visible = listProjects(filter)

  useGSAP(
    () => {
      if (!hasFilterChangedRef.current || !listRef.current) {
        return
      }
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from(listRef.current?.children ?? [], { ...LIST_RISE })
      })
      ScrollTrigger.refresh()
    },
    { dependencies: [filter], scope: listRef },
  )

  if (LISTED.length === 0) {
    return undefined
  }

  const choose = (next: Filter): void => {
    hasFilterChangedRef.current = true
    setFilter(next)
  }

  return (
    <div className="relative z-10 bg-background pt-(--section-y) pb-(--section-y)" data-nav-ground={NAV_GROUND.PAPER}>
      <div className="frame">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-foreground pt-3">
          <p className="type-label text-foreground">{t("otherLabel")}</p>
          {HAS_DRAFTS && (
            <p className="border border-dashed border-current px-2.5 py-1 text-[0.8125rem] font-medium tracking-[-0.005em] text-foreground">
              {t("previewTag")}
            </p>
          )}
        </div>
        <SplitHeading as="h3" className="mt-[clamp(1.25rem,2.4vw,2.75rem)] type-display text-[clamp(2.25rem,4.6vw,6.5rem)]">
          {t("otherTitle")}
        </SplitHeading>

        {HAS_FILTERS && (
          <Reveal className="mt-[clamp(1.5rem,3vw,3.5rem)]">
            <fieldset className="flex flex-wrap gap-x-[clamp(1rem,2vw,2.5rem)] gap-y-1">
              <legend className="sr-only">{t("filterLabel")}</legend>
              {FILTERS.map((key) => (
                <Button
                  aria-pressed={filter === key}
                  className="group/filter relative py-2 text-[clamp(0.9375rem,0.95vw,1.125rem)] font-medium tracking-[-0.011em] text-muted-foreground transition-colors duration-200 hover:text-foreground aria-pressed:text-foreground"
                  key={key}
                  onPress={() => {
                    choose(key)
                  }}
                >
                  {t(FILTER_LABELS[key])}
                  <sup className="ml-1 text-[0.7em] tabular-nums">{listProjects(key).length}</sup>
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-emerald transition-transform duration-500 ease-out group-aria-pressed/filter:scale-x-100"
                  />
                </Button>
              ))}
            </fieldset>
          </Reveal>
        )}

        <ul className="mt-[clamp(1rem,1.6vw,2rem)] border-t border-border" ref={listRef}>
          {visible.map((project) => (
            <li key={project.id}>
              <ProjectRow project={project} />
            </li>
          ))}
          {visible.length === 0 && <li className="border-b border-border py-[clamp(1rem,1.7vw,2rem)] type-body">{t("emptyCategory")}</li>}
        </ul>
      </div>
    </div>
  )
}
