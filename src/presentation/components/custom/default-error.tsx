import { type JSX, useEffect } from "react"

import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { type ErrorComponentProps, useRouter } from "@tanstack/react-router"
import { useTranslations } from "use-intl/react"

import { Button } from "~/src/presentation/components/shadcn/button"

export const DefaultError = ({ error }: ErrorComponentProps): JSX.Element => {
  const t = useTranslations("errors.global")
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    console.error(error)
    queryErrorResetBoundary.reset()
  }, [error, queryErrorResetBoundary])

  return (
    <main className="frame flex min-h-svh flex-col items-start justify-center gap-6 py-24" role="alert">
      <h1 className="type-display text-[clamp(2.5rem,6vw,6rem)]">{t("title")}</h1>
      <p className="max-w-[46ch] type-body">{t("description")}</p>
      <Button
        className="h-11 rounded-none px-5"
        onPress={() => {
          void router.invalidate()
        }}
      >
        {t("retry")}
      </Button>
    </main>
  )
}
