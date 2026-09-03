"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useMe } from "@/lib/queries/hooks"
import { useLogout } from "@/lib/queries/mutations"
import { useVoiceSite } from "@/components/voice/VoiceSiteContext"
import type { VoiceAuthPage, VoiceLandingSection, VoiceSiteSnapshot } from "@/lib/voice/types"

const LANDING_SECTIONS: { id: string; key: Exclude<VoiceLandingSection, null> }[] = [
  { id: "hero", key: "hero" },
  { id: "stats", key: "stats" },
  { id: "features", key: "features" },
  { id: "how-it-works", key: "how-it-works" },
  { id: "faq", key: "faq" },
  { id: "cta-banner", key: "cta" },
  { id: "footer", key: "footer" },
]

function detectAuthPage(pathname: string): VoiceAuthPage {
  if (pathname === "/signin") return "signin"
  if (pathname === "/signup") return "signup"
  return null
}

function isListingDetail(pathname: string) {
  return /^\/listings\/[^/]+$/.test(pathname)
}

function isProfileRoute(pathname: string) {
  return pathname === "/profile" || pathname.startsWith("/u/")
}

// Keep VoiceSiteContext in sync with route, auth, and landing section.
export default function VoiceRouteSync() {
  const pathname = usePathname() || "/"
  const router = useRouter()
  const { data: user, isFetched } = useMe()
  const logout = useLogout()
  const { patchSnapshot, registerHandlers, getSnapshot } = useVoiceSite()
  const previousRoute = useRef<string | null>(null)

  useEffect(() => {
    const prev = previousRoute.current
    const routeChanged = prev !== pathname
    if (routeChanged) {
      previousRoute.current = pathname
    }

    const patch: Partial<VoiceSiteSnapshot> = {
      route: pathname,
      authPage: detectAuthPage(pathname),
      signedIn: isFetched && !!user,
      user: user
        ? { name: user.fullName ?? null, username: user.username ?? null }
        : null,
    }

    // Only update previousRoute when the path actually changes.
    if (routeChanged && prev) {
      patch.previousRoute = prev
    }

    // Clear page-specific context when leaving those routes.
    if (!isListingDetail(pathname)) {
      patch.listingDetail = null
      patch.commentDraft = ""
      patch.similarListings = []
    }
    if (!isProfileRoute(pathname)) {
      patch.profile = null
    }

    patchSnapshot(patch)
  }, [pathname, user, isFetched, patchSnapshot])

  useEffect(() => {
    return registerHandlers({
      navigate: async (path) => {
        router.push(path)
        return `Navigated to ${path}`
      },
      goBack: async () => {
        const snap = getSnapshot()
        if (snap.previousRoute) {
          router.push(snap.previousRoute)
          return `Went back to ${snap.previousRoute}`
        }
        router.back()
        return "Went back"
      },
      signOut: () => {
        if (!getSnapshot().signedIn) return "You are not signed in"
        logout.mutate(undefined, {
          onSettled: () => router.push("/"),
        })
        return "Signed out"
      },
    })
  }, [registerHandlers, router, getSnapshot, logout])

  // Track which landing section is in view
  useEffect(() => {
    if (pathname !== "/") {
      patchSnapshot({ sectionInView: null })
      return
    }

    const nodes = LANDING_SECTIONS.map(({ id, key }) => {
      const el = document.getElementById(id)
      return el ? { el, key } : null
    }).filter(Boolean) as { el: HTMLElement; key: Exclude<VoiceLandingSection, null> }[]

    if (nodes.length === 0) return

    const ratios = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.intersectionRatio)
        }
        let best: Exclude<VoiceLandingSection, null> = "hero"
        let bestRatio = -1
        for (const { el, key } of nodes) {
          const r = ratios.get(el.id) ?? 0
          if (r > bestRatio) {
            bestRatio = r
            best = key
          }
        }
        patchSnapshot({ sectionInView: best })
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    for (const { el } of nodes) observer.observe(el)
    return () => observer.disconnect()
  }, [pathname, patchSnapshot])

  return null
}
