import type { JSX } from "react"

import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { Button } from "react-aria-components"
import { toast } from "sonner"
import { useTranslations } from "use-intl/react"

import { getCurrentLocale } from "~/src/integrations/use-intl/i18n.utils"

import { CONTACT_ERROR, CONTACT_FORM_ID, type ContactError } from "~/src/data/contact"

import { cn } from "~/src/lib/cn"
import { type ContactForm as ContactFormValues, contactFormSchema, submitContactMessageMutation } from "~/src/lib/contact"

import { FieldGroup } from "~/src/presentation/components/shadcn/field"

import { ArrowRightIcon, SpinnerIcon } from "~/src/presentation/components/custom/icons"
import { ContactField } from "~/src/presentation/components/custom/landing-page/components/contact-field"
import { RollText } from "~/src/presentation/components/custom/landing-page/components/roll-text"

const DEFAULT_VALUES: ContactFormValues = { company: "", details: "", email: "", name: "" }

const CONTACT_ERRORS = new Set<string>(Object.values(CONTACT_ERROR))

const isContactError = (message: string): message is ContactError => CONTACT_ERRORS.has(message)

const contactErrorOf = (error: unknown): ContactError =>
  error instanceof Error && isContactError(error.message) ? error.message : CONTACT_ERROR.SEND_FAILED

const FIELD_GAP = "gap-[clamp(1.25rem,2vw,2.25rem)]"

export const ContactForm = (): JSX.Element => {
  const t = useTranslations("pages.landing.contact")
  const submit = useMutation(submitContactMessageMutation)

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: ({ formApi, value }) => {
      toast.promise(submit.mutateAsync({ ...value, locale: getCurrentLocale() }), {
        error: (error: unknown) => t(`errors.${contactErrorOf(error)}`),
        loading: t("sending"),
        success: () => {
          formApi.reset()
          return t("success")
        },
      })
    },
    validators: { onChange: contactFormSchema, onSubmit: contactFormSchema },
  })

  return (
    <form
      className="mt-[clamp(1.25rem,2.2vw,2.5rem)]"
      id={CONTACT_FORM_ID}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup className={FIELD_GAP}>
        <div className={cn("grid sm:grid-cols-2 sm:gap-x-6", FIELD_GAP)}>
          <form.Field name="name">{(field) => <ContactField autoComplete="name" field={field} label={t("fieldName")} />}</form.Field>
          <form.Field name="company">
            {(field) => <ContactField autoComplete="organization" field={field} label={t("fieldCompany")} />}
          </form.Field>
        </div>
        <form.Field name="email">
          {(field) => <ContactField autoComplete="email" field={field} label={t("fieldEmail")} type="email" />}
        </form.Field>
        <form.Field name="details">
          {(field) => <ContactField field={field} isMultiline label={t("fieldDetails")} placeholder={t("fieldDetailsHint")} />}
        </form.Field>
      </FieldGroup>

      <div className="mt-[clamp(1.5rem,2.4vw,2.75rem)] flex flex-wrap items-center justify-between gap-4">
        <Button
          className="group relative inline-flex cursor-pointer items-center overflow-hidden bg-(--cta-bg) px-6 py-4 text-base font-medium tracking-[-0.01em] text-(--cta-ink) data-pending:opacity-70 data-pressed:translate-y-px"
          isPending={submit.isPending}
          type="submit"
        >
          <span
            aria-hidden
            className="absolute inset-0 origin-bottom scale-y-0 bg-(--cta-hover) transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-y-100"
          />
          <span className="relative flex items-center gap-3">
            <RollText>{t(submit.isPending ? "sending" : "send")}</RollText>
            {submit.isPending && <SpinnerIcon className="size-[1.15em] animate-spin" />}
            {!submit.isPending && (
              <ArrowRightIcon className="size-[1.15em] transition-transform duration-300 ease-out group-hover:translate-x-1" />
            )}
          </span>
        </Button>
        <p className="max-w-[34ch] text-[0.875rem] leading-snug text-muted-foreground">{t("assurance")}</p>
      </div>
    </form>
  )
}
