import type { JSX, MouseEventHandler } from "react"

import { cn } from "~/src/lib/cn"

import { ArrowRightIcon } from "~/src/presentation/components/custom/icons"
import { RollText } from "~/src/presentation/components/custom/landing-page/components/roll-text"

interface CtaLinkProps {
  readonly children: string
  readonly className?: string
  readonly href: string
  readonly onClick?: MouseEventHandler<HTMLAnchorElement>
  readonly size?: "compact" | "default"
}

export const CtaLink = ({ children, className, href, onClick, size = "default" }: CtaLinkProps): JSX.Element => (
  <a
    className={cn(
      "group relative inline-flex items-center overflow-hidden bg-(--cta-bg) font-medium tracking-[-0.012em] text-(--cta-ink) active:translate-y-px",
      { "px-3.5 py-2 text-sm": size === "compact", "px-5 py-3.5 text-[0.9375rem]": size === "default" },
      className,
    )}
    href={href}
    onClick={onClick}
  >
    <span
      aria-hidden
      className="absolute inset-0 origin-bottom scale-y-0 bg-(--cta-hover) transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-y-100"
    />
    <span className="relative flex w-full items-center justify-between gap-2.5">
      <RollText>{children}</RollText>
      <ArrowRightIcon className="size-[1.15em] transition-transform duration-300 ease-out group-hover:translate-x-1" />
    </span>
  </a>
)
