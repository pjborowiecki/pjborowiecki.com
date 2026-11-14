import type { ReactNode } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { getRequest } from "@tanstack/react-start/server"
import { act, cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { IntlProvider } from "use-intl"
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { getTestMessages } from "~/src/integrations/use-intl/__test__/fixtures/messages"
import type { SupportedLocale } from "~/src/integrations/use-intl/i18n.config"

import { CONTACT_ERROR, CONTACT_VALIDATION_PARAMS } from "~/src/data/contact"

import * as contact from "~/src/lib/contact"

import { ContactForm } from "~/src/presentation/components/custom/landing-page/components/contact-form"

import landing from "~/messages/en-US/pages.landing.json"
import landingPolish from "~/messages/pl-PL/pages.landing.json"

const { contact: copy } = landing
const { contact: polishCopy } = landingPolish

const toastPromise = vi.spyOn(toast, "promise")

const submissions: Parameters<NonNullable<typeof contact.submitContactMessageMutation.mutationFn>>[0][] = []
const outcome: { result: () => Promise<void> } = { result: () => Promise.resolve() }

vi.spyOn(contact.submitContactMessageMutation, "mutationFn").mockImplementation(async (message) => {
  submissions.push(message)
  await outcome.result()
})

const renderForm = (locale: SupportedLocale = "en-US"): ReturnType<typeof userEvent.setup> => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const Providers = ({ children }: { readonly children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale={locale} messages={getTestMessages(locale)} timeZone="UTC">
        {children}
      </IntlProvider>
    </QueryClientProvider>
  )

  render(<ContactForm />, { wrapper: Providers })
  return userEvent.setup()
}

const fillValidMessage = async (user: ReturnType<typeof userEvent.setup>): Promise<void> => {
  await user.type(screen.getByLabelText(copy.fieldName), "Ada Lovelace")
  await user.type(screen.getByLabelText(copy.fieldEmail), "ada@example.org")
  await user.type(screen.getByLabelText(copy.fieldDetails), "Could we talk about payments?")
}

beforeEach(() => {
  submissions.length = 0
  outcome.result = () => Promise.resolve()
  toastPromise.mockClear()
})

afterEach(() => {
  cleanup()
})

describe("ContactForm", () => {
  it("shows what is missing on submit and points each field at its message", async () => {
    const user = renderForm()

    await user.click(screen.getByRole("button", { name: copy.send }))

    const name = screen.getByLabelText(copy.fieldName)
    expect(name).toHaveAttribute("aria-invalid", "true")
    expect(name).toHaveAttribute("aria-describedby", "contact-form-name-error")
    expect(screen.getByText(copy.validation.nameRequired)).toBeInTheDocument()
    expect(screen.getByText(copy.validation.emailRequired)).toBeInTheDocument()
    expect(screen.getByText(copy.validation.detailsRequired)).toBeInTheDocument()
    expect(submissions).toHaveLength(0)
  })

  it("explains a length limit with the limit in the message", async () => {
    const user = renderForm()

    await user.click(screen.getByLabelText(copy.fieldName))
    await user.paste("x".repeat(CONTACT_VALIDATION_PARAMS.nameTooLong.max + 1))
    await user.tab()

    expect(
      screen.getByText(`Please keep the name under ${String(CONTACT_VALIDATION_PARAMS.nameTooLong.max)} characters`),
    ).toBeInTheDocument()
  })

  it("sends the message in the page's language, then resets", async () => {
    vi.mocked(getRequest).mockReturnValue(new Request("http://127.0.0.1:3001/pl-PL"))
    const user = renderForm("pl-PL")

    await user.type(screen.getByLabelText(polishCopy.fieldName), "Jan")
    await user.type(screen.getByLabelText(polishCopy.fieldEmail), "jan@example.org")
    await user.type(screen.getByLabelText(polishCopy.fieldDetails), "Dzień dobry")
    await user.click(screen.getByRole("button", { name: polishCopy.send }))

    expect(submissions).toStrictEqual([
      {
        company: "",
        details: "Dzień dobry",
        email: "jan@example.org",
        locale: "pl-PL",
        name: "Jan",
      },
    ])
    expect(toastPromise).toHaveBeenCalledOnce()
  })

  it("shows that the message is on its way while it is being sent", async () => {
    const delivery = Promise.withResolvers<void>()
    outcome.result = () => delivery.promise
    const user = renderForm()
    await fillValidMessage(user)

    await user.click(screen.getByRole("button", { name: copy.send }))

    expect(await screen.findByRole("button", { name: copy.sending })).toHaveAttribute("data-pending", "true")
    await act(async () => {
      delivery.resolve()
      await delivery.promise
    })
    expect(await screen.findByRole("button", { name: copy.send })).not.toHaveAttribute("data-pending")
  })

  it("announces success and empties the form", async () => {
    const user = renderForm()
    await fillValidMessage(user)

    await user.click(screen.getByRole("button", { name: copy.send }))

    const [, messages] = toastPromise.mock.calls[0] ?? []
    await act(async () => {
      await Promise.resolve()
    })
    expect(typeof messages?.success === "function" && messages.success(undefined)).toBe(copy.success)
    expect(screen.getByLabelText(copy.fieldName)).toHaveValue("")
  })

  it.each([
    [new Error(CONTACT_ERROR.RATE_LIMITED), copy.errors.RATE_LIMITED],
    [new Error(CONTACT_ERROR.INVALID_EMAIL), copy.errors.INVALID_EMAIL],
    [new Error("unexpected"), copy.errors.SEND_FAILED],
    ["not an error", copy.errors.SEND_FAILED],
  ])("explains a failed message: %s", async (failure, message) => {
    outcome.result = () => Promise.reject(new Error(CONTACT_ERROR.SEND_FAILED))
    const user = renderForm()
    await fillValidMessage(user)

    await user.click(screen.getByRole("button", { name: copy.send }))

    const [, messages] = toastPromise.mock.calls[0] ?? []
    expect(typeof messages?.error === "function" && messages.error(failure)).toBe(message)
    expect(messages?.loading).toBe(copy.sending)
  })
})
