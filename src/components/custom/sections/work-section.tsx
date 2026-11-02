"use client"

import { type JSX, useState } from "react"

import { useTranslations } from "next-intl"

import { CaseStudyPanel } from "~/src/components/custom/case-study-panel"
import { ProjectIndex } from "~/src/components/custom/project-index"
import { ProjectShowcase } from "~/src/components/custom/project-showcase"
import { SectionHead } from "~/src/components/custom/section-head"

import { PROJECTS } from "~/src/data"
import type { Project } from "~/src/types"

const FEATURED = PROJECTS.filter((project) => project.featured && !project.draft)

export function WorkSection(): JSX.Element {
  const t = useTranslations("custom.work")
  const [selected, setSelected] = useState<Project | null>(null)

  const nextProject = selected
    ? (FEATURED[(FEATURED.findIndex((project) => project.id === selected.id) + 1) % FEATURED.length] ?? null)
    : null

  return (
    <section id="work" className="relative bg-background">
      <div data-nav-ground="paper" className="pt-[calc(var(--nav-bar-height)+1.25rem)] pb-[clamp(1rem,1.5vw,1.75rem)]">
        <SectionHead
          label={t("caseStudies")}
          meta={<p className="type-label text-foreground">{`(${String(FEATURED.length).padStart(2, "0")})`}</p>}
          title={t("selected")}
          titleHidden
        />
      </div>

      {FEATURED.map((project) => (
        <ProjectShowcase key={project.id} project={project} onOpen={() => setSelected(project)} />
      ))}

      <ProjectIndex />

      <CaseStudyPanel project={selected} next={nextProject} onClose={() => setSelected(null)} onSelect={setSelected} />
    </section>
  )
}
