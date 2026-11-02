import type { JSX, MouseEventHandler } from "react"

import { cn } from "~/src/lib/utils"

import { ArrowRightIcon } from "~/src/components/custom/icons"
import { RollText } from "~/src/components/custom/roll-text"

interface CtaLinkProps {
  children: string
  className?: string
  href: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  size?: "default" | "compact"
}

export function CtaLink({ children, className, href, onClick, size = "default" }: Readonly<CtaLinkProps>): JSX.Element {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center overflow-hidden bg-(--cta-bg) font-medium text-(--cta-ink) tracking-[-0.012em] active:translate-y-px",
        size === "default" ? "px-5 py-3.5 text-[0.9375rem]" : "px-3.5 py-2 text-sm",
        className,
      )}
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
}
