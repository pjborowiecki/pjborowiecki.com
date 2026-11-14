import { readdirSync } from "node:fs"
import { basename, extname } from "node:path"
import { describe, expect, it } from "vite-plus/test"

import { IMAGES, imageSource } from "~/src/data/images"

const MASTERS = readdirSync("src/presentation/assets/images/originals").map((file) => basename(file, extname(file)))

describe("optimized images", () => {
  it("offers every master image, and nothing else", () => {
    expect(Object.keys(IMAGES).toSorted()).toStrictEqual(MASTERS.toSorted())
  })

  it("describes an image by its largest WebP and a source set ordered by width", () => {
    const { height, src, srcSet, width } = imageSource("hero-subject")

    expect({ height, width }).toStrictEqual({ height: 2239, width: 1650 })
    expect(src).toContain("hero-subject-1650x2239.webp")
    expect(srcSet.split(", ").map((candidate) => candidate.split(" ").at(-1))).toStrictEqual(["480w", "768w", "1080w", "1440w", "1650w"])
  })

  it("names the fix when an image is missing", () => {
    expect(() => imageSource("missing")).toThrow("No optimized image named missing")
  })
})
