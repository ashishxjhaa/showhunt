"use client"

import Image from "next/image"
import { createPortal } from "react-dom"
import { AVATAR_PATHS } from "@/lib/avatars"
import { useModalBehavior } from "@/lib/use-modal"

interface AvatarPickerProps {
    open: boolean
    currentUrl: string | null
    saving: boolean
    onSelect: (url: string) => void
    onClose: () => void
}

export default function AvatarPicker({
    open,
    currentUrl,
    saving,
    onSelect,
    onClose,
}: AvatarPickerProps) {
    useModalBehavior(open, onClose)

    if (!open) return null

    return createPortal(
        <div
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="auth-card max-h-[min(90vh,640px)] w-full max-w-lg overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="auth-card-header">
                    <h3 className="text-lg font-semibold text-[var(--paper-ink)]">Choose your avatar</h3>
                    <p className="mt-1 text-sm text-[var(--paper-muted)]">
                        Pick a look that feels like you. You can change it anytime.
                    </p>
                </div>

                <div className="auth-card-body">
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                        {AVATAR_PATHS.map((url, index) => {
                            const selected = currentUrl === url
                            return (
                                <button
                                    key={url}
                                    type="button"
                                    disabled={saving}
                                    onClick={() => onSelect(url)}
                                    title={`Avatar ${index + 1}`}
                                    className={`relative aspect-square overflow-hidden rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40 disabled:cursor-wait disabled:opacity-60 ${
                                        selected
                                            ? "border-[#DA5CC7] ring-2 ring-[#DA5CC7]/40"
                                            : "border-[var(--paper-border)] hover:scale-105 hover:border-[#DA5CC7]/50"
                                    }`}
                                >
                                    <Image
                                        src={url}
                                        alt={`Avatar option ${index + 1}`}
                                        width={96}
                                        height={96}
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
