"use client"

import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState, type ComponentType, type FormEvent } from "react"
import { toast } from "sonner"
import {
    Apple,
    ArrowBigUp,
    ArrowLeft,
    Flame,
    Github,
    Globe,
    Link as LinkIcon,
    MessageSquare,
    Play,
    SquareArrowOutUpRight,
    Twitter,
    Youtube,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import AppShell from "@/components/AppShell"
import ListingDetailSkeleton from "@/components/ListingDetailSkeleton"
import { apiErrorMessage } from "@/lib/api"
import { authFieldClass } from "@/lib/auth-field"
import { resolveAvatarSrc } from "@/lib/avatars"
import { useComments, useListing, useMe } from "@/lib/queries/hooks"
import { useCreateComment, useListingUpvote } from "@/lib/queries/mutations"
import type { Listing, ListingComment } from "@/lib/queries/types"
import { cn } from "@/lib/utils"

const COMMENT_MAX = 500

const PLATFORM_META: Record<
    string,
    { label: string; icon: ComponentType<{ className?: string }> }
> = {
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

function formatRelativeTime(value: string | Date): string {
    const date = new Date(value)
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    })
}

type MediaItem =
    | { type: "video"; url: string; embed: string | null }
    | { type: "photo"; url: string; index: number }

function buildMediaItems(listing: Listing): MediaItem[] {
    const items: MediaItem[] = []
    if (listing.videoUrl) {
        items.push({
            type: "video",
            url: listing.videoUrl,
            embed: youtubeEmbedUrl(listing.videoUrl),
        })
    }
    listing.photos.forEach((url, index) => {
        items.push({ type: "photo", url, index })
    })
    return items
}

function MediaGallery({ listing }: { listing: Listing }) {
    const media = useMemo(() => buildMediaItems(listing), [listing])
    const [active, setActive] = useState(0)

    useEffect(() => {
        setActive(0)
    }, [listing.id])

    if (media.length === 0) return null

    const current = media[Math.min(active, media.length - 1)]!

    return (
        <div className="overflow-hidden rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)]">
            <div className="relative aspect-video bg-[#F3F3F5]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${current.type}-${current.url}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0"
                    >
                        {current.type === "video" ? (
                            current.embed ? (
                                <iframe
                                    src={current.embed}
                                    title={`${listing.name} video`}
                                    className="h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <video
                                    src={current.url}
                                    controls
                                    className="h-full w-full object-contain"
                                />
                            )
                        ) : (
                            <a
                                href={current.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative block h-full w-full"
                            >
                                <Image
                                    src={current.url}
                                    alt={`${listing.name} screenshot ${current.index + 1}`}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 1024px) 100vw, 720px"
                                />
                            </a>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {media.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {media.map((item, index) => {
                        const selected = index === active
                        return (
                            <button
                                key={`${item.type}-${item.url}`}
                                type="button"
                                onClick={() => setActive(index)}
                                aria-label={
                                    item.type === "video"
                                        ? "Show video"
                                        : `Show screenshot ${item.index + 1}`
                                }
                                className={cn(
                                    "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40",
                                    selected
                                        ? "border-[#DA5CC7] ring-2 ring-[#DA5CC7]/25"
                                        : "border-[var(--paper-border)] hover:border-[#DA5CC7]/40"
                                )}
                            >
                                {item.type === "video" ? (
                                    <div className="flex h-full w-full items-center justify-center bg-[#1a1a1c] text-white">
                                        <Play className="h-5 w-5 fill-current" />
                                    </div>
                                ) : (
                                    <Image
                                        src={item.url}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

function CommentComposer({
    listingId,
    user,
    onRequireAuth,
}: {
    listingId: string
    user: { fullName: string; email: string; avatarUrl: string | null } | undefined
    onRequireAuth: () => void
}) {
    const [content, setContent] = useState("")
    const createComment = useCreateComment(listingId)
    const remaining = COMMENT_MAX - content.length
    const overLimit = remaining < 0

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        if (!user) {
            onRequireAuth()
            return
        }
        const trimmed = content.trim()
        if (!trimmed) return
        if (overLimit) {
            toast.error(`Comment is ${Math.abs(remaining)} characters over the limit`)
            return
        }
        try {
            await createComment.mutateAsync(trimmed)
            setContent("")
        } catch (err) {
            toast.error(apiErrorMessage(err, "Failed to post comment"))
        }
    }

    return (
        <form onSubmit={submit} className="flex gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[var(--paper-border)] bg-[#F3F3F5]">
                {user ? (
                    <Image
                        src={resolveAvatarSrc(user.avatarUrl, user.email)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--paper-muted)]">
                        <MessageSquare className="h-4 w-4" />
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[var(--paper-ink)]">Your comment</span>
                    <span
                        className={cn(
                            "text-xs tabular-nums",
                            overLimit
                                ? "font-medium text-red-600"
                                : "text-[var(--paper-muted)]"
                        )}
                    >
                        {remaining} left
                    </span>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={user ? "What do you think?" : "Sign in to join the discussion"}
                    rows={3}
                    className={cn(authFieldClass, "h-auto min-h-[5rem] resize-none py-2.5")}
                />
                <div className="mt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={!content.trim() || createComment.isPending || overLimit}
                        className="inline-flex h-9 cursor-pointer items-center rounded-[8px] bg-[#1a1a1c] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {createComment.isPending ? "Posting…" : "Comment"}
                    </button>
                </div>
            </div>
        </form>
    )
}

function CommentItem({ comment }: { comment: ListingComment }) {
    const avatar = resolveAvatarSrc(comment.user.avatarUrl, comment.user.email)
    return (
        <article className="flex gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[var(--paper-border)]">
                <Image src={avatar} alt="" fill className="object-cover" sizes="40px" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-semibold text-[var(--paper-ink)]">
                        {comment.user.fullName}
                    </span>
                    <time
                        dateTime={new Date(comment.createdAt).toISOString()}
                        className="text-xs text-[var(--paper-muted)]"
                    >
                        {formatRelativeTime(comment.createdAt)}
                    </time>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--paper-muted)]">
                    {comment.content}
                </p>
            </div>
        </article>
    )
}

function ListingDetailContent({ listing }: { listing: Listing }) {
    const router = useRouter()
    const { data: user } = useMe()
    const { data: comments, isLoading: commentsLoading } = useComments(listing.id)
    const upvote = useListingUpvote(listing.id)

    const requireAuth = (message: string) => {
        toast.error(message)
        router.push("/signin")
    }

    const handleUpvote = () => {
        if (!user) {
            requireAuth("Please log in to upvote listings")
            return
        }
        upvote.mutate()
    }

    return (
        <div className="px-5 pb-12 pt-4 sm:px-8 sm:pt-5">
            <button
                type="button"
                onClick={() => router.push("/listings")}
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--paper-muted)] transition-colors hover:text-[var(--paper-ink)]"
            >
                <ArrowLeft size={16} />
                Back to listings
            </button>

            {/* Hero */}
            <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] p-5 sm:p-7"
            >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[var(--paper-border)] sm:h-20 sm:w-20">
                            <Image
                                src={listing.logoUrl}
                                alt={listing.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                                priority
                            />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-semibold tracking-tight text-[var(--paper-ink)] sm:text-[1.75rem]">
                                {listing.name}
                            </h1>
                            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--paper-muted)] sm:text-[15px]">
                                {listing.description}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                {listing.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-[8px] border border-[var(--paper-border)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--paper-muted)]"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {listing.isOpenSource && (
                                    <span className="inline-flex items-center gap-1 rounded-[8px] border border-[#1CB061]/30 bg-[#1CB061]/10 px-2.5 py-1 text-xs font-medium text-[#1CB061]">
                                        <Github className="h-3 w-3" />
                                        Open source
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                        onClick={handleUpvote}
                        aria-label="Upvote"
                        disabled={upvote.isPending}
                        className={cn(
                            "flex h-14 w-14 shrink-0 cursor-pointer flex-col items-center justify-center self-start rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40",
                            listing.hasUpvoted
                                ? "border-[#DA5CC7] bg-[var(--paper-accent-soft)] text-[#DA5CC7]"
                                : "border-[var(--paper-border)] text-[var(--paper-muted)] hover:border-[#DA5CC7]/50 hover:bg-[var(--paper-accent-soft)]"
                        )}
                    >
                        <ArrowBigUp
                            className={cn("h-5 w-5", listing.hasUpvoted && "fill-current")}
                        />
                        <span className="mt-0.5 text-xs font-semibold tabular-nums">
                            {listing.upvotes}
                        </span>
                    </motion.button>
                </div>
            </motion.section>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="min-w-0 space-y-6">
                    <MediaGallery listing={listing} />


                    <section
                        id="discussion"
                        className="rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] p-5 sm:p-6"
                    >
                        <h2 className="text-base font-semibold text-[var(--paper-ink)]">
                            Discussion
                            <span className="ml-2 text-sm font-normal text-[var(--paper-muted)]">
                                ({listing.comments})
                            </span>
                        </h2>

                        <div className="mt-5">
                            <CommentComposer
                                listingId={listing.id}
                                user={user}
                                onRequireAuth={() =>
                                    requireAuth("Please log in to comment")
                                }
                            />
                        </div>

                        <div className="mt-6 space-y-5 border-t border-[var(--paper-border)] pt-5">
                            {commentsLoading ? (
                                <p className="text-sm text-[var(--paper-muted)]">
                                    Loading comments…
                                </p>
                            ) : comments && comments.length > 0 ? (
                                comments.map((comment) => (
                                    <CommentItem key={comment.id} comment={comment} />
                                ))
                            ) : (
                                <p className="py-4 text-center text-sm text-[var(--paper-muted)]">
                                    No comments yet. Be the first to share your thoughts.
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                    {(listing.links.length > 0 || listing.repoUrl) && (
                        <section
                            className="rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] p-5"
                        >
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#E93545]">
                                Links
                            </h2>
                            <ul className="mt-3 space-y-1.5">
                                {listing.links.map((link) => {
                                    const meta =
                                        PLATFORM_META[link.platform] ?? PLATFORM_META.OTHER
                                    const Icon = meta.icon
                                    return (
                                        <li key={link.platform + link.url}>
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group/link flex items-center gap-2.5 rounded-[8px] px-2.5 py-2.5 text-sm text-[var(--paper-ink)] transition-colors hover:bg-[var(--paper-accent-soft)] hover:text-[#C431AE]"
                                            >
                                                <Icon className="h-4 w-4 shrink-0 text-[var(--paper-muted)] transition-colors group-hover/link:text-[#DA5CC7]" />
                                                <span className="min-w-0 flex-1 truncate font-medium">
                                                    {meta.label}
                                                </span>
                                                <SquareArrowOutUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100" />
                                            </a>
                                        </li>
                                    )
                                })}
                                {listing.repoUrl &&
                                    !listing.links.some(
                                        (l) =>
                                            l.platform === "GITHUB" &&
                                            l.url === listing.repoUrl
                                    ) && (
                                        <li>
                                            <a
                                                href={listing.repoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group/link flex items-center gap-2.5 rounded-[8px] px-2.5 py-2.5 text-sm text-[var(--paper-ink)] transition-colors hover:bg-[var(--paper-accent-soft)] hover:text-[#C431AE]"
                                            >
                                                <Github className="h-4 w-4 shrink-0 text-[var(--paper-muted)] transition-colors group-hover/link:text-[#DA5CC7]" />
                                                <span className="min-w-0 flex-1 truncate font-medium">
                                                    Repository
                                                </span>
                                                <SquareArrowOutUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100" />
                                            </a>
                                        </li>
                                    )}
                            </ul>
                        </section>
                    )}

                    <section
                        className="rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] p-5"
                    >
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#3559E9]">
                            Maker
                        </h2>
                        <div className="mt-4">
                            <p className="text-sm font-semibold text-[var(--paper-ink)]">
                                {listing.user?.fullName ?? "Unknown"}
                            </p>
                            {listing.createdAt && (
                                <p className="mt-1 text-xs text-[var(--paper-muted)]">
                                    Launched{" "}
                                    {new Date(listing.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            )}
                        </div>
                    </section>

                    {listing.tags.length > 0 && (
                        <section
                            className="rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] p-5"
                        >
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#1CB061]">
                                Topics
                            </h2>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {listing.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-[8px] border border-[var(--paper-border)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--paper-muted)]"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </aside>
            </div>
        </div>
    )
}

export default function ListingDetail() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const id = params?.id
    const { data: listing, isLoading, isError } = useListing(id)

    return (
        <AppShell>
            {isLoading ? (
                <ListingDetailSkeleton />
            ) : isError || !listing ? (
                <div className="px-5 pb-10 pt-4 sm:px-8 sm:pt-5">
                    <p className="text-sm text-[var(--paper-muted)]">Listing not found.</p>
                    <button
                        type="button"
                        onClick={() => router.push("/listings")}
                        className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#DA5CC7] transition-colors hover:text-[#C431AE]"
                    >
                        <ArrowLeft size={16} />
                        Back to listings
                    </button>
                </div>
            ) : (
                <ListingDetailContent listing={listing} />
            )}
        </AppShell>
    )
}
