import AxeBuilder from "@axe-core/playwright"
import type { Page } from "@playwright/test"

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]

const revealWholePage = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    const bottom = document.documentElement.scrollHeight
    const step = globalThis.innerHeight / 2
    const stops = [...Array.from({ length: Math.ceil(bottom / step) }, (_, index) => index * step), bottom]

    for (const top of stops) {
      globalThis.scrollTo({ behavior: "instant", top })
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve()
          })
        })
      })
    }
  })
}

export const accessibilityViolations = async (page: Page): Promise<string[]> => {
  await revealWholePage(page)
  await page.evaluate(async () => {
    const timedAnimations = document
      .getAnimations()
      .filter((animation) => animation.timeline === document.timeline && animation.effect?.getComputedTiming().iterations !== Infinity)
    await Promise.allSettled(timedAnimations.map((animation) => animation.finished))
  })
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()

  return violations.map(
    ({ help, id, impact, nodes }) => `${id} (${impact ?? "unknown"}): ${help} at ${nodes.map(({ target }) => target.join(" ")).join(", ")}`,
  )
}
