"use client"

import { type JSX, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale, useTranslations } from "next-intl"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod/v4"

import type { Locale } from "~/src/constants/types"

import { isKnownError } from "~/src/lib/utils"

import { ContactField } from "~/src/components/custom/contact-field"
import { ContactFooter } from "~/src/components/custom/contact-footer"
import { ArrowRightIcon, SpinnerIcon } from "~/src/components/custom/icons"
import { Reveal } from "~/src/components/custom/reveal"
import { RollText } from "~/src/components/custom/roll-text"
import { SplitHeading } from "~/src/components/custom/split-heading"
import { FieldGroup } from "~/src/components/shadcn/field"

import { submitContactForm } from "~/src/actions/submit-contact-form"

const NEEDS = ["needAudit", "needAi", "needProject", "needOngoing"] as const
const BUDGETS = ["budgetRetainer", "budget15", "budget40", "budget100", "budget500", "budgetUndecided"] as const

interface ChoiceProps<T extends string> {
  label: string
  name: (option: T) => string
  note?: string
  onChange: (option: T | null) => void
  options: readonly T[]
  value: T | null
}

function Choice<T extends string>({ label, name, note, onChange, options, value }: Readonly<ChoiceProps<T>>): JSX.Element {
  return (
    <fieldset>
      <legend className="type-label text-foreground">{label}</legend>
      {/* Phones get an even two-column grid of equal tiles rather than a ragged run of pills. */}
      <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(value === option ? null : option)}
            className="flex min-h-11 items-center border border-input px-3 py-2 text-left text-[0.875rem] leading-snug tracking-[-0.005em] transition-colors duration-200 hover:border-foreground aria-pressed:border-emerald aria-pressed:bg-emerald aria-pressed:text-cream sm:min-h-0 sm:px-3.5 sm:text-[clamp(0.875rem,0.95vw,1.0625rem)] sm:leading-normal"
          >
            {name(option)}
          </button>
        ))}
      </div>
      {note && <p className="mt-2.5 max-w-[60ch] text-[0.875rem] text-muted-foreground leading-snug">{note}</p>}
    </fieldset>
  )
}

export function ContactSection(): JSX.Element {
  const t = useTranslations("custom.contact")
  const locale = useLocale() as Locale
  const [need, setNeed] = useState<(typeof NEEDS)[number] | null>(null)
  const [budget, setBudget] = useState<(typeof BUDGETS)[number] | null>(null)

  const formSchema = z.object({
    name: z.string().min(1, t("nameRequired")),
    company: z.string().optional(),
    email: z.email(t("emailRequired")),
    details: z.string().min(1, t("detailsRequired")),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      details: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    // The two choices travel with the message, so nothing changes for the mail action behind it.
    const context = [need && `${t("needLabel")}: ${t(need)}`, budget && `${t("budgetLabel")}: ${t(budget)}`].filter(Boolean).join("\n")
    const promise = submitContactForm({ ...data, details: context ? `${context}\n\n${data.details}` : data.details }, locale)

    toast.promise(promise, {
      loading: t("sending"),
      success: (result) => {
        if (!result.success) throw new Error(result.error)
        form.reset()
        setNeed(null)
        setBudget(null)
        return t("success")
      },
      error: (err) => {
        console.error("Failed to send email:", err)
        const msg = err instanceof Error ? err.message : ""

        if (isKnownError(msg)) {
          return t(msg)
        }
        return t("error")
      },
    })

    await promise
  }

  return (
    <section
      id="contact"
      data-nav-ground="lit"
      className="ground-emerald ground-lit relative z-10 overflow-hidden pt-[calc(var(--nav-height)+clamp(1rem,3vw,3.5rem))]"
    >
      <div className="frame relative grid gap-y-10 pb-[clamp(2.5rem,5vw,6rem)] md:grid-cols-12 md:gap-x-6">
        <div className="flex flex-col justify-between gap-10 md:col-span-5">
          <div>
            <Reveal variant="slide-right">
              <p className="type-label text-champagne">{t("label")}</p>
            </Reveal>
            <SplitHeading className="type-display mt-4 text-[clamp(3.25rem,7.6vw,11rem)] text-cream max-md:text-[2.75rem]">{t("start")}</SplitHeading>
            <Reveal className="mt-[clamp(1.25rem,2.4vw,2.75rem)]">
              <p className="type-lead max-w-[30ch] text-[clamp(1.1875rem,1.65vw,2.125rem)] text-cream">{t("interested")}</p>
            </Reveal>
          </div>
        </div>

        <Reveal variant="scale-in" className="md:col-span-7">
          <div data-light-ground className="surface-paper p-[clamp(1.5rem,3vw,4rem)] shadow-[0_50px_100px_-50px_rgb(0_0_0/65%)] max-sm:p-5">
            <div className="flex items-baseline justify-between gap-6 border-foreground border-b pb-3">
              <h3 className="type-title text-[clamp(1.5rem,2.2vw,3rem)]">{t("formTitle")}</h3>
              <p className="type-label hidden sm:block">{t("formNote")}</p>
            </div>

            <FormProvider {...form}>
              <form id="contact-form" noValidate onSubmit={form.handleSubmit(onSubmit)} className="mt-[clamp(1.25rem,2.2vw,2.5rem)]">
                <FieldGroup className="gap-[clamp(1.25rem,2vw,2.25rem)]">
                  <Choice label={t("needLabel")} options={NEEDS} value={need} onChange={setNeed} name={(option) => t(option)} />
                  <div className="grid gap-[clamp(1.25rem,2vw,2.25rem)] sm:grid-cols-2 sm:gap-x-6">
                    <ContactField name="name" label={t("fieldName")} />
                    <ContactField name="company" label={t("fieldCompany")} />
                  </div>
                  <ContactField name="email" type="email" label={t("fieldEmail")} />
                  <ContactField name="details" multiline label={t("fieldDetails")} placeholder={t("fieldDetailsHint")} />
                  <Choice
                    label={t("budgetLabel")}
                    note={t("budgetNote")}
                    options={BUDGETS}
                    value={budget}
                    onChange={setBudget}
                    name={(option) => t(option)}
                  />
                </FieldGroup>

                <div className="mt-[clamp(1.5rem,2.4vw,2.75rem)] flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="group relative inline-flex items-center overflow-hidden bg-(--cta-bg) px-6 py-4 font-medium text-(--cta-ink) text-base tracking-[-0.01em] active:translate-y-px disabled:opacity-70"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 origin-bottom scale-y-0 bg-(--cta-hover) transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-y-100"
                    />
                    <span className="relative flex items-center gap-3">
                      <RollText>{form.formState.isSubmitting ? t("sending") : t("send")}</RollText>
                      {form.formState.isSubmitting ? (
                        <SpinnerIcon className="size-[1.15em] animate-spin" />
                      ) : (
                        <ArrowRightIcon className="size-[1.15em] transition-transform duration-300 ease-out group-hover:translate-x-1" />
                      )}
                    </span>
                  </button>
                  <p className="max-w-[34ch] text-[0.875rem] text-muted-foreground leading-snug">{t("assurance")}</p>
                </div>
              </form>
            </FormProvider>
          </div>
        </Reveal>
      </div>

      <ContactFooter />
    </section>
  )
}
