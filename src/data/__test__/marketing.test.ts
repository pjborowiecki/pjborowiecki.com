import { describe, expect, it } from "vite-plus/test"

import { CERTIFICATIONS } from "~/src/data/certifications"
import { LIGHT_NAV_GROUNDS, NAV_GROUND, NAV_ITEMS, SECTION_IDS, sectionHref } from "~/src/data/marketing"
import { FEATURED_PROJECTS, PROJECTS, PROJECT_DISCIPLINES, PROJECT_ID, SAASY_LAND_REPOSITORY } from "~/src/data/projects"

import landing from "~/messages/en-US/pages.landing.json"

describe("marketing data", () => {
  it("links every navigation item to a section of the page", () => {
    const sections = new Set<string>(Object.values(SECTION_IDS))

    expect(NAV_ITEMS.every(({ section }) => sections.has(section))).toBe(true)
    expect(sectionHref(SECTION_IDS.CONTACT)).toBe("#contact")
  })

  it("treats paper, board and the flood as light grounds", () => {
    expect([...LIGHT_NAV_GROUNDS].toSorted()).toStrictEqual([NAV_GROUND.BOARD, NAV_GROUND.FLOOD, NAV_GROUND.PAPER])
  })
})

describe("projects", () => {
  it("features MarteBizuteria and SaaSy Land, with SaaSy Land's repository", () => {
    expect(FEATURED_PROJECTS.map(({ title }) => title)).toStrictEqual(["MarteBizuteria.pl", "SaaSyLand.com"])
    expect(PROJECTS.find(({ id }) => id === PROJECT_ID.SAASYLAND)?.github).toBe(SAASY_LAND_REPOSITORY)
  })

  it("has a translated category for every project and a full case study for every featured one", () => {
    for (const { id, isFeatured } of PROJECTS) {
      expect(landing.work.projects[id].category.length).toBeGreaterThan(0)
      expect(Object.keys(landing.work.projects[id])).toHaveLength(isFeatured ? 5 : 1)
    }
  })

  it("files every project that is not featured under a known discipline", () => {
    const disciplines = new Set<string>(PROJECT_DISCIPLINES)

    expect(
      PROJECTS.filter(({ isFeatured }) => !isFeatured).every(({ discipline }) => discipline !== undefined && disciplines.has(discipline)),
    ).toBe(true)
  })
})

describe("certifications", () => {
  it("lists each certification once", () => {
    expect(new Set(CERTIFICATIONS.map(({ id }) => id)).size).toBe(CERTIFICATIONS.length)
  })
})
