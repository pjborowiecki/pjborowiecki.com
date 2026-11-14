import { QueryClient } from "@tanstack/react-query"
import { getRequest } from "@tanstack/react-start/server"
import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { ROOT_NAMESPACES, loadNamespace, messagesQueryOptions, preloadNamespaces } from "~/src/integrations/use-intl/i18n.messages"
import { type NamespaceEntry, buildMessageTree } from "~/src/integrations/use-intl/i18n.tree"
import { LOCALE_REWRITE, getCurrentLocale } from "~/src/integrations/use-intl/i18n.utils"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("current locale", () => {
  it("reads the locale of the request on the server", () => {
    vi.mocked(getRequest).mockReturnValue(new Request("https://pjborowiecki.com/pl-PL"))
    expect(getCurrentLocale()).toBe("pl-PL")

    vi.mocked(getRequest).mockReturnValue(new Request("https://pjborowiecki.com/"))
    expect(getCurrentLocale()).toBe("en-US")
  })

  it("rewrites router URLs between the public and the internal path", () => {
    vi.mocked(getRequest).mockReturnValue(new Request("https://pjborowiecki.com/pl-PL"))

    expect(LOCALE_REWRITE.input?.({ url: new URL("https://pjborowiecki.com/pl-PL#about") })?.toString()).toBe(
      "https://pjborowiecki.com/#about",
    )
    expect(LOCALE_REWRITE.output?.({ url: new URL("https://pjborowiecki.com/#about") })?.toString()).toBe(
      "https://pjborowiecki.com/pl-PL#about",
    )
  })
})

describe("message namespaces", () => {
  it("loads every namespace the root route declares", () => {
    expect(ROOT_NAMESPACES.toSorted()).toStrictEqual([
      "components.custom.back-to-top",
      "components.custom.footer",
      "components.custom.navigation",
      "errors",
      "errors.global",
    ])
  })

  it("names the locale and the namespace of a missing file", () => {
    expect(() => loadNamespace({ locale: "pl-PL", namespace: "missing" })).toThrow("No messages/pl-PL/missing.json")
  })

  it("merges parent and child namespaces without mutating imported messages", () => {
    const parent = { title: "Errors" }

    expect(
      buildMessageTree([
        ["errors", parent],
        ["errors.global", { title: "Something went wrong" }],
      ]),
    ).toStrictEqual({ errors: { global: { title: "Something went wrong" }, title: "Errors" } })
    expect(
      buildMessageTree([
        ["errors.global", { title: "Something went wrong" }],
        ["errors", parent],
      ]),
    ).toStrictEqual({ errors: { global: { title: "Something went wrong" }, title: "Errors" } })
    expect(parent).toStrictEqual({ title: "Errors" })
  })

  it("merges a parent namespace's nested messages with those of a child namespace in either order", () => {
    const child: NamespaceEntry = ["errors.global", { title: "Something went wrong" }]
    const parent: NamespaceEntry = ["errors", { global: { retry: "Try again" } }]
    const merged = { errors: { global: { retry: "Try again", title: "Something went wrong" } } }

    expect(buildMessageTree([child, parent])).toStrictEqual(merged)
    expect(buildMessageTree([parent, child])).toStrictEqual(merged)
  })

  it("keeps each locale and namespace separate in one query cache", async () => {
    const queryClient = new QueryClient()
    const english = { locale: "en-US", namespace: "errors" } as const
    const polish = { locale: "pl-PL", namespace: "errors" } as const

    await preloadNamespaces({ locale: "en-US", namespaces: ["errors"], queryClient })
    await queryClient.query(messagesQueryOptions(polish))

    expect(queryClient.getQueryData(messagesQueryOptions(english).queryKey)).toStrictEqual(await loadNamespace(english))
    expect(queryClient.getQueryData(messagesQueryOptions(polish).queryKey)).toStrictEqual(await loadNamespace(polish))
  })
})
