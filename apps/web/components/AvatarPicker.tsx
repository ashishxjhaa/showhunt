"use client"

import { createPortal } from "react-dom"
import { useMemo } from "react"
import {
    AVATAR_SEEDS,
    createAvatarDataUri,
    toAvatarId,
} from "@/lib/avatars"
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

    const previews = useMemo(
        () =>
            AVATAR_SEEDS.map((seed) => ({
                seed,
                id: toAvatarId(seed),
                src: createAvatarDataUri(seed, 96),
            })),
        []
    )

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
                    <h3 className="text-lg font-semibold text-[var(--paper-ink)]">
                        Choose your avatar
                    </h3>
                    <p className="mt-1 text-sm text-[var(--paper-muted)]">
                        Animated Gaze characters — pick the one that feels like you.
                    </p>
                </div>

                <div className="auth-card-body">
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                        {previews.map(({ seed, id, src }, index) => {
                            const selected = currentUrl === id
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    disabled={saving}
                                    onClick={() => onSelect(id)}
                                    title={`Avatar ${index + 1}`}
                                    className={`relative aspect-square cursor-pointer overflow-hidden rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E93545]/40 disabled:cursor-wait disabled:opacity-60 ${
                                        selected
                                            ? "ring-2 ring-[#E93545]"
                                            : "hover:ring-2 hover:ring-[#E93545]/50"
                                    }`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={src}
                                        alt={`Avatar option ${index + 1}`}
                                        width={96}
                                        height={96}
                                        className="h-full w-full object-cover"
                                        draggable={false}
                                    />
                                    <span className="sr-only">{seed}</span>
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
