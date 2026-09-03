'use client'

import { Eye, LayoutGrid, List, Pencil, User, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import UploadProject from "./UploadProject"
import AvatarPicker from "./AvatarPicker"
import UserAvatar from "./UserAvatar"
import PublicProfileDrawer from "./PublicProfileDrawer"
import { useMe, useMyListings } from "@/lib/queries/hooks"
import { useDeleteListing, useUpdateAvatar } from "@/lib/queries/mutations"
import { MyListingCardSkeleton } from "./ProjectCardSkeleton"
import MyListingCard from "./MyListingCard"
import { Skeleton } from "@/components/ui/skeleton"
import type { Listing } from "@/lib/queries/types"
import { cn } from "@/lib/utils"
import { useVoiceSite } from "@/components/voice/VoiceSiteContext"
import { indiaStateName } from "@/lib/india-states"
import { AVATAR_SEEDS, toAvatarId } from "@/lib/avatars"

type ProjectsView = "grid" | "list"

const PROJECTS_VIEW_KEY = "showhunt:projects-view"

function ordinalIndex(value: string): number | null {
    const v = value
        .trim()
        .toLowerCase()
        .replace(/\b(the|a|an|project|listing|product|one|my)\b/g, " ")
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

function resolveMyListing(listings: Listing[], query: string): Listing | null {
    if (listings.length === 0) return null
    const q = query.trim()
    if (!q) return listings[0] ?? null
    const byOrdinal = ordinalIndex(q)
    if (byOrdinal != null) return listings[byOrdinal] ?? null
    const needle = q.toLowerCase()
    return (
        listings.find((l) => l.name.toLowerCase() === needle) ??
        listings.find((l) => l.name.toLowerCase().includes(needle)) ??
        null
    )
}

function resolveAvatarChoice(choice: string): string | null {
    const raw = choice.trim().toLowerCase()
    if (!raw) return null
    const byOrdinal = ordinalIndex(raw.replace(/\b(avatar|option|one)\b/g, " ").replace(/\s+/g, " ").trim())
    if (byOrdinal != null && byOrdinal >= 0 && byOrdinal < AVATAR_SEEDS.length) {
        return toAvatarId(AVATAR_SEEDS[byOrdinal]!)
    }
    if (/^\d+$/.test(raw)) {
        const n = Number(raw)
        if (n >= 1 && n <= AVATAR_SEEDS.length) return toAvatarId(AVATAR_SEEDS[n - 1]!)
        if (n >= 0 && n < AVATAR_SEEDS.length) return toAvatarId(AVATAR_SEEDS[n]!)
    }
    const seed = AVATAR_SEEDS.find((s) => s === raw)
    return seed ? toAvatarId(seed) : null
}

const Page = () => {
    const { data: user, isFetched } = useMe()
    const { data, isLoading } = useMyListings()
    const deleteListing = useDeleteListing()
    const updateAvatar = useUpdateAvatar()
    const [editing, setEditing] = useState<Listing | null>(null)
    const [editOpen, setEditOpen] = useState(false)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")
    const pendingDeleteIdRef = useRef<string | null>(null)
    const [projectsView, setProjectsView] = useState<ProjectsView>("grid")
    const router = useRouter()
    const { patchSnapshot, registerHandlers } = useVoiceSite()
    // Only treat as loading when we have no user yet. Keep buttons visible on refresh if cache exists.
    const userLoading = !isFetched && !user

    const closeDeleteDialog = () => {
        pendingDeleteIdRef.current = null
        setPendingDeleteId(null)
        setDeleteConfirmText("")
    }

    const openDeleteDialog = (id: string) => {
        pendingDeleteIdRef.current = id
        setPendingDeleteId(id)
        setDeleteConfirmText("")
    }

    const performDelete = (id: string) => {
        deleteListing.mutate(id, {
            onSuccess: () => {
                closeDeleteDialog()
                toast.success("Listing deleted")
            },
            onError: () => toast.error("Could not delete listing, please try again"),
        })
    }

    useEffect(() => {
        if (isFetched && !user) {
            toast.error("Please log in to continue", { id: "auth-notice" })
            router.replace("/signin")
        }
    }, [isFetched, user, router])

    useEffect(() => {
        patchSnapshot({
            profile: user
                ? {
                      username: user.username,
                      fullName: user.fullName,
                      isOwn: true,
                      state: user.state ?? null,
                      stateName: indiaStateName(user.state),
                      bio: user.bio ?? null,
                      techStack: user.techStack ?? [],
                  }
                : null,
            profileEditorOpen: profileOpen,
            visibleListings: (data?.listings ?? []).map((l) => ({
                id: l.id,
                name: l.name,
                builderName: user?.fullName ?? "You",
                builderUsername: user?.username ?? null,
            })),
        })
    }, [user, profileOpen, data, patchSnapshot])

    useEffect(() => {
        return registerHandlers({
            openProfileEditor: () => {
                setProfileOpen(true)
                return "Opened the profile editor"
            },
            editListing: (query) => {
                const listings = data?.listings ?? []
                if (listings.length === 0) return "You have no listings to edit"
                const hit = resolveMyListing(listings, query)
                if (!hit) return "Could not find that listing to edit"
                setEditing(hit)
                setEditOpen(true)
                return `Opened editor for ${hit.name}`
            },
            deleteListing: (query) => {
                const listings = data?.listings ?? []
                if (listings.length === 0) return "You have no listings to delete"
                const hit = resolveMyListing(listings, query)
                if (!hit) return "Could not find that listing to delete"
                openDeleteDialog(hit.id)
                return `Opened delete confirmation for ${hit.name}. Type the project name and confirm to delete, or cancel.`
            },
            cancelDeleteListing: () => {
                if (!pendingDeleteIdRef.current) return "No delete confirmation is open"
                closeDeleteDialog()
                return "Cancelled delete"
            },
            confirmDeleteListing: () => {
                const listings = data?.listings ?? []
                const hit = listings.find((l) => l.id === pendingDeleteIdRef.current)
                if (!hit) return "No delete confirmation is open"
                setDeleteConfirmText(hit.name)
                performDelete(hit.id)
                return `Deleting ${hit.name}`
            },
            openAvatarPicker: () => {
                setPickerOpen(true)
                return "Opened avatar picker. There are 20 options. Say set avatar 1 through 20, or a name like ember."
            },
            setAvatar: (choice) => {
                const id = resolveAvatarChoice(choice)
                if (!id) {
                    return "Pick avatar 1 to 20, or a name like ember, volt, neon"
                }
                setPickerOpen(true)
                updateAvatar.mutate(id, {
                    onSuccess: () => {
                        setPickerOpen(false)
                        toast.success("Avatar updated")
                    },
                    onError: () => toast.error("Could not save avatar, please try again"),
                })
                return `Setting avatar ${choice}`
            },
        })
    }, [registerHandlers, data, deleteListing, updateAvatar])

    useEffect(() => {
        try {
            const stored = localStorage.getItem(PROJECTS_VIEW_KEY)
            if (stored === "grid" || stored === "list") setProjectsView(stored)
        } catch {
            // ignore storage errors
        }
    }, [])

    const changeProjectsView = (view: ProjectsView) => {
        setProjectsView(view)
        try {
            localStorage.setItem(PROJECTS_VIEW_KEY, view)
        } catch {
            // ignore storage errors
        }
    }

    if (isFetched && !user) return null

    const listings = data?.listings ?? []
    const isGrid = projectsView === "grid"
    const listClassName = isGrid
        ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
        : "paper-sheet-list"

    const avatarSeed = user?.email ?? user?.fullName ?? "showhunt"
    const formattedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : ''

  return (
    <div>
        <div className="flex flex-col items-start gap-6 p-5 sm:flex-row sm:items-center sm:gap-10 sm:p-8">
            <div className="relative shrink-0">
                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-[var(--paper-surface)]">
                    {userLoading ? (
                        <Skeleton className="h-full w-full rounded-full bg-[var(--paper-border)]" />
                    ) : (
                        <UserAvatar
                            avatarUrl={user?.avatarUrl}
                            seed={avatarSeed}
                            size={96}
                            alt={user?.fullName ? `${user.fullName} avatar` : "Avatar"}
                        />
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    disabled={userLoading}
                    aria-label="Change avatar"
                    title="Change avatar"
                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-[var(--paper-muted)] shadow-sm transition-colors hover:bg-[var(--paper-accent-soft)] hover:text-[#DA5CC7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Pencil size={14} />
                </button>
            </div>

            <div className="min-w-0 flex-1">
                {userLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-9 w-48 rounded-[8px] bg-[var(--paper-border)] sm:w-64" />
                        <Skeleton className="h-4 w-40 bg-[var(--paper-border)]" />
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-semibold tracking-tight text-white">
                            <span
                                className="box-decoration-clone px-2.5 py-1"
                                style={{ backgroundColor: "#E93545" }}
                            >
                                {user?.fullName ?? ""}
                            </span>
                        </h1>
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--paper-muted)]">
                            <span className="flex items-center gap-2">
                                <User size={16} />
                                Joined {formattedDate}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>

        <div id="listings" className="px-5 py-8 sm:px-8 sm:py-10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 rounded-[8px] border border-[var(--paper-border)] bg-white p-1">
                    <h2 className="px-2.5 text-sm font-medium text-[var(--paper-ink)] sm:text-base">
                        All projects
                    </h2>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => changeProjectsView("list")}
                            aria-label="List view"
                            aria-pressed={!isGrid}
                            title="List view"
                            className={cn(
                                "flex h-8 w-8 cursor-pointer items-center justify-center rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40",
                                !isGrid
                                    ? "bg-[var(--paper-ink)] text-white"
                                    : "text-[var(--paper-muted)] hover:bg-black/5 hover:text-[var(--paper-ink)]",
                            )}
                        >
                            <List className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => changeProjectsView("grid")}
                            aria-label="Grid view"
                            aria-pressed={isGrid}
                            title="Grid view"
                            className={cn(
                                "flex h-8 w-8 cursor-pointer items-center justify-center rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40",
                                isGrid
                                    ? "bg-[var(--paper-ink)] text-white"
                                    : "text-[var(--paper-muted)] hover:bg-black/5 hover:text-[var(--paper-ink)]",
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {userLoading ? (
                        <>
                            <Skeleton className="h-10 w-[138px] rounded-[8px] bg-[var(--paper-border)]" />
                            <Skeleton className="h-10 w-[188px] rounded-[8px] bg-[var(--paper-border)]" />
                        </>
                    ) : (
                        <>
                            <UploadProject voiceEnabled={!editOpen} />
                            {user?.username ? (
                                <Link
                                    href={`/u/${user.username}`}
                                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[8px] bg-[#1CB061] px-4 text-sm font-medium text-white transition-colors hover:bg-[#179652] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1CB061]/40"
                                >
                                    <Eye className="h-4 w-4" />
                                    View public profile
                                </Link>
                            ) : user ? (
                                <button
                                    type="button"
                                    onClick={() => setProfileOpen(true)}
                                    className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-[8px] bg-[#1CB061] px-4 text-sm font-medium text-white transition-colors hover:bg-[#179652] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1CB061]/40"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Create public profile
                                </button>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
            {isLoading || userLoading ? (
                <div className={listClassName}>
                    {[...Array(isGrid ? 4 : 3)].map((_, i) => (
                        <MyListingCardSkeleton key={i} />
                    ))}
                </div>
            ) : listings.length > 0 ? (
                <div className={listClassName}>
                    {listings.map((l) => (
                        <MyListingCard
                            key={l.id}
                            listing={l}
                            deleting={deleteListing.isPending && deleteListing.variables === l.id}
                            deleteOpen={pendingDeleteId === l.id}
                            onDeleteOpenChange={(open) => {
                                if (open) {
                                    openDeleteDialog(l.id)
                                } else {
                                    closeDeleteDialog()
                                }
                            }}
                            confirmText={pendingDeleteId === l.id ? deleteConfirmText : ""}
                            onConfirmTextChange={setDeleteConfirmText}
                            onEdit={(listing) => {
                                setEditing(listing)
                                setEditOpen(true)
                            }}
                            onDelete={performDelete}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-[var(--paper-muted)]">No listings yet</p>
            )}
        </div>

        <UploadProject
            listing={editing}
            open={editOpen}
            onOpenChange={(next) => {
                setEditOpen(next)
                if (!next) setEditing(null)
            }}
            voiceEnabled={editOpen}
            trigger={null}
        />

        <AvatarPicker
            open={pickerOpen}
            currentUrl={user?.avatarUrl ?? null}
            saving={updateAvatar.isPending}
            onSelect={(url) =>
                updateAvatar.mutate(url, {
                    onSuccess: () => setPickerOpen(false),
                    onError: () => toast.error("Could not save avatar, please try again"),
                })
            }
            onClose={() => setPickerOpen(false)}
        />

        {user && (
            <PublicProfileDrawer
                user={user}
                open={profileOpen}
                onOpenChange={setProfileOpen}
            />
        )}
    </div>
  )
}

export default Page
