'use client'

import { ArrowBigUp, Layers, Pencil, User } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { toast } from "sonner"
import UploadProject from "./UploadProject"
import AvatarPicker from "./AvatarPicker"
import { resolveAvatarSrc } from "@/lib/avatars"
import { useMe, useMyListings } from "@/lib/queries/hooks"
import { useDeleteListing, useUpdateAvatar } from "@/lib/queries/mutations"
import { MyListingCardSkeleton } from "./ProjectCardSkeleton"
import MyListingCard from "./MyListingCard"
import type { Listing } from "@/lib/queries/types"

function computeStats(listings: Listing[]) {
    return {
        listings: listings.length,
        upvotes: listings.reduce((sum, l) => sum + l.upvotes, 0),
    }
}

function listingsSub(count: number): string {
    if (count === 0) return "Ship your first project"
    if (count <= 2) return "Off to a great start"
    if (count <= 5) return "Building momentum"
    if (count <= 9) return "Prolific builder"
    return "Unstoppable"
}

function upvotesSub(count: number): string {
    if (count === 0) return "No votes yet, share your work"
    if (count < 10) return "Dedication level: Rising"
    if (count < 25) return "Dedication level: Good"
    if (count < 50) return "Dedication level: Great"
    if (count < 100) return "Dedication level: Elite"
    return "Dedication level: Legendary"
}

const statCards = [
    { key: "listings", label: "Listings", icon: Layers, color: "#E93545", sub: listingsSub },
    { key: "upvotes", label: "Upvotes", icon: ArrowBigUp, color: "#3559E9", sub: upvotesSub },
] as const

function StatCard({ label, icon: Icon, color, sub, value }: {
    label: string
    icon: typeof Layers
    color: string
    sub: string
    value: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-2xl border border-[var(--paper-border)] bg-[var(--paper-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)] sm:p-6"
        >
            <div
                className="pointer-events-none absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${color}1A, transparent 55%)` }}
            />
            <Icon
                className="pointer-events-none absolute -bottom-5 -right-5 h-28 w-28 opacity-[0.07] transition-transform duration-300 group-hover:scale-110"
                style={{ color }}
            />
            <div className="relative">
                <div
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] shadow-sm"
                    style={{ backgroundColor: color }}
                >
                    <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="mt-4 text-5xl font-semibold tracking-tight tabular-nums text-[var(--paper-ink)]">
                    {value.toLocaleString()}
                </p>
                <p className="mt-1.5 text-sm font-semibold" style={{ color }}>{label}</p>
                <p className="mt-1 text-xs text-[var(--paper-muted)]">{sub}</p>
            </div>
        </motion.div>
    )
}

const Page = () => {
    const { data: user, isFetched } = useMe()
    const { data, isLoading } = useMyListings()
    const deleteListing = useDeleteListing()
    const updateAvatar = useUpdateAvatar()
    const [editing, setEditing] = useState<Listing | null>(null)
    const [editOpen, setEditOpen] = useState(false)
    const [pickerOpen, setPickerOpen] = useState(false)
    const router = useRouter()

    // Fallback for an expired or invalid token: the API says logged out
    useEffect(() => {
        if (isFetched && !user) {
            toast.error("Please log in to continue", { id: "auth-notice" })
            router.replace("/signin")
        }
    }, [isFetched, user, router])

    if (isFetched && !user) return null

    const listings = data?.listings ?? []
    const stats = computeStats(listings)

    const avatarSeed = user?.email ?? user?.fullName ?? "showhunt"
    const avatarSrc = resolveAvatarSrc(user?.avatarUrl, avatarSeed)
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
                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-[var(--paper-surface)] ring-2 ring-[var(--paper-border)]">
                    {isFetched ? (
                        <Image
                            src={avatarSrc}
                            alt={user?.fullName ? `${user.fullName} avatar` : "Avatar"}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
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
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--paper-border)] bg-white text-[var(--paper-muted)] shadow-sm transition-colors hover:border-[#DA5CC7]/50 hover:bg-[var(--paper-accent-soft)] hover:text-[#DA5CC7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40"
                >
                    <Pencil size={14} />
                </button>
            </div>

            <div className="flex-1">
                <h1 className="text-3xl font-semibold tracking-tight text-[#DA5CC7]">{user?.fullName ?? ''}</h1>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--paper-muted)]">
                    <span className="flex items-center gap-2">
                        <User size={16} />
                        Joined {formattedDate}
                    </span>
                </div>
            </div>
            <UploadProject />
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-8">
            {statCards.map(({ key, label, icon, color, sub }) => (
                <StatCard key={key} label={label} icon={icon} color={color} sub={sub(stats[key])} value={stats[key]} />
            ))}
        </div>

        <div className="px-5 py-8 sm:px-8 sm:py-10">
            <h2 className="pb-4 text-2xl font-semibold tracking-tight text-[#DA5CC7] sm:text-3xl">Your Listings</h2>
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
