import { RouterContextProvider } from "@tanstack/react-router"
import { getRequest } from "@tanstack/react-start/server"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Link } from "react-aria-components"
import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { createTestRouter } from "~/src/platform/testing/lib/router"

import { AriaProvider } from "~/src/providers/aria-provider"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("AriaProvider", () => {
  it("points React Aria links at the page's locale and navigates through the router", async () => {
    vi.mocked(getRequest).mockReturnValue(new Request("http://127.0.0.1:3001/pl-PL"))
    const router = createTestRouter("/pl-PL")
    const navigate = vi.spyOn(router, "navigate").mockResolvedValue()

    render(
      <RouterContextProvider router={router}>
        <AriaProvider>
          <Link href="/">Home</Link>
        </AriaProvider>
      </RouterContextProvider>,
    )

    const link = screen.getByRole("link", { name: "Home" })
    expect(link).toHaveAttribute("href", "/pl-PL")

    await userEvent.setup().click(link)

    expect(navigate).toHaveBeenCalledWith(expect.objectContaining({ to: "/" }))
  })
})
