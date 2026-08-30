"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createPortal } from "react-dom"
import { ArrowBigUp, CalendarDays, Github, Pencil, SquareArrowOutUpRight, Trash2, TriangleAlert } from "lucide-react"
import { authFieldClass } from "@/lib/auth-field"
import { useModalBehavior } from "@/lib/use-modal"
import type { Listing } from "@/lib/queries/types"

interface MyListingCardProps {
    listing: Listing
    onEdit: (listing: Listing) => void
    onDelete: (id: string) => void
    deleting?: boolean
}

const actionButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--paper-border)] text-[var(--paper-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40"

export default function MyListingCard({ listing, onEdit, onDelete, deleting }: MyListingCardProps) {
    const router = useRouter()
    const [deleteOpen, setDeleteOpen] = useState(false)

    const createdLabel = listing.createdAt
        ? new Date(listing.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : null

    return (
        <div
            className="group/card relative cursor-pointer overflow-hidden rounded-2xl bg-[var(--paper-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#F7F7F8]"
            onClick={() => router.push(`/listings/${listing.id}`)}
        >
            <div className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--paper-border)]">
                    <Image
                        src={listing.logoUrl}
                        alt={listing.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="inline-flex items-center gap-1 font-semibold text-[var(--paper-ink)] transition-colors group-hover/card:text-[#DA5CC7]">
                            {listing.name}
                            <SquareArrowOutUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover/card:opacity-100" />
                        </h3>
                        {listing.isOpenSource && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--paper-border)] px-2 py-0.5 text-[11px] font-medium text-[var(--paper-muted)]">
                                <Github className="h-3 w-3" />
                                Open Source
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-[var(--paper-muted)]">
                        {listing.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--paper-muted)]">
                        {listing.tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1.5">
                                <span className="h-1 w-1 rounded-full bg-[var(--paper-muted)]" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[var(--paper-border)] px-4 py-2.5 sm:px-5">
                <div className="flex items-center gap-4 text-xs text-[var(--paper-muted)]">
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <ArrowBigUp className="h-3.5 w-3.5" />
                        {listing.upvotes} vote{listing.upvotes !== 1 ? "s" : ""}
                    </span>
                    {createdLabel && (
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {createdLabel}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => onEdit(listing)}
                        aria-label={`Edit ${listing.name}`}
                        title="Edit listing"
                        className={`${actionButtonClass} cursor-pointer hover:border-[#DA5CC7]/50 hover:bg-[var(--paper-accent-soft)] hover:text-[#DA5CC7]`}
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeleteOpen(true)}
                        aria-label={`Delete ${listing.name}`}
                        title="Delete listing"
                        className={`${actionButtonClass} cursor-pointer hover:border-red-200 hover:bg-red-50 hover:text-red-600`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <DeleteListingModal
                open={deleteOpen}
                listingName={listing.name}
                deleting={deleting ?? false}
                onConfirm={() => onDelete(listing.id)}
                onClose={() => setDeleteOpen(false)}
            />
        </div>
    )
}

interface DeleteListingModalProps {
    open: boolean
    listingName: string
    deleting: boolean
    onConfirm: () => void
    onClose: () => void
}

function DeleteListingModal({ open, listingName, deleting, onConfirm, onClose }: DeleteListingModalProps) {
    const [confirmText, setConfirmText] = useState("")
    const handleClose = () => {
        setConfirmText("")
        onClose()
    }
    useModalBehavior(open, handleClose)

    if (!open) return null

    const matches = confirmText.trim() === listingName

    return createPortal(
        <div
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                className="auth-card w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="auth-card-header">
                    <h3 className="text-lg font-semibold text-[var(--paper-ink)]">Delete project</h3>
                    <p className="mt-1 text-sm text-[var(--paper-muted)]">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="auth-card-body flex flex-col gap-4">
                    <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                            This will permanently delete <span className="font-semibold">{listingName}</span>, its media, links, and all votes.
                        </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="delete-confirm" className="text-sm text-[var(--paper-muted)]">
                            Type <span className="font-semibold text-[var(--paper-ink)]">{listingName}</span> to confirm
                        </label>
                        <input
                            id="delete-confirm"
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={listingName}
                            autoFocus
                            autoComplete="off"
                            spellCheck={false}
                            className={authFieldClass}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="h-10 cursor-pointer rounded-[8px] border border-[var(--paper-border)] px-4 text-sm text-[var(--paper-muted)] transition-colors hover:bg-black/5 hover:text-[var(--paper-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={!matches || deleting}
                            onClick={onConfirm}
                            className="h-10 cursor-pointer rounded-[8px] bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {deleting ? "Deleting..." : "Delete my project"}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
