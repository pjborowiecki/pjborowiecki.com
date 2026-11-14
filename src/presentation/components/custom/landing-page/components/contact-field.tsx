import type { JSX } from "react"

import { type StringField, fieldErrorMessage } from "~/src/integrations/tanstack-form/form.fields"

import { CONTACT_VALIDATION_PARAMS } from "~/src/data/contact"

import { cn } from "~/src/lib/cn"

import { Field, FieldLabel } from "~/src/presentation/components/shadcn/field"
import { Input } from "~/src/presentation/components/shadcn/input"
import { Textarea } from "~/src/presentation/components/shadcn/textarea"

import { ValidationFieldError } from "~/src/presentation/components/custom/validation-field-error"

const CONTROL =
  "h-auto w-full rounded-none border-0 border-b border-input bg-transparent px-0 py-2 text-[clamp(1.0625rem,1.2vw,1.375rem)] tracking-[-0.01em] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-(--emerald) focus:shadow-[0_1px_0_0_var(--emerald)] focus-visible:border-(--emerald) focus-visible:ring-0 aria-invalid:border-signal aria-invalid:ring-0 md:text-[clamp(1.0625rem,1.2vw,1.375rem)]"

const DETAILS_ROWS = 3

interface ContactFieldProps {
  readonly autoComplete?: string
  readonly field: StringField
  readonly isMultiline?: boolean
  readonly label: string
  readonly placeholder?: string
  readonly type?: "email" | "text"
}

export const ContactField = ({
  autoComplete,
  field,
  isMultiline = false,
  label,
  placeholder,
  type = "text",
}: ContactFieldProps): JSX.Element => {
  const id = `contact-form-${field.name}`
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const control = {
    "aria-describedby": isInvalid ? `${id}-error` : undefined,
    "aria-invalid": isInvalid,
    id,
    name: field.name,
    onBlur: field.handleBlur,
    ...(placeholder !== undefined && { placeholder }),
    value: field.state.value,
  }

  return (
    <Field className="gap-1.5" data-invalid={isInvalid}>
      <FieldLabel className="type-label text-xs text-foreground" htmlFor={id}>
        {label}
      </FieldLabel>
      {isMultiline && (
        <Textarea
          {...control}
          className={cn(CONTROL, "field-sizing-fixed min-h-0 resize-none leading-[1.4]")}
          onChange={(event) => {
            field.handleChange(event.target.value)
          }}
          rows={DETAILS_ROWS}
        />
      )}
      {!isMultiline && (
        <Input
          {...control}
          {...(autoComplete !== undefined && { autoComplete })}
          className={CONTROL}
          onChange={(event) => {
            field.handleChange(event.target.value)
          }}
          type={type}
        />
      )}
      {isInvalid && (
        <ValidationFieldError
          className="text-[0.8125rem] text-signal"
          id={`${id}-error`}
          message={fieldErrorMessage(field.state.meta.errors)}
          namespace="pages.landing.contact.validation"
          params={CONTACT_VALIDATION_PARAMS}
        />
      )}
    </Field>
  )
}
