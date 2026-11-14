import { type CSSProperties, type JSX, useEffect, useRef } from "react"

import { cn } from "~/src/lib/cn"
import { DRAWINGS, type Discipline } from "~/src/lib/expertise-drawings"

interface ExpertiseFigureProps {
  readonly className?: string
  readonly discipline: Discipline
}

const LAYER_STAGGER = 0.09
const VISIBLE_FRACTION = 0.25

const PLATE_STYLE: CSSProperties = { fill: "var(--figure-plate)" }

const layerDelay = (depth: number): CSSProperties => Object.fromEntries([["--delay", `${String(depth * LAYER_STAGGER)}s`]])

export const ExpertiseFigure = ({ className, discipline }: ExpertiseFigureProps): JSX.Element => {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current

    if (!root) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting !== true) {
          return
        }

        root.toggleAttribute("data-figure-in", true)
        observer.disconnect()
      },
      { threshold: VISIBLE_FRACTION },
    )
    observer.observe(root)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      className={cn(
        "text-cream transition-colors duration-300 [--figure-accent:var(--champagne)] [--figure-plate:#0b5a43] group-hover:text-emerald-deep group-hover:[--figure-accent:var(--emerald)] group-hover:[--figure-plate:#e9e3d2]",
        className,
      )}
      ref={rootRef}
    >
      <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 520 300">
        {DRAWINGS[discipline].map((layer) => (
          <g
            fill="none"
            key={layer.depth}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={layerDelay(layer.depth)}
          >
            {layer.plates?.map((pathData) => (
              <path
                className="figure-fade transition-[fill] duration-300"
                d={pathData}
                key={pathData}
                strokeOpacity={0.6}
                strokeWidth={1}
                style={PLATE_STYLE}
              />
            ))}
            {layer.faint?.map((pathData) => (
              <path className="figure-fade" d={pathData} key={pathData} strokeOpacity={0.24} strokeWidth={0.9} />
            ))}
            {layer.dashed?.map((pathData) => (
              <path className="figure-fade" d={pathData} key={pathData} strokeDasharray="2 4" strokeOpacity={0.5} strokeWidth={0.9} />
            ))}
            {layer.lines?.map((pathData) => (
              <path className="figure-line" d={pathData} key={pathData} pathLength={1} strokeOpacity={0.72} strokeWidth={1} />
            ))}
            {layer.accent?.map((pathData) => (
              <path className="figure-line" d={pathData} key={pathData} pathLength={1} stroke="var(--figure-accent)" strokeWidth={1.6} />
            ))}
            {layer.dots?.map(([cx, cy]) => (
              <circle
                className="figure-fade"
                cx={cx}
                cy={cy}
                fill="var(--figure-accent)"
                key={`${String(cx)}-${String(cy)}`}
                r={2.4}
                stroke="none"
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  )
}
