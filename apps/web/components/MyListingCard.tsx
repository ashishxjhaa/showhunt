"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowBigUp, CalendarDays, Github, Pencil, SquareArrowOutUpRight, Trash2, TriangleAlert } from "lucide-react"
import {
    Dialog,
    DialogCancel,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { isListingNavSuppressed, suppressListingNav } from "@/lib/suppress-listing-nav"
import type { Listing } from "@/lib/queries/types"

interface MyListingCardProps {
    listing: Listing
    onEdit: (listing: Listing) => void
    onDelete: (id: string) => void
    deleting?: boolean
    /** Controlled delete dialog; when set with onDeleteOpenChange, parent owns open state. */
    deleteOpen?: boolean
    onDeleteOpenChange?: (open: boolean) => void
    confirmText?: string
    onConfirmTextChange?: (text: string) => void
}

const actionButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--paper-border)] text-[var(--paper-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40"

export default function MyListingCard({
    listing,
    onEdit,
    onDelete,
    deleting,
    deleteOpen: deleteOpenProp,
    onDeleteOpenChange,
    confirmText: confirmTextProp,
    onConfirmTextChange,
}: MyListingCardProps) {
    const router = useRouter()
    const [deleteOpenLocal, setDeleteOpenLocal] = useState(false)
    const [confirmTextLocal, setConfirmTextLocal] = useState("")

    const controlled = onDeleteOpenChange != null
    const deleteOpen = controlled ? Boolean(deleteOpenProp) : deleteOpenLocal
    const confirmText = onConfirmTextChange != null ? (confirmTextProp ?? "") : confirmTextLocal

    const createdLabel = listing.createdAt
        ? new Date(listing.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : null

    const matches = confirmText.trim() === listing.name

    const handleOpenChange = (open: boolean) => {
        if (controlled) {
            onDeleteOpenChange?.(open)
        } else {
            setDeleteOpenLocal(open)
            if (!open) setConfirmTextLocal("")
        }
        if (!open) {
            suppressListingNav()
        }
    }

    const setConfirmText = (text: string) => {
        if (onConfirmTextChange) onConfirmTextChange(text)
        else setConfirmTextLocal(text)
    }

    return (
        <div
            className="group/card relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--paper-border)] bg-[var(--paper-surface)] transition-colors hover:bg-[#F7F7F8]"
            onClick={() => {
                if (isListingNavSuppressed()) return
                router.push(`/listings/${listing.id}`)
            }}
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
                            <span className="inline-flex items-center gap-1 rounded-[8px] border border-[#1CB061]/30 bg-[#1CB061]/10 px-2.5 py-1 text-xs font-medium text-[#1CB061]">
                                <Github className="h-3 w-3" />
                                Open source
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
                        onClick={() => handleOpenChange(true)}
                        aria-label={`Delete ${listing.name}`}
                        title="Delete listing"
                        className={`${actionButtonClass} cursor-pointer hover:border-red-200 hover:bg-red-50 hover:text-red-600`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <Dialog open={deleteOpen} onOpenChange={handleOpenChange}>
                <DialogContent onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle>Delete project</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                            This will permanently delete{" "}
                            <span className="font-semibold">{listing.name}</span>, its media,
                            links, and all votes.
                        </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor={`delete-confirm-${listing.id}`} className="text-sm text-[var(--paper-muted)]">
                            Type{" "}
                            <span className="font-semibold text-[var(--paper-ink)]">
                                {listing.name}
                            </span>{" "}
                            to confirm
                        </label>
                        <Input
                            id={`delete-confirm-${listing.id}`}
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={listing.name}
                            autoComplete="off"
                            spellCheck={false}
                            className="h-10 border-[var(--paper-border)] bg-white text-[var(--paper-ink)]"
                        />
                    </div>

                    <DialogFooter>
                        <DialogCancel disabled={deleting}>Cancel</DialogCancel>
                        <Button
                            type="button"
                            disabled={!matches || deleting}
                            onClick={() => onDelete(listing.id)}
                            className="cursor-pointer bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300 disabled:cursor-not-allowed"
                        >
                            {deleting ? "Deleting..." : "Delete my project"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
