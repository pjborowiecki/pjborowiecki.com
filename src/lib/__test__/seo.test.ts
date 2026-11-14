import { describe, expect, it } from "vite-plus/test"

import { buildPageHead, pageHead, toOpenGraphLocale } from "~/src/lib/seo"

import { APP_NAME } from "~/src/presentation/branding"

const metaContent = (head: ReturnType<typeof buildPageHead>, key: string): string | undefined =>
  head.meta.find((entry) => ("property" in entry && entry.property === key) || ("name" in entry && entry.name === key))?.content

describe("page head", () => {
  it("describes the Polish home page with its canonical URL, alternates and social card", () => {
    const head = buildPageHead({ description: "Opis", locale: "pl-PL", pathname: "/", title: "Tytuł" })

    expect(head.meta[0]).toStrictEqual({ title: "Tytuł" })
    expect(metaContent(head, "description")).toBe("Opis")
    expect(metaContent(head, "og:url")).toBe("https://pjborowiecki.com/pl-PL")
    expect(metaContent(head, "og:locale")).toBe("pl_PL")
    expect(metaContent(head, "og:type")).toBe("profile")
    expect(metaContent(head, "og:image")).toBe("https://pjborowiecki.com/images/promo/social/pjborowiecki-og-image.jpg")
    expect(metaContent(head, "twitter:card")).toBe("summary_large_image")
    expect(head.links[0]).toStrictEqual({ href: "https://pjborowiecki.com/pl-PL", rel: "canonical" })
  })

  it("falls back to the site's name and the default locale", () => {
    const head = buildPageHead({ pathname: "/" })

    expect(head.meta[0]).toStrictEqual({ title: APP_NAME })
    expect(metaContent(head, "og:url")).toBe("https://pjborowiecki.com/")
    expect(metaContent(head, "description")).toBe("")
  })

  it("builds the head of a route from its loader data", () => {
    const head = pageHead("/")({ loaderData: { locale: "en-US", metadata: { description: "About", title: "Home" } } })

    expect(head.meta[0]).toStrictEqual({ title: "Home" })
    expect(pageHead("/")({}).meta[0]).toStrictEqual({ title: APP_NAME })
  })

  it("writes Open Graph locales with an underscore", () => {
    expect(toOpenGraphLocale("en-US")).toBe("en_US")
  })
})
