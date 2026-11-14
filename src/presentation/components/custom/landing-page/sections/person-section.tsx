import type { JSX, ReactNode } from "react"

import { useTranslations } from "use-intl/react"

import { NAV_GROUND, SECTION_IDS, sectionHref } from "~/src/data/marketing"
import { SAASY_LAND_REPOSITORY } from "~/src/data/projects"

import { ArrowRightIcon, ArrowUpRightIcon } from "~/src/presentation/components/custom/icons"
import { ResponsiveImage } from "~/src/presentation/components/custom/landing-page/components/responsive-image"
import { Reveal } from "~/src/presentation/components/custom/landing-page/components/reveal"
import { RollText } from "~/src/presentation/components/custom/landing-page/components/roll-text"
import { SplitHeading } from "~/src/presentation/components/custom/landing-page/components/split-heading"

import {
  ANGULAR_PROJECTS_URL,
  GITHUB_PROFILE_URL,
  LINKEDIN_PROFILE_URL,
  REACT_PROJECTS_URL,
  SAASY_LAND_URL,
} from "~/src/presentation/branding"

const LEAD_CLASSNAME = "type-lead max-w-[32ch] text-[clamp(1.375rem,1.8vw,2.375rem)] text-foreground"

interface ProofLink {
  readonly href: string
  readonly label: string
}

interface Proof {
  readonly key: string
  readonly links?: readonly ProofLink[]
  readonly values?: { readonly stars: number }
}

const PROOFS: readonly Proof[] = [
  { key: "ibm", links: [{ href: LINKEDIN_PROFILE_URL, label: "LinkedIn" }] },
  { key: "nhs" },
  { key: "durham" },
  {
    key: "teach",
    links: [
      { href: REACT_PROJECTS_URL, label: "reactprojects.com" },
      { href: ANGULAR_PROJECTS_URL, label: "angularprojects.com" },
    ],
  },
  { key: "code", links: [{ href: GITHUB_PROFILE_URL, label: "GitHub" }] },
  {
    key: "live",
    links: [
      { href: SAASY_LAND_URL, label: "saasyland.com" },
      { href: SAASY_LAND_REPOSITORY.url, label: "GitHub" },
    ],
    values: { stars: SAASY_LAND_REPOSITORY.stars },
  },
]

interface ProofRowProps {
  readonly body: string
  readonly links: readonly ProofLink[] | undefined
  readonly title: string
}

const ProofRow = ({ body, links, title }: ProofRowProps): JSX.Element => (
  <div className="grid gap-x-6 gap-y-1 border-b border-border py-[clamp(0.75rem,1.15vw,1.4rem)] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
    <dt className="type-title text-[clamp(1.125rem,1.25vw,1.625rem)] text-foreground">{title}</dt>
    <dd className="type-body text-[clamp(0.9375rem,0.95vw,1.1875rem)]">
      {body}
      {links?.map((link) => (
        <span key={link.label}>
          {" "}
          <a
            className="group inline-flex items-center gap-1 font-medium whitespace-nowrap text-foreground"
            href={link.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            <RollText>{link.label}</RollText>
            <ArrowUpRightIcon className="size-[0.85em] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </span>
      ))}
    </dd>
  </div>
)

interface TeachingLinkProps {
  readonly children: ReactNode
  readonly href: string
}

const TeachingLink = ({ children, href }: TeachingLinkProps): JSX.Element => (
  <a
    className="font-medium text-foreground underline decoration-foreground/30 underline-offset-[0.2em] transition-colors duration-200 hover:decoration-foreground"
    href={href}
    rel="noopener noreferrer"
    target="_blank"
  >
    {children}
  </a>
)

const TEACHING_LINKS = {
  angular: (chunks: ReactNode): JSX.Element => <TeachingLink href={ANGULAR_PROJECTS_URL}>{chunks}</TeachingLink>,
  react: (chunks: ReactNode): JSX.Element => <TeachingLink href={REACT_PROJECTS_URL}>{chunks}</TeachingLink>,
}

export const PersonSection = (): JSX.Element => {
  const t = useTranslations("pages.landing.person")

  return (
    <section className="relative z-10 grid bg-background md:grid-cols-2" data-nav-ground={NAV_GROUND.PAPER} id={SECTION_IDS.ABOUT}>
      <div className="relative aspect-[4/5] overflow-hidden bg-[#3a3b3d] md:sticky md:top-(--nav-bar-height) md:aspect-auto md:h-[calc(100svh-var(--nav-bar-height))]">
        <div className="absolute inset-0 scale-105">
          <ResponsiveImage
            alt={t("portraitAlt")}
            className="object-cover object-[50%_12%]"
            isFill
            name="about-standing"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </div>

      <div className="px-(--gutter) pt-[calc(var(--nav-height)+clamp(1.5rem,3vw,4rem))] pb-(--section-y) md:px-[clamp(2rem,4vw,5.5rem)]">
        <Reveal variant="slide-right">
          <p className="type-label text-foreground">{t("label")}</p>
        </Reveal>
        <SplitHeading className="mt-[clamp(1rem,1.8vw,2.25rem)] type-display text-[clamp(2.875rem,5.2vw,7.5rem)]">
          {t("title")}
        </SplitHeading>

        <Reveal className="mt-[clamp(1.75rem,3vw,3.75rem)]">
          <p className={LEAD_CLASSNAME}>{t("storyLead")}</p>
        </Reveal>
        <Reveal className="mt-[clamp(1rem,1.5vw,1.875rem)] flex max-w-[60ch] flex-col gap-[clamp(0.75rem,1vw,1.25rem)]">
          <p className="type-body">{t("story1")}</p>
          <p className="type-body">{t("story2")}</p>
          <p className="type-body">{t("storyPassion")}</p>
          <p className="type-body">{t("storyFocus")}</p>
          <p className="type-body">{t("storyStack")}</p>
          <p className="type-body">{t.rich("storyTeach", TEACHING_LINKS)}</p>
        </Reveal>

        <div className="mt-[clamp(3.5rem,6.5vw,8rem)]">
          <Reveal variant="slide-right">
            <p className="type-label text-foreground">{t("proofLabel")}</p>
            <h3 className="mt-[clamp(0.5rem,0.8vw,1rem)] type-title text-[clamp(1.625rem,2.3vw,3.25rem)] text-foreground">
              {t("proofTitle")}
            </h3>
          </Reveal>
          <Reveal>
            <dl className="mt-[clamp(1.25rem,2vw,2.5rem)] border-t border-foreground">
              {PROOFS.map(({ key, links, values }) => (
                <ProofRow body={t(`${key}Body`, values)} key={key} links={links} title={t(`${key}Title`)} />
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal className="mt-[clamp(3.5rem,6.5vw,8rem)]">
          <p className={LEAD_CLASSNAME}>{t("closingLead")}</p>
          <p className="mt-[clamp(0.75rem,1.2vw,1.5rem)] max-w-[60ch] type-body">{t("story3")}</p>
          <a
            className="group mt-[clamp(1.25rem,2vw,2.25rem)] inline-flex items-center gap-2 border-b border-foreground pb-0.5 font-medium tracking-[-0.012em]"
            href={sectionHref(SECTION_IDS.CONTACT)}
          >
            <RollText>{t("link")}</RollText>
            <ArrowRightIcon className="size-[1.1em] transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
