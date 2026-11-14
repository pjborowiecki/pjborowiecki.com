import { mkdirSync, readdirSync, rmSync } from "node:fs"
import { basename, extname, join } from "node:path"
import process from "node:process"
import sharp from "sharp"

const IMAGES_DIR = "src/presentation/assets/images"
const ORIGINALS_DIR = join(IMAGES_DIR, "originals")
const OUTPUT_DIR = join(IMAGES_DIR, "optimized")

const PHONE_WIDTH = 480
const TABLET_WIDTH = 768
const LAPTOP_WIDTH = 1080
const DESKTOP_WIDTH = 1440
const WIDE_WIDTH = 1920
const RETINA_WIDTH = 2560
const ULTRA_WIDTH = 3840

const WIDTHS = [PHONE_WIDTH, TABLET_WIDTH, LAPTOP_WIDTH, DESKTOP_WIDTH, WIDE_WIDTH, RETINA_WIDTH, ULTRA_WIDTH]
const MASTER_EXTENSIONS = new Set([".jpg", ".png", ".webp"])

const WEBP = { effort: 6, quality: 84, smartSubsample: true } as const

const variantWidths = (masterWidth: number): number[] => {
  const widths = WIDTHS.filter((width) => width < masterWidth)

  return [...widths, masterWidth]
}

const optimize = async (file: string): Promise<number> => {
  const name = basename(file, extname(file))
  const master = sharp(join(ORIGINALS_DIR, file))
  const { height, width } = await master.metadata()

  const outputs = variantWidths(width).map((variantWidth) => {
    const variantHeight = Math.round((height * variantWidth) / width)
    const output = join(OUTPUT_DIR, `${name}-${String(variantWidth)}x${String(variantHeight)}.webp`)

    return master.clone().resize({ width: variantWidth }).webp(WEBP).toFile(output)
  })

  await Promise.all(outputs)

  return outputs.length
}

rmSync(OUTPUT_DIR, { force: true, recursive: true })
mkdirSync(OUTPUT_DIR, { recursive: true })

const masters = readdirSync(ORIGINALS_DIR).filter((file) => MASTER_EXTENSIONS.has(extname(file)))
const written = await Promise.all(masters.map((file) => optimize(file)))

process.stdout.write(
  `Wrote ${String(written.reduce((total, count) => total + count, 0))} variants of ${String(masters.length)} images to ${OUTPUT_DIR}.\n`,
)
