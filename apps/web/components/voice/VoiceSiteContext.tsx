"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react"
import {
  EMPTY_VOICE_SNAPSHOT,
  type VoiceSiteSnapshot,
} from "@/lib/voice/types"

type SnapshotPatch = Partial<VoiceSiteSnapshot>

type AuthFillPayload = {
  fullName?: string
  email?: string
  password?: string
}

type ListingFillPayload = {
  name?: string
  description?: string
  link?: string
  tags?: string[]
  repoUrl?: string
  isOpenSource?: boolean
}

type ProfileFillPayload = {
  username?: string
  bio?: string
  twitterUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  linkedinUrl?: string
  state?: string
  techStack?: string[]
}

type VoiceHandlers = {
  navigate?: (path: string) => Promise<string> | string
  goBack?: () => Promise<string> | string
  setListingsSearch?: (q: string) => Promise<string> | string
  setListingsTag?: (tag: string | null) => Promise<string> | string
  setListingsPage?: (page: number | "next" | "prev") => Promise<string> | string
  openUpload?: () => Promise<string> | string
  fillListing?: (fields: ListingFillPayload) => Promise<string> | string
  enrichFromUrl?: (url: string) => Promise<string> | string
  uploadNext?: () => Promise<string> | string
  uploadPrevious?: () => Promise<string> | string
  uploadGotoStep?: (step: string) => Promise<string> | string
  submitListing?: () => Promise<string> | string
  setUploadLink?: (fields: {
    platform?: string
    url?: string
    index?: string
  }) => Promise<string> | string
  removeUploadLink?: (query: string) => Promise<string> | string
  editListing?: (query: string) => Promise<string> | string
  deleteListing?: (query: string) => Promise<string> | string
  cancelDeleteListing?: () => Promise<string> | string
  confirmDeleteListing?: () => Promise<string> | string
  openAvatarPicker?: () => Promise<string> | string
  setAvatar?: (choice: string) => Promise<string> | string
  signOut?: () => Promise<string> | string
  upvoteListing?: (id?: string) => Promise<string> | string
  fillAuth?: (fields: AuthFillPayload) => Promise<string> | string
  submitAuth?: () => Promise<string> | string
  fillComment?: (text: string) => Promise<string> | string
  submitComment?: () => Promise<string> | string
  openProfileEditor?: () => Promise<string> | string
  fillProfile?: (fields: ProfileFillPayload) => Promise<string> | string
}

interface VoiceSiteContextValue {
  patchSnapshot: (patch: SnapshotPatch) => void
  getSnapshot: () => VoiceSiteSnapshot
  getHandlers: () => VoiceHandlers
  registerHandlers: (handlers: VoiceHandlers) => () => void
}

const VoiceSiteContext = createContext<VoiceSiteContextValue | null>(null)

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      const left = a[i]
      const right = b[i]
      if (left === right) continue
      if (
        left &&
        right &&
        typeof left === "object" &&
        typeof right === "object"
      ) {
        if (JSON.stringify(left) !== JSON.stringify(right)) return false
        continue
      }
      return false
    }
    return true
  }
  return false
}

function shallowEqualPatch(
  prev: VoiceSiteSnapshot,
  patch: SnapshotPatch
): boolean {
  for (const key of Object.keys(patch) as (keyof SnapshotPatch)[]) {
    if (!valuesEqual(prev[key], patch[key])) return false
  }
  return true
}

export function VoiceSiteProvider({ children }: { children: ReactNode }) {
  const snapshotRef = useRef<VoiceSiteSnapshot>(EMPTY_VOICE_SNAPSHOT)

  // Keep handlers in a ref so register/unregister never re-renders the tree.
  const handlersRef = useRef<VoiceHandlers>({})

  const patchSnapshot = useCallback((patch: SnapshotPatch) => {
    const prev = snapshotRef.current
    if (shallowEqualPatch(prev, patch)) return
    snapshotRef.current = { ...prev, ...patch }
  }, [])

  const getSnapshot = useCallback(() => snapshotRef.current, [])
  const getHandlers = useCallback(() => handlersRef.current, [])

  const registerHandlers = useCallback((next: VoiceHandlers) => {
    const keys = Object.keys(next) as (keyof VoiceHandlers)[]
    Object.assign(handlersRef.current, next)
    return () => {
      for (const key of keys) {
        if (handlersRef.current[key] === next[key]) {
          delete handlersRef.current[key]
        }
      }
    }
  }, [])

  const value = useMemo(
    () => ({
      patchSnapshot,
      getSnapshot,
      getHandlers,
      registerHandlers,
    }),
    [patchSnapshot, getSnapshot, getHandlers, registerHandlers]
  )

  return (
    <VoiceSiteContext.Provider value={value}>{children}</VoiceSiteContext.Provider>
  )
}

export function useVoiceSite() {
  const ctx = useContext(VoiceSiteContext)
  if (!ctx) {
    throw new Error("useVoiceSite must be used within VoiceSiteProvider")
  }
  return ctx
}

export type {
  AuthFillPayload,
  ListingFillPayload,
  ProfileFillPayload,
  VoiceHandlers,
}
