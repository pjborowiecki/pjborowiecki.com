"use client"

import type { JSX } from "react"

import { useTranslations } from "next-intl"

import { CONSTANTS } from "~/src/constants"

export function ContactFooter(): JSX.Element {
  const t = useTranslations("custom.contact")

  return (
    <div className="mt-32 flex flex-col items-center justify-between border-border border-t pt-8 font-mono text-muted-foreground text-xs uppercase tracking-widest md:flex-row">
      <span>{t("copyright")}</span>
      <span>{t("location")}</span>
      <div className="mt-4 flex gap-8 md:mt-0">
        {CONSTANTS.SOCIAL_LINKS.map((link) => (
          <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
            {link.name}
          </a>
        ))}
      </div>
    </div>
  )
}
