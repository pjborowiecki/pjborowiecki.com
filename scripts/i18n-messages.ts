import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import type { AbstractIntlMessages } from "use-intl"

import { type NamespaceEntry, buildMessageTree, toNamespace } from "~/src/integrations/use-intl/i18n.tree"

const MESSAGES_DIR = join(import.meta.dirname, "../messages")

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)

const isIntlMessages = (value: unknown): value is AbstractIntlMessages =>
  isPlainObject(value) && Object.values(value).every((entry) => typeof entry === "string" || isIntlMessages(entry))

const readMessageFile = (path: string): NamespaceEntry => {
  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"))

  if (!isIntlMessages(parsed)) {
    throw new Error(`Invalid message file: ${path}`)
  }

  return [toNamespace(path), parsed]
}

export const loadLocaleMessages = (locale: string): AbstractIntlMessages => {
  const localeDir = join(MESSAGES_DIR, locale)

  return buildMessageTree(
    readdirSync(localeDir)
      .filter((file) => file.endsWith(".json"))
      .toSorted((left, right) => left.localeCompare(right))
      .map((file) => readMessageFile(join(localeDir, file))),
  )
}

export const flattenMessages = (messages: AbstractIntlMessages, prefix = ""): [key: string, message: string][] =>
  Object.entries(messages).flatMap(([key, value]): [string, string][] => {
    const path = prefix.length > 0 ? `${prefix}.${key}` : key

    return typeof value === "string" ? [[path, value]] : flattenMessages(value, path)
  })
