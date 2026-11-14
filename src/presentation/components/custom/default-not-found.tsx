import type { JSX } from "react"

import { Link } from "@tanstack/react-router"
import { useTranslations } from "use-intl/react"

import { HTTP_STATUS } from "~/src/data/http"

import { buttonVariants } from "~/src/presentation/components/shadcn/button"

import { ROUTES } from "~/src/routes"

export const DefaultNotFound = (): JSX.Element => {
  const t = useTranslations("errors.notFound")

  return (
    <main className="frame flex min-h-svh flex-col items-start justify-center gap-6 py-24">
      <p className="type-label">{HTTP_STATUS.NOT_FOUND}</p>
      <h1 className="type-display text-[clamp(2.5rem,6vw,6rem)]">{t("title")}</h1>
      <p className="max-w-[46ch] type-body">{t("description")}</p>
      <Link className={buttonVariants({ className: "h-11 rounded-none px-5", variant: "default" })} to={ROUTES.HOME}>
        {t("backHome")}
      </Link>
    </main>
  )
}
