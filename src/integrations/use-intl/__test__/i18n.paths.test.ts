import { describe, expect, it } from "vite-plus/test"

import { I18N } from "~/src/integrations/use-intl/i18n.config"
import {
  canonicalizePathname,
  deLocalizePathname,
  extractLocaleFromPath,
  isSupportedLocale,
  localeLinks,
  localizePathname,
  shouldIgnorePath,
} from "~/src/integrations/use-intl/i18n.paths"

describe("locale paths", () => {
  it("serves English without a prefix and Polish under /pl-PL", () => {
    expect(localizePathname({ locale: "en-US", pathname: "/" })).toBe("/")
    expect(localizePathname({ locale: "pl-PL", pathname: "/" })).toBe("/pl-PL")
    expect(localizePathname({ locale: "pl-PL", pathname: "/en-US" })).toBe("/pl-PL")
  })

  it("canonicalizes the short and default-locale aliases", () => {
    expect(canonicalizePathname("/pl")).toBe("/pl-PL")
    expect(canonicalizePathname("/en")).toBe("/")
    expect(canonicalizePathname("/en-US")).toBe("/")
    expect(canonicalizePathname("/pl-PL")).toBe("/pl-PL")
    expect(canonicalizePathname("/de")).toBe("/de")
    expect(canonicalizePathname("/")).toBe("/")
  })

  it("strips a locale prefix in front of a server function path", () => {
    expect(canonicalizePathname("/pl-PL/_serverFn/abc")).toBe("/_serverFn/abc")
  })

  it("round-trips the home page through each locale", () => {
    for (const locale of I18N.SUPPORTED_LOCALES) {
      expect(deLocalizePathname(localizePathname({ locale, pathname: "/" }))).toBe("/")
    }
  })

  it("keeps external, fragment and server function links unchanged", () => {
    for (const pathname of ["https://example.com", "//example.com", "#contact", "mailto:hello@pjborowiecki.com", "/_serverFn/abc"]) {
      expect(localizePathname({ locale: "pl-PL", pathname })).toBe(pathname)
    }
  })

  it("reads only a non-default supported locale from a path", () => {
    expect(extractLocaleFromPath("/pl-PL")).toBe("pl-PL")
    expect(extractLocaleFromPath("/pl-PL/anything")).toBe("pl-PL")
    expect(extractLocaleFromPath("/en-US")).toBeUndefined()
    expect(extractLocaleFromPath("/de-DE")).toBeUndefined()
    expect(extractLocaleFromPath("/")).toBeUndefined()
  })

  it("recognizes supported locales and ignored paths", () => {
    expect(isSupportedLocale("pl-PL")).toBe(true)
    expect(isSupportedLocale("pl")).toBe(false)
    expect(shouldIgnorePath("/_serverFn")).toBe(true)
    expect(shouldIgnorePath("/_serverFnx")).toBe(false)
  })

  it("links every locale and the default as alternates of the canonical page", () => {
    expect(localeLinks({ origin: "https://pjborowiecki.com", pathname: "/pl-PL" })).toStrictEqual([
      { href: "https://pjborowiecki.com/pl-PL", rel: "canonical" },
      { href: "https://pjborowiecki.com/", hrefLang: "en-US", rel: "alternate" },
      { href: "https://pjborowiecki.com/pl-PL", hrefLang: "pl-PL", rel: "alternate" },
      { href: "https://pjborowiecki.com/", hrefLang: "x-default", rel: "alternate" },
    ])
  })
})
