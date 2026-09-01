'use client'

import { Eye, LayoutGrid, List, Pencil, User, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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

type ProjectsView = "grid" | "list"

const PROJECTS_VIEW_KEY = "showhunt:projects-view"

const Page = () => {
    const { data: user, isFetched } = useMe()
    const { data, isLoading } = useMyListings()
    const deleteListing = useDeleteListing()
    const updateAvatar = useUpdateAvatar()
    const [editing, setEditing] = useState<Listing | null>(null)
    const [editOpen, setEditOpen] = useState(false)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [projectsView, setProjectsView] = useState<ProjectsView>("grid")
    const router = useRouter()
    // Only treat as loading when we have no user yet — keep buttons visible on refresh if cache exists
    const userLoading = !isFetched && !user

    useEffect(() => {
        if (isFetched && !user) {
            toast.error("Please log in to continue", { id: "auth-notice" })
            router.replace("/signin")
        }
    }, [isFetched, user, router])

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

        <div className="px-5 py-8 sm:px-8 sm:py-10">
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
                            <UploadProject />
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
                            onEdit={(listing) => {
                                setEditing(listing)
                                setEditOpen(true)
                            }}
                            onDelete={(id) =>
                                deleteListing.mutate(id, {
                                    onSuccess: () => toast.success("Listing deleted"),
                                    onError: () => toast.error("Could not delete listing, please try again"),
                                })
                            }
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
            onOpenChange={setEditOpen}
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
