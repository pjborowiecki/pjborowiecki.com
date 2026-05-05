"use client"

import type { JSX } from "react"

import { useTranslations } from "next-intl"

import { CONSTANTS } from "~/src/constants"

import { Reveal } from "~/src/components/custom/reveal"

export function ContactInfo(): JSX.Element {
  const t = useTranslations("custom.contact")

  return (
    <div className="flex h-full flex-col justify-between lg:col-span-5">
      <Reveal>
        <h2 className="mb-8 font-black font-sans text-7xl text-foreground leading-[0.85] tracking-tighter md:text-9xl">{t("start")}</h2>
        <p className="mb-12 max-w-md font-light text-lg text-muted-foreground leading-relaxed">{t("interested")}</p>
      </Reveal>

      <div className="hidden lg:block">
        <Reveal delay={0.2}>
          <div className="space-y-8">
            <div className="flex flex-col">
              <h3 className="mb-2 font-mono text-foreground text-xs uppercase tracking-widest">{t("email")}</h3>
              <a href={`mailto:${CONSTANTS.EMAIL}`} className="text-muted-foreground text-xl transition-colors hover:text-foreground">
                {CONSTANTS.EMAIL}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
