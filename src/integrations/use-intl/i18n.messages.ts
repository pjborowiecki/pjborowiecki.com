import { type QueryClient, queryOptions } from "@tanstack/react-query"
import type { AbstractIntlMessages } from "use-intl"

import type { SupportedLocale } from "~/src/integrations/use-intl/i18n.config"
import { type NamespaceEntry, toNamespace } from "~/src/integrations/use-intl/i18n.tree"

interface PageMetadata {
  description: string
  title: string
}

const MESSAGES_QUERY_KEY = "i18n-messages"

const messageModules = import.meta.glob<AbstractIntlMessages>("../../../messages/*/*.json", { import: "default" })
const metadataModules = import.meta.glob<PageMetadata>("../../../messages/*/*.json", { import: "metadata" })

const rootMessagePaths = Object.keys(import.meta.glob(["../../../messages/*/components.*.json", "../../../messages/*/errors*.json"]))

export const ROOT_NAMESPACES = [...new Set(rootMessagePaths.map((path) => toNamespace(path)))]

const modulePath = ({ locale, namespace }: { locale: SupportedLocale; namespace: string }): string =>
  `../../../messages/${locale}/${namespace}.json`

const missingNamespace = ({ locale, namespace }: { locale: SupportedLocale; namespace: string }): Error =>
  new Error(`No messages/${locale}/${namespace}.json — every declared namespace needs a file per supported locale.`)

export const loadPageMetadata = ({ locale, namespace }: { locale: SupportedLocale; namespace: string }): Promise<PageMetadata> => {
  const load = metadataModules[modulePath({ locale, namespace })]

  if (load === undefined) {
    throw missingNamespace({ locale, namespace })
  }

  return load()
}

export function loadNamespace<TMessages extends AbstractIntlMessages>(args: {
  locale: SupportedLocale
  namespace: string
}): Promise<TMessages>
export function loadNamespace({ locale, namespace }: { locale: SupportedLocale; namespace: string }): Promise<AbstractIntlMessages> {
  const load = messageModules[modulePath({ locale, namespace })]

  if (load === undefined) {
    throw missingNamespace({ locale, namespace })
  }

  return load()
}

export const messagesQueryOptions = ({ locale, namespace }: { locale: SupportedLocale; namespace: string }) =>
  queryOptions({
    gcTime: Infinity,
    queryFn: () => loadNamespace({ locale, namespace }),
    queryKey: [MESSAGES_QUERY_KEY, locale, namespace],
    select: (messages): NamespaceEntry => [namespace, messages],
    staleTime: Infinity,
  })

export const preloadNamespaces = async ({
  locale,
  namespaces,
  queryClient,
}: {
  locale: SupportedLocale
  namespaces: readonly string[]
  queryClient: QueryClient
}): Promise<void> => {
  await Promise.all(
    namespaces.map((namespace) => queryClient.query({ ...messagesQueryOptions({ locale, namespace }), staleTime: "static" })),
  )
}
