import { z } from "~/src/integrations/zod/zod.config"

const variantUrls = import.meta.glob<string>("/src/presentation/assets/images/optimized/*.webp", {
  eager: true,
  import: "default",
  query: "?url",
})

const VARIANT_PATTERN = /\/(?<name>[a-z-]+)-(?<width>\d+)x(?<height>\d+)\.webp$/u

const variantSchema = z.object({
  height: z.coerce.number().int().positive(),
  name: z.string(),
  width: z.coerce.number().int().positive(),
})

interface ImageVariant {
  readonly height: number
  readonly url: string
  readonly width: number
}

interface ResponsiveImageSource {
  readonly height: number
  readonly src: string
  readonly srcSet: string
  readonly width: number
}

const toVariant = ([path, url]: [string, string]): ImageVariant & { readonly name: string } => ({
  ...variantSchema.parse(VARIANT_PATTERN.exec(path)?.groups),
  url,
})

const byWidth = (left: ImageVariant, right: ImageVariant): number => left.width - right.width

const widerOf = (left: ImageVariant, right: ImageVariant): ImageVariant => (right.width > left.width ? right : left)

const buildSource = (variants: readonly ImageVariant[]): ResponsiveImageSource => {
  const largest = variants.reduce((wider, variant) => widerOf(wider, variant))
  const srcSet = variants
    .toSorted(byWidth)
    .map(({ url, width }) => `${url} ${String(width)}w`)
    .join(", ")

  return { height: largest.height, src: largest.url, srcSet, width: largest.width }
}

const grouped = Map.groupBy(
  Object.entries(variantUrls).map((entry) => toVariant(entry)),
  ({ name }) => name,
)

export const IMAGES: Readonly<Record<string, ResponsiveImageSource>> = Object.fromEntries(
  [...grouped].map(([name, variants]) => [name, buildSource(variants)]),
)

export const imageSource = (name: string): ResponsiveImageSource => {
  const source = IMAGES[name]

  if (source === undefined) {
    throw new Error(`No optimized image named ${name}. Add its master to src/presentation/assets/images/originals and run bun run images.`)
  }

  return source
}
