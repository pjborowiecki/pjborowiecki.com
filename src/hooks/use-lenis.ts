import { useSyncExternalStore } from "react"

import type Lenis from "lenis"

const shared: { lenis: Lenis | undefined } = { lenis: undefined }
const subscribers = new Set<() => void>()

const subscribe = (onChange: () => void): (() => void) => {
  subscribers.add(onChange)

  return () => {
    subscribers.delete(onChange)
  }
}

const readLenis = (): Lenis | undefined => shared.lenis

const readServerLenis = (): Lenis | undefined => undefined

export const shareLenis = (lenis: Lenis | undefined): void => {
  shared.lenis = lenis

  for (const notify of subscribers) {
    notify()
  }
}

export const useLenis = (): Lenis | undefined => useSyncExternalStore(subscribe, readLenis, readServerLenis)
