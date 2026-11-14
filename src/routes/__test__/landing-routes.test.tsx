import { renderToString } from "react-dom/server"

import { RouterProvider, createMemoryHistory } from "@tanstack/react-router"
import { getRequest } from "@tanstack/react-start/server"
import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { SECTION_IDS } from "~/src/data/marketing"

import landingEnglish from "~/messages/en-US/pages.landing.json"
import landingPolish from "~/messages/pl-PL/pages.landing.json"
import { getRouter } from "~/src/router"

const PAGES = [
  { landing: landingEnglish, locale: "en-US", path: "/" },
  { landing: landingPolish, locale: "pl-PL", path: "/pl-PL" },
] as const

const renderPage = async (path: string): Promise<{ html: string; router: ReturnType<typeof getRouter> }> => {
  vi.mocked(getRequest).mockReturnValue(new Request(`http://127.0.0.1:3001${path}`))
  const router = getRouter()
  router.update({ context: router.options.context, history: createMemoryHistory({ initialEntries: [path] }) })
  await router.load()

  return { html: renderToString(<RouterProvider router={router} />), router }
}

describe.each(PAGES)("the $locale landing page", ({ landing, locale, path }) => {
  it("renders every section in its language before any JavaScript runs", async () => {
    const { html } = await renderPage(path)

    expect(html).toContain(`<html class="bg-background text-foreground antialiased" lang="${locale}">`)
    for (const id of Object.values(SECTION_IDS)) {
      expect(html).toContain(`id="${id}"`)
    }
    expect(html).toContain(landing.contact.formTitle)
    expect(html).toContain(landing.consult.cta)
  })

  it("describes itself to search engines and social cards from its own messages", async () => {
    const { router } = await renderPage(path)
    const match = router.state.matches.at(-1)

    expect(match?.meta).toContainEqual({ title: landing.metadata.title })
    expect(match?.meta).toContainEqual({ content: landing.metadata.description, name: "description" })
    expect(match?.links).toContainEqual({ href: `https://pjborowiecki.com${path}`, rel: "canonical" })
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("the document shell", () => {
  it("sets the scripting flag before paint and keeps previews out of search results", async () => {
    const { html, router } = await renderPage("/")

    expect(html).toContain("document.documentElement.classList.add('js')")
    expect(router.state.matches[0]?.meta).toContainEqual({ content: "noindex, nofollow", name: "robots" })
    expect(router.state.matches[0]?.links).toContainEqual({ href: "/favicon.ico", rel: "icon", sizes: "any" })
  })

  it("lets search engines index production", async () => {
    vi.stubEnv("MODE", "production")

    const { router } = await renderPage("/")

    expect(router.state.matches[0]?.meta).not.toContainEqual({ content: "noindex, nofollow", name: "robots" })
  })
})
