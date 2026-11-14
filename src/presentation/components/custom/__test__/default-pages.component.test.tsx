import type { ReactNode } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterContextProvider } from "@tanstack/react-router"
import { getRequest } from "@tanstack/react-start/server"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { IntlProvider } from "use-intl"
import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { createTestRouter } from "~/src/platform/testing/lib/render"

import { getTestMessages } from "~/src/integrations/use-intl/__test__/fixtures/messages"

import { DefaultError } from "~/src/presentation/components/custom/default-error"
import { DefaultNotFound } from "~/src/presentation/components/custom/default-not-found"

import globalErrors from "~/messages/en-US/errors.global.json"
import errorsPolish from "~/messages/pl-PL/errors.json"

const router = createTestRouter("/pl-PL/missing")

const renderPage = (page: ReactNode, locale: "en-US" | "pl-PL") =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterContextProvider router={router}>
        <IntlProvider locale={locale} messages={getTestMessages(locale)} timeZone="UTC">
          {page}
        </IntlProvider>
      </RouterContextProvider>
    </QueryClientProvider>,
  )

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("DefaultNotFound", () => {
  it("tells the visitor in their language and links back home in the same locale", () => {
    vi.mocked(getRequest).mockReturnValue(new Request("http://127.0.0.1:3001/pl-PL/missing"))

    renderPage(<DefaultNotFound />, "pl-PL")

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(errorsPolish.notFound.title)
    expect(screen.getByText(errorsPolish.notFound.description)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: errorsPolish.notFound.backHome })).toHaveAttribute("href", "/pl-PL")
  })
})

describe("DefaultError", () => {
  it("reports the error, explains it and reloads the route on request", async () => {
    const failure = new Error("boom")
    const logged = vi.spyOn(console, "error").mockReturnValue()
    const invalidate = vi.spyOn(router, "invalidate").mockResolvedValue()

    renderPage(<DefaultError error={failure} reset={vi.fn<() => void>()} />, "en-US")

    expect(screen.getByRole("alert")).toHaveTextContent(globalErrors.description)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(globalErrors.title)
    expect(logged).toHaveBeenCalledWith(failure)

    await userEvent.setup().click(screen.getByRole("button", { name: globalErrors.retry }))

    expect(invalidate).toHaveBeenCalledOnce()
  })
})
