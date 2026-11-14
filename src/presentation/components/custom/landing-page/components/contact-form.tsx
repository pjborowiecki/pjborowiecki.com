import { type JSX, useId } from "react"

import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { Button, ToggleButton, ToggleButtonGroup } from "react-aria-components"
import { toast } from "sonner"
import { useTranslations } from "use-intl/react"

import { getCurrentLocale } from "~/src/integrations/use-intl/i18n.utils"

import { CONTACT_BUDGETS, CONTACT_ERROR, CONTACT_NEEDS, type ContactError } from "~/src/data/contact"

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

interface ChoiceProps<TOption extends string> {
  readonly label: string
  readonly note?: string
  readonly onChange: (option: TOption | undefined) => void
  readonly optionLabel: (option: TOption) => string
  readonly options: readonly TOption[]
  readonly value: TOption | undefined
}

const Choice = <TOption extends string>({ label, note, onChange, optionLabel, options, value }: ChoiceProps<TOption>): JSX.Element => {
  const labelId = useId()

  return (
    <div>
      <p className="type-label text-foreground" id={labelId}>
        {label}
      </p>
      <ToggleButtonGroup
        aria-labelledby={labelId}
        className="mt-2.5 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2"
        onSelectionChange={(keys) => {
          onChange(options.find((option) => keys.has(option)))
        }}
        selectedKeys={options.filter((option) => option === value)}
        selectionMode="single"
      >
        {options.map((option) => (
          <ToggleButton
            className="flex min-h-11 cursor-pointer items-center border border-input px-3 py-2 text-left text-[0.875rem] leading-snug tracking-[-0.005em] transition-colors duration-200 hover:border-foreground sm:min-h-0 sm:px-3.5 sm:text-[clamp(0.875rem,0.95vw,1.0625rem)] sm:leading-normal data-selected:border-emerald data-selected:bg-emerald data-selected:text-cream"
            id={option}
            key={option}
          >
            {optionLabel(option)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {note !== undefined && <p className="mt-2.5 max-w-[60ch] text-[0.875rem] leading-snug text-muted-foreground">{note}</p>}
    </div>
  )
}

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
      id="contact-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup className={FIELD_GAP}>
        <form.Field name="need">
          {(field) => (
            <Choice
              label={t("needLabel")}
              onChange={field.handleChange}
              optionLabel={(option) => t(`needs.${option}`)}
              options={CONTACT_NEEDS}
              value={field.state.value}
            />
          )}
        </form.Field>
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
        <form.Field name="budget">
          {(field) => (
            <Choice
              label={t("budgetLabel")}
              note={t("budgetNote")}
              onChange={field.handleChange}
              optionLabel={(option) => t(`budgets.${option}`)}
              options={CONTACT_BUDGETS}
              value={field.state.value}
            />
          )}
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
