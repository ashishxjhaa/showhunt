// Smooth scroll helpers for the voice agent.

export type ScrollTarget =
  | "top"
  | "bottom"
  | "hero"
  | "stats"
  | "features"
  | "how-it-works"
  | "faq"
  | "cta"
  | "footer"
  | "discussion"
  | "listings"

const SECTION_IDS: Record<Exclude<ScrollTarget, "top" | "bottom">, string> = {
  hero: "hero",
  stats: "stats",
  features: "features",
  "how-it-works": "how-it-works",
  faq: "faq",
  cta: "cta-banner",
  footer: "footer",
  discussion: "discussion",
  listings: "listings",
}

// Smootherstep easing.
function easeInOutSmoother(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

let activeRaf = 0
let activeResolve: (() => void) | null = null

function cancelActiveScroll() {
  if (activeRaf) {
    cancelAnimationFrame(activeRaf)
    activeRaf = 0
  }
  if (activeResolve) {
    const resolve = activeResolve
    activeResolve = null
    resolve()
  }
}

function setNativeSmooth(enabled: boolean) {
  const html = document.documentElement
  if (enabled) {
    html.style.removeProperty("scroll-behavior")
  } else {
    // Turn off CSS smooth scroll so RAF frames do not stutter.
    html.style.setProperty("scroll-behavior", "auto", "important")
  }
}

// Animate window scroll to a Y position. Cancels any scroll already running.
export function animateScrollToY(targetY: number): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()

  const maxY = Math.max(
    0,
    Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) -
      window.innerHeight
  )
  const endY = clamp(targetY, 0, maxY)
  const startY = window.scrollY || window.pageYOffset
  const distance = endY - startY

  if (Math.abs(distance) < 1) return Promise.resolve()

  if (prefersReducedMotion()) {
    window.scrollTo(0, endY)
    return Promise.resolve()
  }

  cancelActiveScroll()

  // Longer distance gets a longer duration (about 0.7s to 1.6s).
  const duration = clamp(560 + Math.abs(distance) * 0.55, 700, 1600)
  const start = performance.now()

  setNativeSmooth(false)

  return new Promise((resolve) => {
    activeResolve = () => {
      setNativeSmooth(true)
      resolve()
    }

    const step = (now: number) => {
      const t = clamp((now - start) / duration, 0, 1)
      const y = startY + distance * easeInOutSmoother(t)
      // Jump each frame. Native smooth is off above.
      window.scrollTo({ top: y, left: 0, behavior: "instant" })

      if (t < 1) {
        activeRaf = requestAnimationFrame(step)
      } else {
        activeRaf = 0
        window.scrollTo({ top: endY, left: 0, behavior: "instant" })
        const done = activeResolve
        activeResolve = null
        done?.()
      }
    }

    activeRaf = requestAnimationFrame(step)
  })
}

function offsetTop(el: HTMLElement): number {
  const nav = document.querySelector("header") as HTMLElement | null
  const pad = (nav?.offsetHeight ?? 72) + 16
  const rect = el.getBoundingClientRect()
  return (window.scrollY || window.pageYOffset) + rect.top - pad
}

// Smooth scroll to a named voice target.
export async function smoothScrollTo(target: ScrollTarget): Promise<string> {
  if (typeof window === "undefined") return "Scroll is only available in the browser"

  if (target === "top") {
    await animateScrollToY(0)
    return "Scrolled to the top"
  }

  if (target === "bottom") {
    const max =
      Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      ) - window.innerHeight
    await animateScrollToY(Math.max(0, max))
    return "Scrolled to the bottom"
  }

  const id = SECTION_IDS[target]
  const el = document.getElementById(id)
  if (!el) {
    return `Could not find the ${target} section on this page`
  }

  await animateScrollToY(offsetTop(el))
  return `Scrolled to ${target}`
}

export function isScrollTarget(value: string): value is ScrollTarget {
  return value === "top" || value === "bottom" || value in SECTION_IDS
}
