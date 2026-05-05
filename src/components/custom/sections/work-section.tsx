"use client"

import Image from "next/image"
import { type JSX, useEffect, useState } from "react"

import { useTranslations } from "next-intl"

import CaseStudyModal from "~/src/components/custom/case-study-modal"
import { Reveal } from "~/src/components/custom/reveal"

import { PROJECTS } from "~/src/data"
import type { Project } from "~/src/types"

export function WorkSection(): JSX.Element {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })

  const t = useTranslations("custom.work")
  const visibleProjects = PROJECTS?.filter((p) => !p.draft) || []

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
    globalThis.addEventListener("mousemove", handleMouseMove)
    return () => globalThis.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <>
      <section id="work" className="relative py-32">
        <div className="pointer-events-none fixed inset-0 z-20 hidden md:block">
          {visibleProjects.map((project) => (
            <div
              key={project.id}
              className="absolute top-0 left-0 h-[300px] w-[450px] overflow-hidden border border-border bg-background object-cover shadow-2xl transition-all duration-300 ease-out"
              style={{
                opacity: hoveredProject === project.id ? 1 : 0,
                transform: `translate(${cursorPos.x + 20}px, ${cursorPos.y - 150}px)`,
              }}
            >
              <Image
                fill
                src={project.image}
                alt={project.title}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover contrast-125 grayscale"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
            </div>
          ))}
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12">
          <Reveal variant="slide-right">
            <div className="mb-16 flex items-center gap-4">
              <div className="h-2 w-2 bg-foreground"></div>
              <h2 className="font-mono text-foreground text-xs uppercase tracking-widest">
                {t("selected", { count: visibleProjects.length })}
              </h2>
            </div>
          </Reveal>

          <div className="flex flex-col border-border border-t">
            {visibleProjects.map((project, index) => (
              <button
                type="button"
                key={project.id}
                className="group w-full cursor-pointer border-border border-b px-4 py-16 text-left transition-colors duration-300 hover:bg-foreground/2 md:px-8"
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                  <div className="flex flex-col gap-2 overflow-hidden">
                    <Reveal variant="text-mask" delay={index * 0.1}>
                      <h3 className="font-black font-sans text-5xl text-foreground tracking-tighter transition-all duration-300 group-hover:bg-linear-to-r group-hover:from-foreground group-hover:to-foreground/50 group-hover:bg-clip-text group-hover:text-transparent md:text-7xl">
                        {project.title}
                      </h3>
                    </Reveal>
                    <Reveal variant="blur-slide" delay={index * 0.1 + 0.1}>
                      <span className="pl-1 font-mono text-primary text-sm uppercase tracking-widest">{project.category}</span>
                    </Reveal>
                  </div>

                  <div className="flex flex-col items-end gap-4 transition-opacity duration-300 md:opacity-50 md:group-hover:opacity-100">
                    <Reveal variant="slide-right" delay={index * 0.1 + 0.2}>
                      <span className="font-bold font-sans text-foreground text-xl">{project.year}</span>
                    </Reveal>
                    <Reveal variant="slide-right" delay={index * 0.1 + 0.3}>
                      <div className="flex flex-wrap justify-end gap-2">
                        {project.techStack?.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="border border-border px-3 py-1 text-muted-foreground text-xs uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </Reveal>
                    <div className="mt-2 flex items-center gap-2 font-mono text-primary text-xs uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100">
                      <span>{t("readCaseStudy")}</span>
                      <span className="text-lg leading-none">{"\u2192"}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <CaseStudyModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  )
}
