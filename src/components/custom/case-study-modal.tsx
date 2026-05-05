"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { useTranslations } from "next-intl"
import { createPortal } from "react-dom"

import { Button } from "~/src/components/shadcn/button"

import { Reveal } from "./reveal"
import type { Project } from "~/src/types"

interface CaseStudyModalProps {
  project: Project | null
  onClose: () => void
}

export default function CaseStudyModal({ project, onClose }: CaseStudyModalProps) {
  const t = useTranslations("custom.modal")
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [project])

  useGSAP(() => {
    if (project && containerRef.current && contentRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power3.out" })
      gsap.fromTo(contentRef.current, { x: "100%" }, { x: "0%", duration: 0.6, ease: "power3.out" })
    }
  }, [project])

  const handleClose = () => {
    if (containerRef.current && contentRef.current) {
      gsap.to(contentRef.current, { x: "100%", duration: 0.4, ease: "power3.in" })
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power3.in",
        onComplete: onClose,
      })
    } else {
      onClose()
    }
  }

  if (!mounted || !project) return null

  return createPortal(
    <div ref={containerRef} className="fixed inset-0 z-[100] flex justify-end opacity-0" data-lenis-prevent="true">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 block h-full w-full bg-background/90 backdrop-blur-md"
        onClick={handleClose}
      />

      <div className="pointer-events-none absolute top-0 right-0 z-[110] flex items-center gap-4 p-8 mix-blend-difference">
        <Button
          variant="ghost"
          onClick={handleClose}
          className="group pointer-events-auto flex items-center gap-2 font-mono text-foreground text-xs uppercase tracking-widest transition-colors hover:bg-transparent hover:text-accent"
        >
          <span>{t("close")}</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
            {"X"}
          </div>
        </Button>
      </div>

      <article
        ref={contentRef}
        data-lenis-prevent="true"
        className="relative h-full w-full translate-x-full overflow-y-auto border-border border-l bg-background shadow-2xl lg:w-[85vw]"
      >
        <header className="relative h-[60vh] w-full md:h-[70vh]">
          <Image
            fill
            src={project.image}
            sizes="(max-width: 768px) 100vw, 100vw"
            priority
            className="object-cover opacity-60 grayscale"
            alt={project.title}
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 w-full p-8 md:p-24">
            <Reveal>
              <h1 className="mb-6 font-bold font-display text-6xl text-foreground uppercase leading-[0.8] tracking-tighter md:text-8xl lg:text-9xl">
                {project.title}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-6 flex flex-col gap-8 border-border border-t pt-6 font-mono text-muted-foreground text-sm uppercase tracking-widest md:flex-row">
                <div>
                  <span className="mb-1 block text-foreground">{t("role")}</span>
                  {t("lead")}
                </div>
                <div>
                  <span className="mb-1 block text-foreground">{t("year")}</span>
                  {project.year}
                </div>
                <div>
                  <span className="mb-1 block text-foreground">{t("category")}</span>
                  {project.category}
                </div>
              </div>
            </Reveal>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-6 py-24 md:px-24">
          <div className="mb-32 grid grid-cols-1 gap-16 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h3 className="sticky top-12 font-mono text-muted-foreground text-sm uppercase tracking-widest">{t("brief")}</h3>
            </div>
            <div className="lg:col-span-8">
              <p className="font-light text-2xl text-foreground leading-relaxed md:text-3xl">
                {project.shortDescription} {project.challenge}
              </p>
              <div className="mt-12 flex flex-wrap gap-3">
                {project.techStack?.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-4 py-2 font-mono text-muted-foreground text-sm transition-colors hover:border-foreground/50"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <hr className="mb-32 border-border" />

          <div className="grid grid-cols-1 gap-24 lg:grid-cols-2">
            <div>
              <Reveal>
                <h3 className="mb-8 font-bold font-display text-4xl text-foreground">{t("architectural")}</h3>
                <p className="mb-8 text-lg text-muted-foreground leading-relaxed">{project.solution}</p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {
                    "We focused heavily on component modularity and separation of concerns. By utilizing a micro-frontend approach, we decoupled the deployment cycles of the dashboard from the core marketing site."
                  }
                </p>
              </Reveal>
            </div>

            <div>
              <Reveal delay={0.2}>
                <div className="flex h-full flex-col justify-center border border-border bg-muted p-12">
                  <div className="mb-6 font-bold font-display text-6xl text-accent">{t("results")}</div>
                  <p className="font-light text-foreground text-xl italic leading-relaxed">
                    {'"'}
                    {project.outcome}
                    {'"'}
                  </p>
                  <div className="mt-12 flex gap-12">
                    <div>
                      <span className="block font-bold text-3xl text-foreground">{"99.9%"}</span>
                      <span className="font-mono text-muted-foreground text-sm uppercase">{t("uptime")}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-3xl text-foreground">{"-40%"}</span>
                      <span className="font-mono text-muted-foreground text-sm uppercase">{t("latency")}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          <button
            type="button"
            className="group mt-32 flex w-full cursor-pointer items-center justify-between border-border border-t pt-32 text-left"
            onClick={handleClose}
          >
            <span className="font-mono text-muted-foreground text-sm uppercase tracking-widest">{t("nextProject")}</span>
            <h2 className="font-bold font-display text-4xl text-foreground transition-colors group-hover:text-accent md:text-6xl">
              {t("comingSoon")}
            </h2>
          </button>
        </section>
      </article>
    </div>,
    document.body,
  )
}
