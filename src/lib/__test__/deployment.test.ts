import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { LIVE_SITE_CHECK_RETRY_DELAYS_MS, LIVE_SITE_CHECK_TIMEOUT_MS, verifyDeployment } from "~/src/lib/deployment"

const PRODUCTION_ORIGIN = "https://pjborowiecki.com"
const PREVIEW_ORIGIN = "https://preview.pjborowiecki.com"

const HTML = "text/html; charset=utf-8"
const PLAIN_TEXT = "text/plain; charset=utf-8"

const CHECKED_PATHS = ["/", "/pl-PL", "/robots.txt"]

const EVERY_RETRY_MS = LIVE_SITE_CHECK_RETRY_DELAYS_MS.reduce((total, delay) => total + delay, 0)

type Answer = () => Promise<Response>

const page =
  (status: number, contentType?: string): Answer =>
  () =>
    Promise.resolve(new Response("body", { headers: contentType === undefined ? {} : { "content-type": contentType }, status }))

const WORKING_SITE: Readonly<Record<string, Answer>> = {
  "/": page(200, HTML),
  "/pl-PL": page(200, HTML),
  "/robots.txt": page(200, PLAIN_TEXT),
}

const fetchMock = vi.fn<(input: URL, init: RequestInit) => Promise<Response>>()

const serve = (overrides: Readonly<Record<string, Answer>> = {}): void => {
  const answers = { ...WORKING_SITE, ...overrides }
  fetchMock.mockImplementation((url) => answers[url.pathname]?.() ?? Promise.reject(new Error(`unexpected request to ${url.href}`)))
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("verifyDeployment", () => {
  it.each([
    ["production", PRODUCTION_ORIGIN],
    ["preview", PREVIEW_ORIGIN],
  ] as const)("asks the %s Worker for both locales and robots.txt", async (environment, origin) => {
    serve()

    await expect(verifyDeployment(environment)).resolves.toBe(
      `The ${environment} Worker at ${origin} answered ${CHECKED_PATHS.join(", ")} as expected.`,
    )
    expect(fetchMock.mock.calls.map(([url]) => url.href).toSorted()).toStrictEqual(CHECKED_PATHS.map((path) => `${origin}${path}`))
  })

  it("does not follow redirects and gives up on a slow answer", async () => {
    serve()

    await verifyDeployment("preview")

    const [, init] = fetchMock.mock.calls[0] ?? []
    expect(init?.redirect).toBe("manual")
    expect(init?.signal).toBeInstanceOf(AbortSignal)
    expect(LIVE_SITE_CHECK_TIMEOUT_MS).toBeGreaterThan(0)
  })

  it("retries a path that has not answered yet", async () => {
    vi.useFakeTimers()
    let attempts = 0
    serve({
      "/pl-PL": () => {
        attempts += 1
        return attempts === 1 ? page(503, HTML)() : page(200, HTML)()
      },
    })

    const verified = verifyDeployment("preview")
    await vi.advanceTimersByTimeAsync(EVERY_RETRY_MS)

    await expect(verified).resolves.toContain("as expected")
    expect(attempts).toBe(2)
  })

  it("lists every path that never answered as expected", async () => {
    vi.useFakeTimers()
    serve({ "/pl-PL": page(404), "/robots.txt": () => Promise.reject(new TypeError("connection refused")) })

    const verified = expect(verifyDeployment("production")).rejects.toThrow(
      [
        `The production Worker at ${PRODUCTION_ORIGIN} is deployed but does not answer as expected:`,
        `GET ${PRODUCTION_ORIGIN}/pl-PL answered 404 text/plain;charset=UTF-8 instead of 200 text/html.`,
        `GET ${PRODUCTION_ORIGIN}/robots.txt did not answer: TypeError: connection refused`,
      ].join("\n"),
    )
    await vi.advanceTimersByTimeAsync(EVERY_RETRY_MS)

    await verified
  })
})
