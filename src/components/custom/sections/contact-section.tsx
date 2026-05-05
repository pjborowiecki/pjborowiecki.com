"use client"

import { type ChangeEvent, type JSX, type SubmitEvent, useState } from "react"

import { useTranslations } from "next-intl"

import { Reveal } from "~/src/components/custom/reveal"
import { Button } from "~/src/components/shadcn/button"
import { Input } from "~/src/components/shadcn/input"

export function ContactSection(): JSX.Element {
  const t = useTranslations("custom.contact")

  const [formState, setFormState] = useState({
    name: "",
    company: "",
    email: "",
    details: "",
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert("This is a demo form. In a real app, this would send an email.")
  }

  return (
    <section id="contact" className="relative overflow-hidden border-border border-t py-32">
      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-24">
          {/* Left: Heading */}
          <div className="flex h-full flex-col justify-between lg:col-span-5">
            <Reveal>
              <h2 className="mb-8 font-black font-sans text-7xl text-foreground leading-[0.85] tracking-tighter md:text-9xl">
                {t("start")}
              </h2>
              <p className="mb-12 max-w-md font-light text-lg text-muted-foreground leading-relaxed">{t("interested")}</p>
            </Reveal>

            <div className="hidden lg:block">
              <Reveal delay={0.2}>
                <div className="space-y-8">
                  <div className="flex flex-col">
                    <h3 className="mb-2 font-mono text-foreground text-xs uppercase tracking-widest">{t("email")}</h3>
                    <a
                      href="mailto:contact@pjborowiecki.com"
                      className="text-muted-foreground text-xl transition-colors hover:text-foreground"
                    >
                      {"contact@pjborowiecki.com"}
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          <div className="pt-4 lg:col-span-7">
            <Reveal delay={0.1} width="100%">
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="flex flex-col gap-8 font-light text-2xl text-muted-foreground leading-relaxed md:text-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{t("hello")}</span>
                    <Input
                      type="text"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      placeholder={t("placeholderName")}
                      className="h-auto w-64 rounded-none border-0 border-foreground/30 border-b bg-transparent px-2 py-1 text-center font-light text-2xl text-foreground shadow-none transition-colors placeholder:font-light placeholder:text-muted-foreground/40 placeholder:text-sm focus-visible:border-foreground focus-visible:ring-0 md:text-3xl md:placeholder:text-base dark:bg-transparent"
                    />
                    <span>{t("andFrom")}</span>
                    <Input
                      type="text"
                      name="company"
                      value={formState.company}
                      onChange={handleChange}
                      placeholder={t("placeholderCompany")}
                      className="h-auto w-64 rounded-none border-0 border-foreground/30 border-b bg-transparent px-2 py-1 text-center font-light text-2xl text-foreground shadow-none transition-colors placeholder:font-light placeholder:text-muted-foreground/40 placeholder:text-sm focus-visible:border-foreground focus-visible:ring-0 md:text-3xl md:placeholder:text-base dark:bg-transparent"
                    />
                    <span>{"."}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span>{t("partner")}</span>
                    <Input
                      type="text"
                      name="details"
                      value={formState.details}
                      onChange={handleChange}
                      placeholder={t("placeholderProject")}
                      className="h-auto min-w-[300px] flex-1 rounded-none border-0 border-foreground/30 border-b bg-transparent px-2 py-1 text-center font-light text-2xl text-foreground shadow-none transition-colors placeholder:font-light placeholder:text-muted-foreground/40 placeholder:text-sm focus-visible:border-foreground focus-visible:ring-0 md:text-3xl md:placeholder:text-base dark:bg-transparent"
                    />
                    <span>{"."}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span>{t("reachMe")}</span>
                    <Input
                      type="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      placeholder={t("placeholderEmail")}
                      className="h-auto w-64 rounded-none border-0 border-foreground/30 border-b bg-transparent px-2 py-1 text-center font-light text-2xl text-foreground shadow-none transition-colors placeholder:font-light placeholder:text-muted-foreground/40 placeholder:text-sm focus-visible:border-foreground focus-visible:ring-0 md:text-3xl md:placeholder:text-base dark:bg-transparent"
                    />
                    <span>{t("discuss")}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-12">
                  <Button
                    type="submit"
                    size="lg"
                    className="group relative inline-flex items-center gap-3 overflow-hidden rounded-none bg-foreground px-10 py-8 text-background transition-colors hover:bg-primary"
                  >
                    <span className="relative z-10 font-bold text-sm uppercase tracking-widest transition-colors group-hover:text-foreground">
                      {t("send")}
                    </span>
                    <span className="relative z-10 transition-colors group-hover:text-foreground">{"\u2192"}</span>
                  </Button>
                </div>
              </form>
            </Reveal>
          </div>
        </div>

        <div className="mt-32 flex flex-col items-center justify-between border-border border-t pt-8 font-mono text-muted-foreground text-xs uppercase tracking-widest md:flex-row">
          <span>{t("copyright")}</span>
          <span>{t("location")}</span>
          <div className="mt-4 flex gap-8 md:mt-0">
            <a
              href="https://www.linkedin.com/in/pjborowiecki"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {"LinkedIn"}
            </a>
            <a
              href="https://github.com/pjborowiecki"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {"GitHub"}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
