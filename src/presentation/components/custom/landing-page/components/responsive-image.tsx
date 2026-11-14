import type { JSX } from "react"

import { imageSource } from "~/src/data/images"

import { cn } from "~/src/lib/cn"

interface ResponsiveImageProps {
  readonly alt: string
  readonly className?: string
  readonly isFill?: boolean
  readonly isPriority?: boolean
  readonly name: string
  readonly sizes: string
}

export const ResponsiveImage = ({ alt, className, isFill = false, isPriority = false, name, sizes }: ResponsiveImageProps): JSX.Element => {
  const { height, src, srcSet, width } = imageSource(name)

  return (
    <img
      alt={alt}
      className={cn({ "absolute inset-0 size-full": isFill }, className)}
      decoding="async"
      fetchPriority={isPriority ? "high" : "auto"}
      height={height}
      loading={isPriority ? "eager" : "lazy"}
      sizes={sizes}
      src={src}
      srcSet={srcSet}
      width={width}
    />
  )
}
