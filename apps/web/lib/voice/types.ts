export interface VoiceVisibleListing {
  id: string
  name: string
  builderName: string
  builderUsername: string | null
}

export interface VoiceListingLink {
  platform: string
  label: string
  url: string
}

export interface VoiceListingDetail {
  id: string
  name: string
  builderName: string
  builderUsername: string | null
  links: VoiceListingLink[]
}

export interface VoiceProfileContext {
  username: string | null
  fullName: string | null
  isOwn: boolean
  state: string | null
  stateName: string | null
  bio: string | null
  techStack: string[]
}

export interface VoiceUserSummary {
  name: string | null
  username: string | null
}

export type VoiceAuthPage = "signin" | "signup" | null

export type VoiceLandingSection =
  | "hero"
  | "stats"
  | "features"
  | "how-it-works"
  | "faq"
  | "cta"
  | "footer"
  | null

export interface VoiceSiteSnapshot {
  route: string
  previousRoute: string | null
  signedIn: boolean
  user: VoiceUserSummary | null
  sectionInView: VoiceLandingSection
  listingsSearch: string
  listingsTag: string | null
  listingsPage: number
  listingsTotalPages: number
  visibleListings: VoiceVisibleListing[]
  similarListings: VoiceVisibleListing[]
  listingDetail: VoiceListingDetail | null
  profile: VoiceProfileContext | null
  uploadOpen: boolean
  uploadStep: number
  uploadStepKey: "basics" | "media" | "links" | "tags" | null
  uploadSocialLinks: { platform: string; label: string; url: string }[]
  authPage: VoiceAuthPage
  profileEditorOpen: boolean
  commentDraft: string
}

export type VoiceSessionState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error"

export const EMPTY_VOICE_SNAPSHOT: VoiceSiteSnapshot = {
  route: "/",
  previousRoute: null,
  signedIn: false,
  user: null,
  sectionInView: null,
  listingsSearch: "",
  listingsTag: null,
  listingsPage: 1,
  listingsTotalPages: 1,
  visibleListings: [],
  similarListings: [],
  listingDetail: null,
  profile: null,
  uploadOpen: false,
  uploadStep: 0,
  uploadStepKey: null,
  uploadSocialLinks: [],
  authPage: null,
  profileEditorOpen: false,
  commentDraft: "",
}

// Tools the browser executes. FAQ (answer_about_showhunt) stays on the voice server.
export type VoiceToolName =
  | "get_page_info"
  | "navigate"
  | "go_back"
  | "scroll_to"
  | "set_listings_page"
  | "search_listings"
  | "filter_by_tag"
  | "open_listing"
  | "open_builder"
  | "fill_signup"
  | "fill_signin"
  | "submit_auth"
  | "open_upload"
  | "fill_listing"
  | "enrich_from_url"
  | "upload_next"
  | "upload_previous"
  | "upload_goto_step"
  | "submit_listing"
  | "set_upload_link"
  | "remove_upload_link"
  | "edit_listing"
  | "delete_listing"
  | "cancel_delete_listing"
  | "confirm_delete_listing"
  | "open_avatar_picker"
  | "set_avatar"
  | "sign_out"
  | "upvote_listing"
  | "fill_comment"
  | "submit_comment"
  | "open_link"
  | "open_similar"
  | "open_profile_editor"
  | "fill_profile"
