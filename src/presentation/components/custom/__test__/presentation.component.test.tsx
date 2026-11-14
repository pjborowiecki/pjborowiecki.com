import type { ReactNode } from "react"

import { cleanup, render, screen, within } from "@testing-library/react"
import { IntlProvider } from "use-intl"
import { afterEach, describe, expect, it } from "vite-plus/test"

import { getTestMessages } from "~/src/integrations/use-intl/__test__/fixtures/messages"

import { CERTIFICATION_LOGO } from "~/src/data/certifications"
import { NAV_ITEMS } from "~/src/data/marketing"

import { Footer } from "~/src/presentation/components/custom/footer"
import {
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  CloseIcon,
  IssuerLogo,
  SpinnerIcon,
  StarIcon,
} from "~/src/presentation/components/custom/icons"
import { CtaLink } from "~/src/presentation/components/custom/landing-page/components/cta-link"
import { NameMark, NameMarkStacked } from "~/src/presentation/components/custom/landing-page/components/name-mark"
import { ResponsiveImage } from "~/src/presentation/components/custom/landing-page/components/responsive-image"
import { RollText } from "~/src/presentation/components/custom/landing-page/components/roll-text"
import { ValidationFieldError } from "~/src/presentation/components/custom/validation-field-error"

import errors from "~/messages/en-US/errors.json"
import footer from "~/messages/pl-PL/components.custom.footer.json"
import navigation from "~/messages/pl-PL/components.custom.navigation.json"
import { CONTACT_EMAIL, SOCIAL_PROFILES } from "~/src/presentation/branding"

const withMessages = (children: ReactNode, locale: "en-US" | "pl-PL" = "en-US") => (
  <IntlProvider locale={locale} messages={getTestMessages(locale)} timeZone="UTC">
    {children}
  </IntlProvider>
)

afterEach(() => {
  cleanup()
})

describe("Footer", () => {
  it("links every section, the email address and both profiles, in the page's language", () => {
    render(withMessages(<Footer />, "pl-PL"))

    const explore = screen.getByRole("navigation", { name: footer.footerExplore })
    expect(
      within(explore)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toStrictEqual(NAV_ITEMS.map(({ key }) => `${navigation.items[key]}${navigation.items[key]}`))
    expect(screen.getByRole("link", { name: new RegExp(CONTACT_EMAIL, "u") })).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`)
    for (const { name, url } of SOCIAL_PROFILES) {
      expect(screen.getByRole("link", { name: new RegExp(name, "u") })).toHaveAttribute("href", url)
    }
    expect(screen.getByText(footer.footerLine)).toBeInTheDocument()
  })
})

describe("icons", () => {
  it("are decorative and take their colour from the text", () => {
    const { container } = render(
      <>
        <ArrowRightIcon />
        <ArrowUpIcon />
        <ArrowUpRightIcon />
        <CloseIcon />
        <SpinnerIcon />
        <StarIcon className="size-4" />
        {Object.values(CERTIFICATION_LOGO).map((logo) => (
          <IssuerLogo key={logo} logo={logo} />
        ))}
      </>,
    )

    const icons = container.querySelectorAll("svg")
    expect(icons).toHaveLength(6 + Object.values(CERTIFICATION_LOGO).length)
    for (const icon of icons) {
      expect(icon).toHaveAttribute("aria-hidden", "true")
      expect(icon.querySelector("path")).not.toBeNull()
    }
  })
})

describe("links and text", () => {
  it("renders the call to action as one link whose rolling twin is hidden from assistive technology", () => {
    render(
      <CtaLink href="#contact" size="compact">
        Let’s talk
      </CtaLink>,
    )

    const link = screen.getByRole("link", { name: "Let’s talk" })
    expect(link).toHaveAttribute("href", "#contact")
    expect(link).toHaveClass("px-3.5")
    expect(link.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0)
  })

  it("rolls a label without repeating it to screen readers", () => {
    render(<RollText>Selected work</RollText>)

    expect(screen.getAllByText("Selected work")).toHaveLength(2)
    expect(screen.getAllByText("Selected work")[1]).toHaveAttribute("aria-hidden", "true")
  })

  it("draws the name in one line or two, always hidden behind the real heading", () => {
    const { container } = render(
      <>
        <NameMark />
        <NameMarkStacked />
      </>,
    )

    expect(container.querySelectorAll("svg[data-name-mark]")).toHaveLength(3)
    expect(container.querySelectorAll("[data-name-zoom] path[data-word]")).toHaveLength(4)
  })
})

describe("ResponsiveImage", () => {
  it("offers every width and loads lazily by default", () => {
    render(<ResponsiveImage alt="Portrait" name="about-standing" sizes="50vw" />)

    const image = screen.getByRole("img", { name: "Portrait" })
    expect(image).toHaveAttribute("loading", "lazy")
    expect(image).toHaveAttribute("fetchpriority", "auto")
    expect(image).not.toHaveClass("absolute")
    expect(image).toHaveAttribute("sizes", "50vw")
    expect(image.getAttribute("srcset")?.split(", ").length).toBeGreaterThan(1)
  })

  it("fills its frame and loads first when it is the main image", () => {
    render(<ResponsiveImage alt="Hero" isFill isPriority name="hero-subject" sizes="100vw" />)

    const image = screen.getByRole("img", { name: "Hero" })
    expect(image).toHaveAttribute("loading", "eager")
    expect(image).toHaveAttribute("fetchpriority", "high")
    expect(image).toHaveClass("absolute", "inset-0", "size-full")
  })
})

describe("ValidationFieldError", () => {
  it("translates a known message with its limits and falls back for an unknown one", () => {
    render(
      withMessages(
        <>
          <ValidationFieldError message="nameTooLong" namespace="pages.landing.contact.validation" params={{ nameTooLong: { max: 120 } }} />
          <ValidationFieldError message="unknownProblem" namespace="pages.landing.contact.validation" />
        </>,
      ),
    )

    expect(screen.getByText("Please keep the name under 120 characters")).toBeInTheDocument()
    expect(screen.getByText(errors.codes.VALIDATION)).toBeInTheDocument()
  })

  it("renders nothing without a message", () => {
    const { container } = render(
      withMessages(
        <>
          <ValidationFieldError namespace="pages.landing.contact.validation" />
          <ValidationFieldError message="" namespace="pages.landing.contact.validation" />
        </>,
      ),
    )

    expect(container).toBeEmptyDOMElement()
  })
})
