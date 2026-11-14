import { type JSX, useState } from "react"

import { useTranslations } from "use-intl/react"

import { NAV_GROUND, SECTION_IDS } from "~/src/data/marketing"
import { FEATURED_PROJECTS, type Project } from "~/src/data/projects"

import { padded } from "~/src/lib/numbers"

import { CaseStudyPanel } from "~/src/presentation/components/custom/landing-page/components/case-study-panel"
import { ProjectIndex } from "~/src/presentation/components/custom/landing-page/components/project-index"
import { ProjectShowcase } from "~/src/presentation/components/custom/landing-page/components/project-showcase"
import { SectionHead } from "~/src/presentation/components/custom/landing-page/components/section-head"

const NEXT = 1

const findNextProject = (project: Project | undefined): Project | undefined => {
  if (project === undefined) {
    return undefined
  }
  const index = FEATURED_PROJECTS.findIndex(({ id }) => id === project.id)

  return FEATURED_PROJECTS[(index + NEXT) % FEATURED_PROJECTS.length]
}

export const WorkSection = (): JSX.Element => {
  const t = useTranslations("pages.landing.work")

  const [selected, setSelected] = useState<Project>()

  return (
    <section className="relative bg-background" id={SECTION_IDS.WORK}>
      <div className="pt-[calc(var(--nav-bar-height)+1.25rem)] pb-[clamp(1rem,1.5vw,1.75rem)]" data-nav-ground={NAV_GROUND.PAPER}>
        <SectionHead
          isTitleHidden
          label={t("caseStudies")}
          meta={<p className="type-label text-foreground">{`(${padded(FEATURED_PROJECTS.length)})`}</p>}
          title={t("selected")}
        />
      </div>

      {FEATURED_PROJECTS.map((project) => (
        <ProjectShowcase
          key={project.id}
          onOpen={() => {
            setSelected(project)
          }}
          project={project}
        />
      ))}

      <ProjectIndex />

      <CaseStudyPanel
        next={findNextProject(selected)}
        onClose={() => {
          setSelected(undefined)
        }}
        onSelect={setSelected}
        project={selected}
      />
    </section>
  )
}
