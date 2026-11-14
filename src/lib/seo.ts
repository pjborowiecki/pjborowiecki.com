import { I18N, type SupportedLocale } from "~/src/integrations/use-intl/i18n.config"
import { localeLinks, localizePathname } from "~/src/integrations/use-intl/i18n.paths"

import { APP_NAME, APP_URL } from "~/src/presentation/branding"

const SOCIAL_IMAGE = {
  height: 630,
  path: "/images/promo/social/pjborowiecki-og-image.jpg",
  width: 1200,
} as const

export const toOpenGraphLocale = (locale: SupportedLocale): string => locale.replace("-", "_")

export const buildPageHead = ({
  description = "",
  locale = I18N.DEFAULT_LOCALE,
  pathname,
  title = APP_NAME,
}: {
  readonly description?: string | undefined
  readonly locale?: SupportedLocale | undefined
  readonly pathname: string
  readonly title?: string | undefined
}) => {
  const canonicalPath = localizePathname({ locale, pathname })
  const image = `${APP_URL}${SOCIAL_IMAGE.path}`

  return {
    links: [...localeLinks({ origin: APP_URL, pathname: canonicalPath })],
    meta: [
      { title },
      { content: description, name: "description" },
      { content: title, property: "og:title" },
      { content: description, property: "og:description" },
      { content: "profile", property: "og:type" },
      { content: `${APP_URL}${canonicalPath}`, property: "og:url" },
      { content: toOpenGraphLocale(locale), property: "og:locale" },
      { content: image, property: "og:image" },
      { content: String(SOCIAL_IMAGE.width), property: "og:image:width" },
      { content: String(SOCIAL_IMAGE.height), property: "og:image:height" },
      { content: "summary_large_image", name: "twitter:card" },
      { content: title, name: "twitter:title" },
      { content: description, name: "twitter:description" },
      { content: image, name: "twitter:image" },
    ],
  }
}

export interface PageLoaderData {
  readonly locale: SupportedLocale
  readonly metadata: { readonly description: string; readonly title: string }
}

export const pageHead =
  (pathname: string) =>
  ({ loaderData }: { loaderData?: PageLoaderData | undefined }) =>
    buildPageHead({ ...loaderData?.metadata, locale: loaderData?.locale, pathname })
