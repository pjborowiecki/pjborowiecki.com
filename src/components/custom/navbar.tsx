"use client"

import { type JSX, useRef } from "react"

import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { useTranslations } from "next-intl"

import { Button } from "~/src/components/shadcn/button"

import { NAV_ITEMS } from "~/src/data"

export function Navbar(): JSX.Element {
  const t = useTranslations("custom.navbar")
  const navRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(".nav-brand", { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.1 })
      gsap.fromTo(".nav-menu", { scaleX: 0.5, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 })
      gsap.fromTo(".nav-item", { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.3 })
    },
    { scope: navRef },
  )

  return (
    <nav ref={navRef} className="pointer-events-none absolute top-0 left-0 z-50 w-full py-8 md:fixed">
      <div className="container mx-auto flex items-center justify-between gap-4 px-6 md:items-start md:px-12">
        <div className="nav-brand pointer-events-auto mix-blend-difference">
          <a href="/" className="group flex flex-col gap-1">
            <span className="font-black font-sans text-foreground text-xl uppercase leading-none tracking-tighter transition-colors group-hover:text-foreground/50">
              {"Piotr J."}
            </span>
            <span className="font-black font-sans text-muted-foreground text-xl uppercase leading-none tracking-tighter transition-colors group-hover:text-foreground">
              {"Borowiecki"}
            </span>
          </a>
        </div>

        <div
          className={`nav-menu pointer-events-auto hidden origin-right items-center gap-2 border border-border bg-background/80 px-2 py-2 backdrop-blur-md transition-transform duration-500 md:flex`}
        >
          {NAV_ITEMS?.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="nav-item group relative overflow-hidden px-5 py-2 font-mono text-muted-foreground text-xs uppercase tracking-widest transition-all duration-300 hover:bg-muted hover:text-foreground"
            >
              <span className="relative z-10">{item.label}</span>
            </a>
          ))}
          <div className="nav-item">
            <a
              href="#contact"
              className="ml-2 bg-foreground px-6 py-2 font-mono text-background text-xs uppercase tracking-widest transition-colors duration-300 hover:bg-primary hover:text-foreground"
            >
              {t("letsTalk")}
            </a>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="pointer-events-auto shrink-0 text-foreground mix-blend-difference md:hidden">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <title>{"Menu"}</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
      </div>
    </nav>
  )
}
