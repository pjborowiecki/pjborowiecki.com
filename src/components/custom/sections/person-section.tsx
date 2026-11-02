"use client"

import Image from "next/image"
import type { JSX, ReactNode } from "react"

import { useTranslations } from "next-intl"

import { CONSTANTS } from "~/src/constants"

import { ArrowRightIcon, ArrowUpRightIcon } from "~/src/components/custom/icons"
import { Reveal } from "~/src/components/custom/reveal"
import { RollText } from "~/src/components/custom/roll-text"
import { SplitHeading } from "~/src/components/custom/split-heading"

import { PROJECTS } from "~/src/data"

const LEAD = "type-lead max-w-[32ch] text-[clamp(1.375rem,1.8vw,2.375rem)] text-foreground"

const SAASY_LAND = PROJECTS.find((project) => project.id === "saasyland")

const socialLink = (name: string) => CONSTANTS.SOCIAL_LINKS.find((link) => link.name === name)?.url

// Names in plain text, each with exactly what it was. A logo would imply an endorsement none of them gave.
const PROOF: ReadonlyArray<{ key: string; links?: ReadonlyArray<{ href?: string; label: string }> }> = [
  { key: "ibm", links: [{ href: socialLink("LinkedIn"), label: "LinkedIn" }] },
  { key: "nhs" },
  { key: "durham" },
  {
    key: "teach",
    links: [
      { href: "https://reactprojects.com", label: "reactprojects.com" },
      { href: "https://angularprojects.com", label: "angularprojects.com" },
    ],
  },
  { key: "code", links: [{ href: socialLink("GitHub"), label: "GitHub" }] },
  {
    key: "live",
    links: [
      { href: SAASY_LAND?.url, label: "saasyland.com" },
      { href: SAASY_LAND?.github?.url, label: "GitHub" },
    ],
  },
]

interface ProofRowProps {
  body: string
  links?: ReadonlyArray<{ href?: string; label: string }>
  title: string
}

function ProofRow({ body, links, title }: Readonly<ProofRowProps>): JSX.Element {
  return (
    <div className="grid gap-x-6 gap-y-1 border-border border-b py-[clamp(0.75rem,1.15vw,1.4rem)] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <dt className="type-title text-[clamp(1.125rem,1.25vw,1.625rem)] text-foreground">{title}</dt>
      <dd className="type-body text-[clamp(0.9375rem,0.95vw,1.1875rem)]">
        {body}
        {links?.map((link) => (
          <span key={link.label}>
            {" "}
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 whitespace-nowrap font-medium text-foreground"
            >
              <RollText>{link.label}</RollText>
              <ArrowUpRightIcon className="size-[0.85em] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </span>
        ))}
      </dd>
    </div>
  )
}

const TEACHING = { react: "https://reactprojects.com", angular: "https://angularprojects.com" } as const

function TeachingLink({ children, href }: Readonly<{ children: ReactNode; href: string }>): JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-foreground underline decoration-foreground/30 underline-offset-[0.2em] transition-colors duration-200 hover:decoration-foreground"
    >
      {children}
    </a>
  )
}

export function PersonSection(): JSX.Element {
  const t = useTranslations("custom.person")

  return (
    <section id="about" data-nav-ground="paper" className="relative z-10 grid bg-background md:grid-cols-2">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#3a3b3d] md:sticky md:top-(--nav-bar-height) md:aspect-auto md:h-[calc(100svh-var(--nav-bar-height))]">
        <div className="absolute inset-0 scale-105">
          <Image
            fill
            src="/images/site/about-standing.webp"
            alt={t("portraitAlt")}
            sizes="(min-width: 768px) 50vw, 100vw"
            quality={88}
            className="object-cover object-[50%_12%]"
          />
        </div>
      </div>

      {/* Four steps of ink and size: heading, lead sentence, muted body, and small print in the proof list. */}
      <div className="px-(--gutter) pt-[calc(var(--nav-height)+clamp(1.5rem,3vw,4rem))] pb-(--section-y) md:px-[clamp(2rem,4vw,5.5rem)]">
        <Reveal variant="slide-right">
          <p className="type-label text-foreground">{t("label")}</p>
        </Reveal>
        <SplitHeading className="type-display mt-[clamp(1rem,1.8vw,2.25rem)] text-[clamp(2.875rem,5.2vw,7.5rem)]">
          {t("title")}
        </SplitHeading>

        <Reveal className="mt-[clamp(1.75rem,3vw,3.75rem)]">
          <p className={LEAD}>{t("storyLead")}</p>
        </Reveal>
        <Reveal className="mt-[clamp(1rem,1.5vw,1.875rem)] flex max-w-[60ch] flex-col gap-[clamp(0.75rem,1vw,1.25rem)]">
          <p className="type-body">{t("story1")}</p>
          <p className="type-body">{t("story2")}</p>
          <p className="type-body">{t("storyPassion")}</p>
          <p className="type-body">{t("storyFocus")}</p>
          <p className="type-body">{t("storyStack")}</p>
          <p className="type-body">
            {t.rich("storyTeach", {
              react: (chunks) => <TeachingLink href={TEACHING.react}>{chunks}</TeachingLink>,
              angular: (chunks) => <TeachingLink href={TEACHING.angular}>{chunks}</TeachingLink>,
            })}
          </p>
        </Reveal>

        <div className="mt-[clamp(3.5rem,6.5vw,8rem)]">
          <Reveal variant="slide-right">
            <p className="type-label text-foreground">{t("proofLabel")}</p>
            <h3 className="type-title mt-[clamp(0.5rem,0.8vw,1rem)] text-[clamp(1.625rem,2.3vw,3.25rem)] text-foreground">
              {t("proofTitle")}
            </h3>
          </Reveal>
          <Reveal>
            <dl className="mt-[clamp(1.25rem,2vw,2.5rem)] border-foreground border-t">
              {PROOF.map((row) => (
                <ProofRow key={row.key} title={t(`${row.key}Title`)} body={t(`${row.key}Body`)} links={row.links} />
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal className="mt-[clamp(3.5rem,6.5vw,8rem)]">
          <p className={LEAD}>{t("closingLead")}</p>
          <p className="type-body mt-[clamp(0.75rem,1.2vw,1.5rem)] max-w-[60ch]">{t("story3")}</p>
          <a
            href="#offer"
            className="group mt-[clamp(1.25rem,2vw,2.25rem)] inline-flex items-center gap-2 border-foreground border-b pb-0.5 font-medium tracking-[-0.012em]"
          >
            <RollText>{t("link")}</RollText>
            <ArrowRightIcon className="size-[1.1em] transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
