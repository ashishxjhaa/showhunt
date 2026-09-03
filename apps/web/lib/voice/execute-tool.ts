"use client"

import { isScrollTarget, smoothScrollTo } from "@/lib/voice/smooth-scroll"
import { looksLikeEmail, normalizeVoiceEmail } from "@/lib/voice/normalize-email"
import { looksLikeUrl, normalizeVoiceUrl } from "@/lib/voice/normalize-url"
import type { VoiceSiteSnapshot } from "@/lib/voice/types"
import type { VoiceHandlers } from "@/components/voice/VoiceSiteContext"

const ALLOWED_PATH = /^(?:\/(?:listings(?:\/[a-zA-Z0-9_-]+)?|signin|signup|profile|u\/[a-zA-Z0-9_-]+)?)$/

type ToolResult = Record<string, unknown> | string

function normalizePath(path: string): string | null {
  const raw = path.trim()
  if (!raw) return null
  try {
    if (raw.startsWith("http")) {
      const u = new URL(raw)
      return u.pathname
    }
  } catch {
    return null
  }
  const pathOnly = raw.split("?")[0]?.split("#")[0] ?? raw
  if (pathOnly === "") return "/"
  return pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForHandler<K extends keyof VoiceHandlers>(
  getHandlers: () => VoiceHandlers,
  key: K,
  timeoutMs = 4000
): Promise<NonNullable<VoiceHandlers[K]> | undefined> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const handler = getHandlers()[key]
    if (handler) return handler as NonNullable<VoiceHandlers[K]>
    await sleep(40)
  }
  return undefined
}

async function call(
  fn: (() => Promise<string> | string) | undefined,
  missing: string
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  if (!fn) return { ok: false, error: missing }
  return { ok: true, message: await fn() }
}

function ordinalIndex(value: string): number | null {
  const v = value
    .trim()
    .toLowerCase()
    .replace(/\b(the|a|an|project|listing|product|one)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!v) return null
  if (v === "first" || v === "1st" || v === "1") return 0
  if (v === "second" || v === "2nd" || v === "2") return 1
  if (v === "third" || v === "3rd" || v === "3") return 2
  if (v === "fourth" || v === "4th" || v === "4") return 3
  if (v === "fifth" || v === "5th" || v === "5") return 4
  if (/^\d+$/.test(v)) {
    const n = Number(v)
    return n >= 1 ? n - 1 : null
  }
  return null
}

function resolveListingId(
  snap: VoiceSiteSnapshot,
  args: Record<string, unknown>
): string {
  let id = typeof args.id === "string" ? args.id.trim() : ""
  const name = typeof args.name === "string" ? args.name.trim() : ""
  const rawIndex =
    typeof args.index === "number"
      ? args.index
      : typeof args.index === "string" && /^-?\d+$/.test(args.index)
        ? Number(args.index)
        : null

  if (!id && rawIndex != null) {
    id =
      snap.visibleListings[rawIndex]?.id ??
      (rawIndex >= 1 ? snap.visibleListings[rawIndex - 1]?.id ?? "" : "")
  }

  if (!id && name) {
    const byOrdinal = ordinalIndex(name)
    if (byOrdinal != null) {
      id = snap.visibleListings[byOrdinal]?.id ?? ""
    } else {
      const needle = name.toLowerCase()
      const hit =
        snap.visibleListings.find((l) => l.name.toLowerCase() === needle) ??
        snap.visibleListings.find((l) => l.name.toLowerCase().includes(needle))
      id = hit?.id ?? ""
    }
  }

  if (!id && !name && rawIndex == null && snap.visibleListings.length > 0) {
    id = snap.visibleListings[0]?.id ?? ""
  }

  if (!id && snap.listingDetail) id = snap.listingDetail.id
  return id
}

async function navigateTo(
  getHandlers: () => VoiceHandlers,
  path: string,
  successMessage: string
): Promise<Record<string, unknown>> {
  const navigate = getHandlers().navigate
  if (!navigate) {
    return { ok: false, error: "Navigation is not ready on this page" }
  }
  const msg = await navigate(path)
  return { ok: true, message: msg || successMessage, path }
}

async function ensureRoute(
  getSnapshot: () => VoiceSiteSnapshot,
  getHandlers: () => VoiceHandlers,
  path: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (getSnapshot().route === path) return { ok: true }
  const navigate = getHandlers().navigate
  if (!navigate) return { ok: false, error: "Navigation is not ready on this page" }
  await navigate(path)
  const start = Date.now()
  while (Date.now() - start < 4000) {
    if (getSnapshot().route === path) return { ok: true }
    await sleep(40)
  }
  return { ok: false, error: `Could not open ${path}` }
}

export async function executeVoiceTool(
  functionName: string,
  args: Record<string, unknown>,
  getSnapshot: () => VoiceSiteSnapshot,
  getHandlers: () => VoiceHandlers
): Promise<ToolResult> {
  const snap = getSnapshot()
  const handlers = getHandlers()

  switch (functionName) {
    case "get_page_info":
      return { ok: true, page: snap }

    case "navigate": {
      const path = normalizePath(String(args.path ?? ""))
      if (!path || !ALLOWED_PATH.test(path)) {
        return { ok: false, error: "That path is not allowed" }
      }
      return navigateTo(getHandlers, path, `Navigated to ${path}`)
    }

    case "go_back":
      return call(handlers.goBack, "Go back is not ready")

    case "scroll_to": {
      const target = String(args.target ?? "")
      if (!isScrollTarget(target)) {
        return { ok: false, error: `Unknown scroll target: ${target}` }
      }
      const message = await smoothScrollTo(target)
      return { ok: true, message }
    }

    case "set_listings_page": {
      const pageArg = args.page
      let page: number | "next" | "prev"
      if (pageArg === "next" || pageArg === "prev") page = pageArg
      else if (typeof pageArg === "number") page = pageArg
      else if (typeof pageArg === "string" && /^\d+$/.test(pageArg)) page = Number(pageArg)
      else return { ok: false, error: "page must be next, prev, or a number" }

      const setPage = await waitForHandler(getHandlers, "setListingsPage")
      if (!setPage) return { ok: false, error: "Listings pagination is not ready" }
      return { ok: true, message: await setPage(page) }
    }

    case "search_listings": {
      const q = String(args.query ?? "").trim()
      const ready = await ensureRoute(getSnapshot, getHandlers, "/listings")
      if (!ready.ok) return ready
      const setSearch = await waitForHandler(getHandlers, "setListingsSearch")
      if (!setSearch) return { ok: false, error: "Listings search is not ready" }
      return {
        ok: true,
        message: await setSearch(q),
        query: q,
      }
    }

    case "filter_by_tag": {
      const tag = args.tag == null || args.tag === "" ? null : String(args.tag)
      const ready = await ensureRoute(getSnapshot, getHandlers, "/listings")
      if (!ready.ok) return ready
      const setTag = await waitForHandler(getHandlers, "setListingsTag")
      if (!setTag) return { ok: false, error: "Listings filters are not ready" }
      return {
        ok: true,
        message: await setTag(tag),
        tag,
      }
    }

    case "open_listing": {
      const id = resolveListingId(snap, args)
      if (!id) {
        return {
          ok: false,
          error:
            snap.visibleListings.length === 0
              ? "No listings are visible on this page yet"
              : "Could not find that listing",
        }
      }
      return navigateTo(getHandlers, `/listings/${id}`, `Opened listing ${id}`)
    }

    case "open_builder": {
      let username =
        typeof args.username === "string" ? args.username.replace(/^@/, "").trim() : ""
      const listingName =
        typeof args.listing_name === "string" ? args.listing_name.trim().toLowerCase() : ""

      if (!username && listingName) {
        const byOrdinal = ordinalIndex(listingName)
        const hit =
          byOrdinal != null
            ? snap.visibleListings[byOrdinal]
            : (snap.visibleListings.find((l) => l.name.toLowerCase() === listingName) ??
              snap.visibleListings.find((l) => l.name.toLowerCase().includes(listingName)))
        username = hit?.builderUsername ?? ""
      }
      if (!username && snap.listingDetail?.builderUsername) {
        username = snap.listingDetail.builderUsername
      }
      if (!username) {
        return {
          ok: false,
          error: "I could not tell who the builder is from this page",
        }
      }
      return navigateTo(getHandlers, `/u/${username}`, `Opened builder ${username}`)
    }

    case "fill_signup": {
      const ready = await ensureRoute(getSnapshot, getHandlers, "/signup")
      if (!ready.ok) return ready
      const emailRaw = typeof args.email === "string" ? args.email : ""
      const email = emailRaw ? normalizeVoiceEmail(emailRaw) : undefined
      if (email && !looksLikeEmail(email)) {
        return {
          ok: false,
          error: `That does not look like an email: ${email}. Ask the user to say it again clearly.`,
        }
      }
      const fields = {
        fullName: typeof args.fullName === "string" ? args.fullName.trim() : undefined,
        email,
        password: typeof args.password === "string" ? args.password : undefined,
      }
      const fillAuth = await waitForHandler(getHandlers, "fillAuth")
      if (!fillAuth) return { ok: false, error: "Signup form is not ready" }
      const msg = await fillAuth(fields)
      return {
        ok: true,
        message: fields.password
          ? "Filled the signup form. I filled the password without reading it aloud."
          : msg,
      }
    }

    case "fill_signin": {
      const ready = await ensureRoute(getSnapshot, getHandlers, "/signin")
      if (!ready.ok) return ready
      const emailRaw = typeof args.email === "string" ? args.email : ""
      const email = emailRaw ? normalizeVoiceEmail(emailRaw) : undefined
      if (email && !looksLikeEmail(email)) {
        return {
          ok: false,
          error: `That does not look like an email: ${email}. Ask the user to say it again clearly.`,
        }
      }
      const fields = {
        email,
        password: typeof args.password === "string" ? args.password : undefined,
      }
      const fillAuth = await waitForHandler(getHandlers, "fillAuth")
      if (!fillAuth) return { ok: false, error: "Sign-in form is not ready" }
      const msg = await fillAuth(fields)
      return {
        ok: true,
        message: fields.password
          ? "Filled the sign-in form. I filled the password without reading it aloud."
          : msg,
      }
    }

    case "submit_auth": {
      const submitAuth = await waitForHandler(getHandlers, "submitAuth")
      return call(submitAuth, "Auth form is not ready")
    }

    case "open_upload": {
      if (!snap.signedIn) {
        await ensureRoute(getSnapshot, getHandlers, "/signin")
        return { ok: false, error: "Please sign in before listing a project" }
      }
      if (snap.route !== "/listings" && snap.route !== "/profile") {
        const ready = await ensureRoute(getSnapshot, getHandlers, "/listings")
        if (!ready.ok) return ready
      }
      const openUpload = await waitForHandler(getHandlers, "openUpload")
      return call(openUpload, "Upload is not ready on this page")
    }

    case "fill_listing": {
      if (!snap.signedIn) {
        await ensureRoute(getSnapshot, getHandlers, "/signin")
        return { ok: false, error: "Please sign in before listing a project" }
      }

      const linkRaw = typeof args.link === "string" ? args.link.trim() : ""
      const repoRaw = typeof args.repoUrl === "string" ? args.repoUrl.trim() : ""
      const link = linkRaw ? normalizeVoiceUrl(linkRaw) : undefined
      const repoUrl = repoRaw ? normalizeVoiceUrl(repoRaw) : undefined

      if (link && !looksLikeUrl(link)) {
        return { ok: false, error: `Could not turn that into a link: ${linkRaw}` }
      }
      if (repoUrl && !looksLikeUrl(repoUrl)) {
        return { ok: false, error: `Could not turn that into a repo URL: ${repoRaw}` }
      }

      if (snap.route !== "/listings" && snap.route !== "/profile") {
        const ready = await ensureRoute(getSnapshot, getHandlers, "/listings")
        if (!ready.ok) return ready
      }

      const fillListing = await waitForHandler(getHandlers, "fillListing")
      if (!fillListing) {
        return { ok: false, error: "Upload form is not ready on this page" }
      }

      const fields = {
        name: typeof args.name === "string" ? args.name : undefined,
        description: typeof args.description === "string" ? args.description : undefined,
        link,
        tags: Array.isArray(args.tags)
          ? args.tags.filter((t): t is string => typeof t === "string")
          : undefined,
        repoUrl,
        isOpenSource:
          typeof args.isOpenSource === "boolean" ? args.isOpenSource : undefined,
      }
      const msg = await fillListing(fields)
      return {
        ok: true,
        message: link ? `Set live link to ${link}` : msg,
        link,
      }
    }

    case "enrich_from_url": {
      if (!snap.signedIn) {
        await ensureRoute(getSnapshot, getHandlers, "/signin")
        return { ok: false, error: "Please sign in before listing a project" }
      }
      const urlRaw = typeof args.url === "string" ? args.url : ""
      const url = urlRaw ? normalizeVoiceUrl(urlRaw) : ""
      if (!url || !looksLikeUrl(url)) {
        return { ok: false, error: "A valid URL is required" }
      }
      const enrichFromUrl = await waitForHandler(getHandlers, "enrichFromUrl")
      if (!enrichFromUrl) {
        return { ok: false, error: "Upload form is not ready on this page" }
      }
      return { ok: true, message: await enrichFromUrl(url), url }
    }

    case "upload_next": {
      const uploadNext = await waitForHandler(getHandlers, "uploadNext")
      return call(uploadNext, "Upload form is not ready on this page")
    }

    case "upload_previous": {
      const uploadPrevious = await waitForHandler(getHandlers, "uploadPrevious")
      return call(uploadPrevious, "Upload form is not ready on this page")
    }

    case "upload_goto_step": {
      const step = String(args.step ?? "").trim()
      if (!step) return { ok: false, error: "step is required (basics, media, links, or tags)" }
      const uploadGotoStep = await waitForHandler(getHandlers, "uploadGotoStep")
      if (!uploadGotoStep) {
        return { ok: false, error: "Upload form is not ready on this page" }
      }
      return { ok: true, message: await uploadGotoStep(step), step }
    }

    case "set_upload_link": {
      const setUploadLink = await waitForHandler(getHandlers, "setUploadLink")
      if (!setUploadLink) {
        return { ok: false, error: "Upload form is not ready on this page" }
      }
      const fields = {
        platform: typeof args.platform === "string" ? args.platform : undefined,
        url: typeof args.url === "string" ? args.url : undefined,
        index:
          typeof args.index === "string"
            ? args.index
            : typeof args.index === "number"
              ? String(args.index)
              : typeof args.query === "string"
                ? args.query
                : undefined,
      }
      return { ok: true, message: await setUploadLink(fields) }
    }

    case "remove_upload_link": {
      const removeUploadLink = await waitForHandler(getHandlers, "removeUploadLink")
      if (!removeUploadLink) {
        return { ok: false, error: "Upload form is not ready on this page" }
      }
      const query = String(
        args.query ?? args.platform ?? args.name ?? args.index ?? "last"
      ).trim()
      return { ok: true, message: await removeUploadLink(query || "last") }
    }

    case "submit_listing": {
      const submitListing = await waitForHandler(getHandlers, "submitListing")
      return call(submitListing, "Upload form is not ready on this page")
    }

    case "edit_listing": {
      if (!snap.signedIn) {
        await ensureRoute(getSnapshot, getHandlers, "/signin")
        return { ok: false, error: "Please sign in to edit a listing" }
      }
      const ready = await ensureRoute(getSnapshot, getHandlers, "/profile")
      if (!ready.ok) return ready
      const query =
        typeof args.name === "string"
          ? args.name
          : typeof args.query === "string"
            ? args.query
            : ""
      const editListing = await waitForHandler(getHandlers, "editListing")
      if (!editListing) return { ok: false, error: "Profile listings are not ready" }
      return { ok: true, message: await editListing(query) }
    }

    case "delete_listing": {
      if (!snap.signedIn) {
        await ensureRoute(getSnapshot, getHandlers, "/signin")
        return { ok: false, error: "Please sign in to delete a listing" }
      }
      const ready = await ensureRoute(getSnapshot, getHandlers, "/profile")
      if (!ready.ok) return ready
      const query =
        typeof args.name === "string"
          ? args.name
          : typeof args.query === "string"
            ? args.query
            : ""
      const deleteListing = await waitForHandler(getHandlers, "deleteListing")
      if (!deleteListing) return { ok: false, error: "Profile listings are not ready" }
      return { ok: true, message: await deleteListing(query) }
    }

    case "cancel_delete_listing": {
      const result = await call(
        handlers.cancelDeleteListing,
        "No delete confirmation is open"
      )
      if (result.ok && /no delete confirmation/i.test(result.message)) {
        return { ok: false, error: result.message }
      }
      return result
    }

    case "confirm_delete_listing": {
      if (!snap.signedIn) {
        return { ok: false, error: "Please sign in to delete a listing" }
      }
      const result = await call(
        handlers.confirmDeleteListing,
        "No delete confirmation is open"
      )
      if (result.ok && /no delete confirmation/i.test(result.message)) {
        return { ok: false, error: result.message }
      }
      return result
    }

    case "open_avatar_picker": {
      if (!snap.signedIn) {
        await ensureRoute(getSnapshot, getHandlers, "/signin")
        return { ok: false, error: "Please sign in to change your avatar" }
      }
      const ready = await ensureRoute(getSnapshot, getHandlers, "/profile")
      if (!ready.ok) return ready
      const openAvatarPicker = await waitForHandler(getHandlers, "openAvatarPicker")
      return call(openAvatarPicker, "Avatar picker is not ready")
    }

    case "set_avatar": {
      if (!snap.signedIn) {
        await ensureRoute(getSnapshot, getHandlers, "/signin")
        return { ok: false, error: "Please sign in to change your avatar" }
      }
      const ready = await ensureRoute(getSnapshot, getHandlers, "/profile")
      if (!ready.ok) return ready
      const choice = String(args.choice ?? args.name ?? args.index ?? "").trim()
      if (!choice) {
        return { ok: false, error: "Pick avatar 1 to 20, or a seed name like ember" }
      }
      const setAvatar = await waitForHandler(getHandlers, "setAvatar")
      if (!setAvatar) return { ok: false, error: "Avatar picker is not ready" }
      return { ok: true, message: await setAvatar(choice) }
    }

    case "sign_out": {
      if (!snap.signedIn) {
        return { ok: false, error: "You are not signed in" }
      }
      return call(handlers.signOut, "Sign out is not ready")
    }

    case "upvote_listing": {
      if (!snap.signedIn) {
        await ensureRoute(getSnapshot, getHandlers, "/signin")
        return { ok: false, error: "Please sign in to upvote" }
      }
      const id =
        typeof args.id === "string" ? args.id : snap.listingDetail?.id
      const upvoteListing = await waitForHandler(getHandlers, "upvoteListing")
      if (!upvoteListing) return { ok: false, error: "Upvote is not ready on this page" }
      return { ok: true, message: await upvoteListing(id) }
    }

    case "fill_comment": {
      if (!snap.listingDetail) {
        return { ok: false, error: "Open a listing first to comment" }
      }
      if (!snap.signedIn) {
        await ensureRoute(getSnapshot, getHandlers, "/signin")
        return { ok: false, error: "Please sign in to comment" }
      }
      const text = typeof args.text === "string" ? args.text.trim() : ""
      if (!text) return { ok: false, error: "Comment text is required" }
      const fillComment = await waitForHandler(getHandlers, "fillComment")
      if (!fillComment) {
        return { ok: false, error: "Comment box is not ready on this page" }
      }
      return { ok: true, message: await fillComment(text) }
    }

    case "submit_comment": {
      if (!snap.listingDetail) {
        return { ok: false, error: "Open a listing first to comment" }
      }
      if (!snap.signedIn) {
        await ensureRoute(getSnapshot, getHandlers, "/signin")
        return { ok: false, error: "Please sign in to comment" }
      }
      const submitComment = await waitForHandler(getHandlers, "submitComment")
      return call(submitComment, "Comment box is not ready on this page")
    }

    case "open_link": {
      const links = snap.listingDetail?.links ?? []
      if (links.length === 0) {
        return { ok: false, error: "No links on this listing" }
      }

      const target = typeof args.target === "string" ? args.target.trim().toLowerCase() : ""
      const rawIndex =
        typeof args.index === "number"
          ? args.index
          : typeof args.index === "string" && /^-?\d+$/.test(args.index)
            ? Number(args.index)
            : null

      let hit =
        rawIndex != null
          ? (links[rawIndex] ?? (rawIndex >= 1 ? links[rawIndex - 1] : undefined))
          : undefined

      if (!hit && target) {
        const byOrdinal = ordinalIndex(target)
        if (byOrdinal != null) {
          hit = links[byOrdinal]
        } else {
          hit =
            links.find((l) => l.platform.toLowerCase() === target) ??
            links.find((l) => l.label.toLowerCase() === target) ??
            links.find((l) => l.label.toLowerCase().includes(target)) ??
            links.find((l) => l.platform.toLowerCase().includes(target))
        }
      }

      if (!hit && !target && rawIndex == null) {
        hit = links[0]
      }

      if (!hit) {
        return {
          ok: false,
          error: `Could not find that link. Available: ${links.map((l) => l.label).join(", ")}`,
        }
      }

      window.open(hit.url, "_blank", "noopener,noreferrer")
      return { ok: true, message: `Opened ${hit.label}`, url: hit.url }
    }

    case "open_similar": {
      const pool = snap.similarListings
      if (pool.length === 0) {
        return { ok: false, error: "No similar listings on this page" }
      }

      const fakeSnap = { ...snap, visibleListings: pool }
      const id = resolveListingId(fakeSnap, args)
      if (!id) {
        return {
          ok: false,
          error: `Could not find that similar listing. Try first, second, or a name.`,
        }
      }
      return navigateTo(getHandlers, `/listings/${id}`, `Opened similar listing ${id}`)
    }

    case "open_profile_editor": {
      if (!snap.signedIn) {
        await ensureRoute(getSnapshot, getHandlers, "/signin")
        return { ok: false, error: "Please sign in to edit your profile" }
      }
      const ready = await ensureRoute(getSnapshot, getHandlers, "/profile")
      if (!ready.ok) return ready
      const openProfileEditor = await waitForHandler(getHandlers, "openProfileEditor")
      return call(openProfileEditor, "Profile editor is not ready")
    }

    case "fill_profile": {
      if (!snap.signedIn) {
        await ensureRoute(getSnapshot, getHandlers, "/signin")
        return { ok: false, error: "Please sign in to edit your profile" }
      }
      const ready = await ensureRoute(getSnapshot, getHandlers, "/profile")
      if (!ready.ok) return ready

      let fillProfile = getHandlers().fillProfile
      if (!fillProfile) {
        const openProfileEditor = await waitForHandler(getHandlers, "openProfileEditor")
        if (openProfileEditor) await openProfileEditor()
        fillProfile = await waitForHandler(getHandlers, "fillProfile")
      }
      if (!fillProfile) {
        return { ok: false, error: "Profile editor is not ready" }
      }

      const fields = {
        username: typeof args.username === "string" ? args.username : undefined,
        bio: typeof args.bio === "string" ? args.bio : undefined,
        twitterUrl: typeof args.twitterUrl === "string" ? args.twitterUrl : undefined,
        githubUrl: typeof args.githubUrl === "string" ? args.githubUrl : undefined,
        portfolioUrl:
          typeof args.portfolioUrl === "string" ? args.portfolioUrl : undefined,
        linkedinUrl:
          typeof args.linkedinUrl === "string" ? args.linkedinUrl : undefined,
        state: typeof args.state === "string" ? args.state : undefined,
        techStack: Array.isArray(args.techStack)
          ? args.techStack.filter((t): t is string => typeof t === "string")
          : undefined,
      }
      return { ok: true, message: await fillProfile(fields) }
    }

    default:
      return { ok: false, error: `Unknown tool: ${functionName}` }
  }
}
