"use client"

import type { JSX } from "react"

import { Controller, useFormContext } from "react-hook-form"

import { cn } from "~/src/lib/utils"

import { Field, FieldError, FieldLabel } from "~/src/components/shadcn/field"

interface ContactFieldProps {
  className?: string
  label: string
  multiline?: boolean
  name: string
  placeholder?: string
  type?: string
}

const CONTROL =
  "w-full rounded-none border-0 border-b border-input bg-transparent px-0 py-2 text-[clamp(1.0625rem,1.2vw,1.375rem)] text-foreground tracking-[-0.01em] outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-(--emerald) focus:shadow-[0_1px_0_0_var(--emerald)] aria-invalid:border-signal"

export function ContactField({
  className,
  label,
  multiline = false,
  name,
  placeholder,
  type = "text",
}: Readonly<ContactFieldProps>): JSX.Element {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field className={cn("gap-1.5", className)} data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`contact-form-${name}`} className="type-label text-foreground">
            {label}
          </FieldLabel>
          {multiline ? (
            <textarea
              {...field}
              id={`contact-form-${name}`}
              rows={3}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
              className={cn(CONTROL, "resize-none leading-[1.4]")}
            />
          ) : (
            <input
              {...field}
              id={`contact-form-${name}`}
              type={type}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
              className={CONTROL}
            />
          )}
          {fieldState.invalid && fieldState.error?.message && (
            <FieldError className="text-[0.8125rem] text-signal">{fieldState.error.message}</FieldError>
          )}
        </Field>
      )}
    />
  )
}
