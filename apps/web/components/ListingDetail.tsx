"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Apple,
    ArrowBigUp,
    ArrowLeft,
    Flame,
    Github,
    Globe,
    Link as LinkIcon,
    Play,
    SquareArrowOutUpRight,
    Twitter,
    Youtube,
} from "lucide-react"
import { motion } from "motion/react"
import AppShell from "@/components/AppShell"
import { useListings, useMe } from "@/lib/queries/hooks"
import { useListingsMutations } from "@/lib/queries/mutations"
import { listingsKey } from "@/lib/queries/keys"
import type { ComponentType } from "react"

const PLATFORM_META: Record<string, { label: string; icon: ComponentType<{ className?: string }> }> = {
    WEBSITE: { label: "Website", icon: Globe },
    GITHUB: { label: "GitHub", icon: Github },
    PLAY_STORE: { label: "Play Store", icon: Play },
    APP_STORE: { label: "App Store", icon: Apple },
    X_TWITTER: { label: "X (Twitter)", icon: Twitter },
    PRODUCT_HUNT: { label: "Product Hunt", icon: Flame },
    YOUTUBE: { label: "YouTube", icon: Youtube },
    OTHER: { label: "Link", icon: LinkIcon },
}

function youtubeEmbedUrl(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/)
    return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null
}
export default function ListingDetail() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const { data, isLoading } = useListings()
    const { data: user } = useMe()
    const { upvote } = useListingsMutations(listingsKey())

    const listing = data?.listings.find((l) => l.id === params?.id)
    const isAuthenticated = !!user

    const guardAction = (action: () => void) => {
        if (!isAuthenticated) {
            toast.error("Please log in to upvote listings")
            router.push("/signin")
            return
        }
        action()
    }

    if (isLoading) {
        return (
            <AppShell>
                <div className="px-5 pb-10 pt-4 sm:px-8 sm:pt-5">
                    <p className="text-sm text-[var(--paper-muted)]">Loading listing...</p>
                </div>
            </AppShell>
        )
    }

    if (!listing) {
        return (
            <AppShell>
                <div className="px-5 pb-10 pt-4 sm:px-8 sm:pt-5">
                    <p className="text-sm text-[var(--paper-muted)]">Listing not found.</p>
                    <Link
                        href="/listings"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#DA5CC7] transition-colors hover:text-[#C431AE]"
                    >
                        <ArrowLeft size={16} />
                        Back to listings
                    </Link>
                </div>
            </AppShell>
        )
    }

    const primaryLink =
        listing.links.find((l) => l.platform === "WEBSITE")?.url ??
        listing.links[0]?.url ??
        null
    return (
        <AppShell>
            <div className="px-5 pb-10 pt-4 sm:px-8 sm:pt-5">
            <Link
                href="/listings"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--paper-muted)] transition-colors hover:text-[var(--paper-ink)]"
            >
                <ArrowLeft size={16} />
                Back to listings
            </Link>

            <div className="mt-4 rounded-2xl bg-[var(--paper-surface)] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--paper-border)]">
                            <Image
                                src={listing.logoUrl}
                                alt={listing.name}
                                width={56}
                                height={56}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="min-w-0">
                            {primaryLink ? (
                                <a
                                    href={primaryLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/link inline-flex items-center gap-1.5 text-xl font-semibold text-[var(--paper-ink)] transition-colors hover:text-[#DA5CC7]"
                                >
                                    {listing.name}
                                    <SquareArrowOutUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover/link:opacity-100" />
                                </a>
                            ) : (
                                <h1 className="text-xl font-semibold text-[var(--paper-ink)]">{listing.name}</h1>
                            )}
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--paper-muted)]">
                                {listing.tags.map((tag) => (
                                    <span key={tag} className="inline-flex items-center gap-1.5">
                                        <span className="h-1 w-1 rounded-full bg-[var(--paper-muted)]" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                        onClick={() => guardAction(() => upvote.mutate(listing.id))}
                        aria-label="Upvote"
                        className={`flex shrink-0 flex-col items-center justify-center w-14 h-14 rounded-[8px] border cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40 ${
                            listing.hasUpvoted
                                ? "border-[#DA5CC7] bg-[var(--paper-accent-soft)] text-[#DA5CC7]"
                                : "border-[var(--paper-border)] text-[var(--paper-muted)] hover:border-[#DA5CC7]/50 hover:bg-[var(--paper-accent-soft)]"
                        }`}
                    >
                        <ArrowBigUp className={`h-4 w-4 ${listing.hasUpvoted ? "fill-current" : ""}`} />
                        <span className="mt-0.5 text-xs font-medium tabular-nums">{listing.upvotes}</span>
                    </motion.button>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[var(--paper-muted)] sm:text-[15px]">
                    {listing.description}
                </p>
                {listing.createdAt && (
                    <p className="mt-3 text-xs text-[var(--paper-muted)]">
                        Launched{' '}
                        {new Date(listing.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                        {listing.user?.fullName ? ` by ${listing.user.fullName}` : ''}
                    </p>
                )}

                {listing.photos.length > 0 && (
                    <div className="mt-6 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {listing.photos.map((url, index) => (
                            <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0"
                            >
                                <Image
                                    src={url}
                                    alt={`${listing.name} screenshot ${index + 1}`}
                                    width={280}
                                    height={160}
                                    className="h-40 w-auto rounded-xl border border-[var(--paper-border)] object-cover"
                                />
                            </a>
                        ))}
                    </div>
                )}

                {listing.videoUrl &&
                    (youtubeEmbedUrl(listing.videoUrl) ? (
                        <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl border border-[var(--paper-border)]">
                            <iframe
                                src={youtubeEmbedUrl(listing.videoUrl)!}
                                title={`${listing.name} video`}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <video
                            src={listing.videoUrl}
                            controls
                            className="mt-6 w-full rounded-xl border border-[var(--paper-border)]"
                        />
                    ))}

                {listing.links.length > 0 && (
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                        {listing.links.map((link) => {
                            const meta = PLATFORM_META[link.platform] ?? PLATFORM_META.OTHER
                            const Icon = meta.icon
                            return (
                                <a
                                    key={link.platform + link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/link inline-flex items-center gap-1.5 rounded-full border border-[var(--paper-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--paper-muted)] transition-colors hover:border-[#DA5CC7]/50 hover:text-[#DA5CC7]"
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {meta.label}
                                    <SquareArrowOutUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover/link:opacity-100" />
                                </a>
                            )
                        })}
                    </div>
                )}
            </div>
            </div>
        </AppShell>
    )
}
