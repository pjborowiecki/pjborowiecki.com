import type { ReactNode } from "react"

import { HeadContent, Outlet, ScriptOnce, Scripts, createRootRouteWithContext } from "@tanstack/react-router"

import { AriaProvider } from "~/src/providers/aria-provider"
import { TranslationsProvider } from "~/src/providers/translations-provider"

import { I18N } from "~/src/integrations/use-intl/i18n.config"
import { ROOT_NAMESPACES, preloadNamespaces } from "~/src/integrations/use-intl/i18n.messages"
import { getCurrentLocale } from "~/src/integrations/use-intl/i18n.utils"

import { toOpenGraphLocale } from "~/src/lib/seo"

import { Toaster } from "~/src/presentation/components/shadcn/sonner"

import { DOCUMENT_STYLESHEET, fontPreloads } from "~/src/presentation/document-assets"
import type { RouterContext } from "~/src/router"

const SCRIPTING_FLAG = "document.documentElement.classList.add('js')"

const RootComponent = () => (
  <AriaProvider>
    <Outlet />
    <Toaster />
  </AriaProvider>
)

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => {
  const locale = getCurrentLocale()

  return (
    <html className="bg-background text-foreground antialiased" lang={locale} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <ScriptOnce>{SCRIPTING_FLAG}</ScriptOnce>
        <HeadContent />
        {I18N.SUPPORTED_LOCALES.filter((supported) => supported !== locale).map((alternate) => (
          <meta content={toOpenGraphLocale(alternate)} key={alternate} property="og:locale:alternate" />
        ))}
      </head>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <TranslationsProvider>{children}</TranslationsProvider>
        <Scripts />
      </body>
    </html>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: ({ context }) =>
    preloadNamespaces({ locale: getCurrentLocale(), namespaces: ROOT_NAMESPACES, queryClient: context.queryClient }),
  component: RootComponent,
  head: () => ({
    links: [DOCUMENT_STYLESHEET, ...fontPreloads(getCurrentLocale()), { href: "/favicon.ico", rel: "icon", sizes: "any" }],
    meta: [
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      ...(import.meta.env.MODE === "production" ? [] : [{ content: "noindex, nofollow", name: "robots" }]),
    ],
  }),
  shellComponent: RootDocument,
})
