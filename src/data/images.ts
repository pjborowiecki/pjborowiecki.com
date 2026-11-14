import { z } from "zod/v4"

const variantUrls = import.meta.glob<string>("/src/presentation/assets/images/optimized/*.{avif,webp}", {
  eager: true,
  import: "default",
  query: "?url",
})

const VARIANT_PATTERN = /\/(?<name>[a-z-]+)-(?<width>\d+)x(?<height>\d+)\.(?<format>avif|webp)$/u

const variantSchema = z.object({
  format: z.enum(["avif", "webp"]),
  height: z.coerce.number().int().positive(),
  name: z.string(),
  width: z.coerce.number().int().positive(),
})

type ImageFormat = z.infer<typeof variantSchema>["format"]

interface ImageVariant {
  readonly format: ImageFormat
  readonly height: number
  readonly url: string
  readonly width: number
}

export interface ResponsiveImageSource {
  readonly avif: string
  readonly height: number
  readonly src: string
  readonly webp: string
  readonly width: number
}

const toVariant = ([path, url]: [string, string]): ImageVariant & { readonly name: string } => ({
  ...variantSchema.parse(VARIANT_PATTERN.exec(path)?.groups),
  url,
})

const byWidth = (left: ImageVariant, right: ImageVariant): number => left.width - right.width

const srcSet = (variants: readonly ImageVariant[], format: ImageFormat): string =>
  variants
    .filter((variant) => variant.format === format)
    .toSorted(byWidth)
    .map(({ url, width }) => `${url} ${String(width)}w`)
    .join(", ")

const widerOf = (left: ImageVariant, right: ImageVariant): ImageVariant => (right.width > left.width ? right : left)

const buildSource = (variants: readonly ImageVariant[]): ResponsiveImageSource => {
  const largest = variants.filter((variant) => variant.format === "webp").reduce((wider, variant) => widerOf(wider, variant))

  return { avif: srcSet(variants, "avif"), height: largest.height, src: largest.url, webp: srcSet(variants, "webp"), width: largest.width }
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
