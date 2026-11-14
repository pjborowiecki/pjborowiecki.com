import type { AbstractIntlMessages } from "use-intl"

type MessageTree = Record<string, AbstractIntlMessages>

export type NamespaceEntry = readonly [namespace: string, messages: AbstractIntlMessages]

const NAMESPACE_SEPARATOR = "."

export const toNamespace = (path: string): string => path.replaceAll(/^.*\/|\.json$/gu, "")

const isMessageTree = (value: AbstractIntlMessages | string | undefined): value is MessageTree => typeof value === "object"

const mergeMessages = (target: AbstractIntlMessages, source: AbstractIntlMessages): AbstractIntlMessages => {
  const merged: AbstractIntlMessages = { ...target }

  for (const [key, value] of Object.entries(source)) {
    const existing = merged[key]
    merged[key] = isMessageTree(existing) && isMessageTree(value) ? mergeMessages(existing, value) : value
  }

  return merged
}

const insertNamespace = ({ messages, namespace, tree }: { messages: AbstractIntlMessages; namespace: string; tree: MessageTree }): void => {
  const separator = namespace.lastIndexOf(NAMESPACE_SEPARATOR)
  const leaf = namespace.slice(separator + NAMESPACE_SEPARATOR.length)
  const parents = namespace.slice(0, Math.max(separator, 0)).split(NAMESPACE_SEPARATOR).filter(Boolean)

  let node = tree

  for (const segment of parents) {
    const existing = node[segment]
    const child = isMessageTree(existing) ? { ...existing } : {}

    node[segment] = child
    node = child
  }

  const existing = node[leaf]
  node[leaf] = isMessageTree(existing) ? mergeMessages(existing, messages) : messages
}

export const buildMessageTree = (entries: readonly NamespaceEntry[]): AbstractIntlMessages => {
  const tree: MessageTree = {}

  for (const [namespace, messages] of entries) {
    insertNamespace({ messages, namespace, tree })
  }

  return tree
}
