"use client"

import type { JSX } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod/v4"

import type { Locale } from "~/src/constants/types"

import { isKnownError } from "~/src/lib/utils"

import { ContactFooter } from "~/src/components/custom/contact-footer"
import { ContactInfo } from "~/src/components/custom/contact-info"
import { ContactInlineField } from "~/src/components/custom/contact-inline-field"
import { Reveal } from "~/src/components/custom/reveal"
import { Button } from "~/src/components/shadcn/button"
import { FieldGroup } from "~/src/components/shadcn/field"

import { submitContactForm } from "~/src/actions/submit-contact-form"

export function ContactSection(): JSX.Element {
  const t = useTranslations("custom.contact")
  const locale = useLocale() as Locale

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
    const promise = submitContactForm(data, locale)

    toast.promise(promise, {
      loading: t("sending"),
      success: (result) => {
        if (!result.success) throw new Error(result.error)
        form.reset()
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
    <section id="contact" className="relative overflow-hidden border-border border-t py-8 md:py-32">
      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-24">
          <ContactInfo />

          <div className="lg:col-span-7">
            <Reveal delay={0.1} width="100%">
              <FormProvider {...form}>
                <form id="contact-form" onSubmit={form.handleSubmit(onSubmit)}>
                  <FieldGroup>
                    <div className="flex flex-col gap-12 font-light text-2xl text-muted-foreground leading-relaxed md:text-3xl">
                      <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                        <span>{t("hello")}</span>
                        <ContactInlineField name="name" placeholder={t("placeholderName")} className="w-full sm:w-48 md:w-64" />
                        <span>{t("andFrom")}</span>
                        <ContactInlineField name="company" placeholder={t("placeholderCompany")} className="w-full sm:w-48 md:w-64" />
                        <span>{"."}</span>
                      </div>

                      <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                        <span>{t("partner")}</span>
                        <ContactInlineField
                          name="details"
                          placeholder={t("placeholderProject")}
                          className="w-full sm:min-w-[250px] sm:flex-1 md:min-w-[300px]"
                        />
                        <span>{"."}</span>
                      </div>

                      <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                        <span>{t("reachMe")}</span>
                        <ContactInlineField
                          name="email"
                          type="email"
                          placeholder={t("placeholderEmail")}
                          className="w-full sm:min-w-[200px] sm:flex-1 md:min-w-[250px]"
                        />
                        <span>{t("discuss")}</span>
                      </div>
                    </div>
                  </FieldGroup>

                  <div className="flex justify-end pt-16">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={form.formState.isSubmitting}
                      className="group relative inline-flex items-center gap-3 overflow-hidden rounded-none bg-foreground px-4 py-3 text-background transition-colors hover:bg-primary disabled:opacity-70 md:px-10 md:py-8"
                    >
                      {form.formState.isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin text-background transition-colors group-hover:text-foreground" />
                      )}
                      <span className="relative z-10 font-bold text-sm uppercase tracking-widest transition-colors group-hover:text-foreground">
                        {form.formState.isSubmitting ? t("sending") : t("send")}
                      </span>
                      {!form.formState.isSubmitting && (
                        <span className="relative z-10 transition-colors group-hover:text-foreground">{"\u2192"}</span>
                      )}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </Reveal>
          </div>
        </div>

        <ContactFooter />
      </div>
    </section>
  )
}
