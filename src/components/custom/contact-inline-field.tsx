"use client"

import type { JSX } from "react"

import { Controller, useFormContext } from "react-hook-form"

import { cn } from "~/src/lib/utils"

import { Field, FieldError, FieldLabel } from "~/src/components/shadcn/field"
import { Input } from "~/src/components/shadcn/input"

interface ContactInlineFieldProps {
  name: string
  placeholder: string
  type?: string
  className?: string
}

export function ContactInlineField({ name, placeholder, type = "text", className }: Readonly<ContactInlineFieldProps>): JSX.Element {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field className={cn("relative inline-flex flex-col gap-0", className)} data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`contact-form-${name}`} className="sr-only">
            {placeholder}
          </FieldLabel>
          <Input
            {...field}
            type={type}
            id={`contact-form-${name}`}
            placeholder={placeholder}
            className="h-auto w-full rounded-none border-0 border-foreground/30 border-b bg-transparent px-2 py-1 text-center font-light text-2xl text-foreground shadow-none transition-colors placeholder:font-light placeholder:text-muted-foreground/40 placeholder:text-sm focus-visible:border-foreground focus-visible:ring-0 md:text-3xl md:placeholder:text-base dark:bg-transparent"
          />
          {fieldState.invalid && fieldState.error?.message && (
            <FieldError className="absolute right-0 -bottom-6 left-0 text-center text-[10px] md:text-xs">
              {fieldState.error.message}
            </FieldError>
          )}
        </Field>
      )}
    />
  )
}
