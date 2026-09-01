'use client'

import { Pencil, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import UploadProject from "./UploadProject"
import AvatarPicker from "./AvatarPicker"
import UserAvatar from "./UserAvatar"
import ProfileActivityChart from "./ProfileActivityChart"
import { useMe, useMyListings } from "@/lib/queries/hooks"
import { useDeleteListing, useUpdateAvatar } from "@/lib/queries/mutations"
import { MyListingCardSkeleton } from "./ProjectCardSkeleton"
import MyListingCard from "./MyListingCard"
import type { Listing } from "@/lib/queries/types"

const Page = () => {
    const { data: user, isFetched } = useMe()
    const { data, isLoading } = useMyListings()
    const deleteListing = useDeleteListing()
    const updateAvatar = useUpdateAvatar()
    const [editing, setEditing] = useState<Listing | null>(null)
    const [editOpen, setEditOpen] = useState(false)
    const [pickerOpen, setPickerOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (isFetched && !user) {
            toast.error("Please log in to continue", { id: "auth-notice" })
            router.replace("/signin")
        }
    }, [isFetched, user, router])

    if (isFetched && !user) return null

    const listings = data?.listings ?? []

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
                    {isFetched ? (
                        <UserAvatar
                            avatarUrl={user?.avatarUrl}
                            seed={avatarSeed}
                            size={96}
                            alt={user?.fullName ? `${user.fullName} avatar` : "Avatar"}
                        />
                    ) : (
                        <div className="h-full w-full animate-pulse bg-black/5" aria-hidden="true" />
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    aria-label="Change avatar"
                    title="Change avatar"
                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-[var(--paper-muted)] shadow-sm transition-colors hover:bg-[var(--paper-accent-soft)] hover:text-[#DA5CC7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40"
                >
                    <Pencil size={14} />
                </button>
            </div>

            <div className="flex-1">
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
            </div>
        </div>

        <div className="px-5 pb-2 sm:px-8">
            <ProfileActivityChart />
        </div>

        <div className="px-5 py-8 sm:px-8 sm:py-10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    <span
                        className="box-decoration-clone px-2.5 py-1"
                        style={{ backgroundColor: "#E93545" }}
                    >
                        Your Listings
                    </span>
                </h2>
                <UploadProject />
            </div>
            {isLoading ? (
                <div className="paper-sheet-list">
                    {[...Array(3)].map((_, i) => (
                        <MyListingCardSkeleton key={i} />
                    ))}
                </div>
            ) : listings.length > 0 ? (
                <div className="paper-sheet-list">
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
    </div>
  )
}

export default Page
