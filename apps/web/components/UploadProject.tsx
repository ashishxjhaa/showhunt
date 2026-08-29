'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Film, Images, Plus, Sparkles, Upload, X } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { useMe, useTags } from '@/lib/queries/hooks'
import {
    useEnrichListing,
    useUpdateListing,
    useUploadListing,
} from '@/lib/queries/mutations'
import type { Listing } from '@/lib/queries/types'
import { UPLOAD_LIMITS_MB, uploadFile, validateFileType } from '@/lib/upload'
import { authFieldClass } from '@/lib/auth-field'
import { cn } from '@/lib/utils'

const FALLBACK_TAGS = [
    'SaaS',
    'Productivity',
    'AI',
    'Fintech',
    'E-commerce',
    'Open Source',
    'Dev Tools',
    'Social',
    'Design',
    'Education',
    'Gaming',
    'Crypto',
    'Hardware',
    'Health & Fitness',
    'Others',
]
const MAX_PHOTOS = 5
const MAX_DESCRIPTION_LENGTH = 100

interface UploadProjectProps {
    /** When set, the modal edits this listing instead of creating a new one. */
    listing?: Listing | null
    /** Custom trigger content. Pass null to render no trigger (controlled use). */
    trigger?: ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

function UploadProject({ listing, trigger, open: openProp, onOpenChange }: UploadProjectProps) {
    const [mounted, setMounted] = useState(false)
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const isControlled = openProp !== undefined
    const open = isControlled ? !!openProp : uncontrolledOpen
    const setOpen = (value: boolean) => {
        if (!isControlled) setUncontrolledOpen(value)
        onOpenChange?.(value)
    }

    const isEdit = !!listing
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [link, setLink] = useState('')
    const [logo, setLogo] = useState('')
    const [logoFileName, setLogoFileName] = useState('')
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [photos, setPhotos] = useState<string[]>([])
    const [uploadingPhotos, setUploadingPhotos] = useState(false)
    const [video, setVideo] = useState('')
    const [videoFileName, setVideoFileName] = useState('')
    const [uploadingVideo, setUploadingVideo] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const photoInputRef = useRef<HTMLInputElement>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)
    const { data: user } = useMe()
    const { data: serverTags } = useTags()
    const tagOptions = serverTags ?? FALLBACK_TAGS
    const uploadListing = useUploadListing()
    const updateListing = useUpdateListing()
    const enrich = useEnrichListing()

    const closeModal = () => setOpen(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Hydrate the form each time the modal opens: from the listing when
    // editing, or blank when creating.
    useEffect(() => {
        if (!open) return
        if (listing) {
            setName(listing.name)
            setDescription(listing.description)
            setLink(
                listing.links.find((l) => l.platform === 'WEBSITE')?.url ??
                    listing.links[0]?.url ??
                    ''
            )
            setLogo(listing.logoUrl)
            setLogoFileName('Current logo')
            setSelectedTags(listing.tags)
            setPhotos(listing.photos)
            setVideo(listing.videoUrl ?? '')
            setVideoFileName(listing.videoUrl ? 'Current video' : '')
        } else {
            setName('')
            setDescription('')
            setLink('')
            setLogo('')
            setLogoFileName('')
            setSelectedTags([])
            setPhotos([])
            setVideo('')
            setVideoFileName('')
        }
    }, [open, listing])

    useEffect(() => {
        if (!open) return

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal()
        }

        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.body.style.overflow = ''
            document.removeEventListener('keydown', handleEscape)
        }
    }, [open])

    const uploadOne = async (file: File, kind: 'logo' | 'photo' | 'video') => {
        if (!validateFileType(file, kind)) {
            toast.error(
                kind === 'video'
                    ? 'Video must be an MP4, WebM or MOV file'
                    : 'File must be a PNG, JPG, WebP or SVG image'
            )
            return null
        }
        if (file.size > UPLOAD_LIMITS_MB[kind] * 1024 * 1024) {
            toast.error(`File must be under ${UPLOAD_LIMITS_MB[kind]}MB`)
            return null
        }
        return uploadFile(file, kind)
    }

    const handleFileChange = async (file: File | undefined) => {
        if (!file) return

        setLogoFileName(file.name)
        setUploadingLogo(true)
        try {
            const publicUrl = await uploadOne(file, 'logo')
            if (publicUrl) setLogo(publicUrl)
            else setLogoFileName('')
        } catch (error) {
            console.log(error)
            setLogoFileName('')
            toast.error('Failed to upload logo')
        } finally {
            setUploadingLogo(false)
        }
    }

    const handlePhotosChange = async (files: FileList | null) => {
        if (!files?.length) return

        const slots = MAX_PHOTOS - photos.length
        if (slots <= 0) {
            toast.error(`Up to ${MAX_PHOTOS} photos allowed`)
            return
        }

        const list = Array.from(files).slice(0, slots)
        setUploadingPhotos(true)
        try {
            const urls: string[] = []
            for (const file of list) {
                const publicUrl = await uploadOne(file, 'photo')
                if (publicUrl) urls.push(publicUrl)
            }
            setPhotos((prev) => [...prev, ...urls])
            if (urls.length < list.length) {
                toast.error('Some photos were skipped')
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to upload photos')
        } finally {
            setUploadingPhotos(false)
            if (photoInputRef.current) photoInputRef.current.value = ''
        }
    }

    const handleVideoChange = async (file: File | undefined) => {
        if (!file) return

        setVideoFileName(file.name)
        setUploadingVideo(true)
        try {
            const publicUrl = await uploadOne(file, 'video')
            if (publicUrl) setVideo(publicUrl)
            else setVideoFileName(video ? 'Current video' : '')
        } catch (error) {
            console.log(error)
            setVideoFileName(video ? 'Current video' : '')
            toast.error('Failed to upload video')
        } finally {
            setUploadingVideo(false)
            if (videoInputRef.current) videoInputRef.current.value = ''
        }
    }

    const handleAutofill = async () => {
        if (!link) {
            toast.error('Paste your project link first')
            return
        }

        try {
            const metadata = await enrich.mutateAsync(link)
            setName(metadata.name)
            setDescription(metadata.description)
            setSelectedTags(metadata.tags.filter((t) => tagOptions.includes(t)).slice(0, 3))
            if (metadata.logoUrl) {
                setLogo(metadata.logoUrl)
                setLogoFileName('Fetched from website')
            }
            toast.success('Details filled with AI')
        } catch (error) {
            console.log(error)
            toast.error('Could not autofill, please fill the form manually')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name || !description || !link || !logo || selectedTags.length === 0) {
            toast.error('Please fill all fields including logo')
            return
        }

        if (!user) {
            toast.error('Please log in to upload a project')
            return
        }

        const payload = {
            name,
            description,
            link,
            logoUrl: logo,
            tags: selectedTags,
            videoUrl: video || null,
            photos,
        }

        try {
            if (isEdit && listing) {
                await updateListing.mutateAsync({ id: listing.id, data: payload })
                toast.success('Project updated successfully!')
            } else {
                await uploadListing.mutateAsync(payload)
                toast.success('Project uploaded successfully!')
            }
            closeModal()
        } catch (error) {
            console.log(error)
            toast.error(isEdit ? 'Failed to update project' : 'Failed to upload project')
        }
    }

    return (
        <>
            {trigger === null ? null : trigger !== undefined ? (
                <span onClick={() => setOpen(true)} className="contents">
                    {trigger}
                </span>
            ) : (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="paper-btn-primary inline-flex h-10 shrink-0 items-center gap-2 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40"
                >
                    <Plus className="h-4 w-4" />
                    Upload project
                </button>
            )}

            {open && mounted && createPortal(
                <div
                    className="fixed inset-0 z-[250] bg-black/25 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="flex min-h-full items-center justify-center overflow-y-auto p-4 sm:p-6"
                        onClick={closeModal}
                    >
                    <div
                        className="auth-card relative my-auto flex w-full max-w-lg max-h-[min(90vh,720px)] flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="auth-card-header flex shrink-0 items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--paper-ink)]">
                                    {isEdit ? 'Edit your project' : 'List your project'}
                                </h2>
                                <p className="mt-1 text-sm text-[var(--paper-muted)]">
                                    Tell the community about your launch.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="shrink-0 rounded-md p-1 text-[var(--paper-muted)] transition-colors hover:text-[var(--paper-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="auth-card-body flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto"
                        >
                            <div className="paper-sheet-static space-y-4 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--paper-muted)]">
                                    Basics
                                </p>

                                <div>
                                    <label htmlFor="project-name" className="mb-1.5 block text-sm font-medium text-[var(--paper-ink)]">
                                        Project name
                                    </label>
                                    <input
                                        id="project-name"
                                        type="text"
                                        placeholder="ShowHunt, Inc"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={authFieldClass}
                                    />
                                </div>

                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label htmlFor="project-description" className="text-sm font-medium text-[var(--paper-ink)]">
                                            Short description
                                        </label>
                                        <span className="text-xs text-[var(--paper-muted)]">
                                            {description.length}/{MAX_DESCRIPTION_LENGTH}
                                        </span>
                                    </div>
                                    <textarea
                                        id="project-description"
                                        placeholder="About your project"
                                        rows={3}
                                        maxLength={MAX_DESCRIPTION_LENGTH}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className={cn(authFieldClass, 'h-auto min-h-[5rem] resize-none py-2')}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="project-link" className="mb-1.5 block text-sm font-medium text-[var(--paper-ink)]">
                                        Live link
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            id="project-link"
                                            type="url"
                                            placeholder="https://example.com"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            className={cn(authFieldClass, 'flex-1')}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAutofill}
                                            disabled={enrich.isPending}
                                            title="Fetch name, description, tags and logo from the link with AI"
                                            className="inline-flex h-[38px] shrink-0 items-center gap-1.5 rounded-lg border border-[#7C3AED] bg-[var(--paper-accent-soft)] px-3 text-xs font-semibold text-[#5B21B6] transition-colors hover:bg-[#7C3AED]/20 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {enrich.isPending ? (
                                                <Spinner className="h-3.5 w-3.5" />
                                            ) : (
                                                <Sparkles className="h-3.5 w-3.5" />
                                            )}
                                            Fill with AI
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="paper-sheet-static space-y-4 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--paper-muted)]">
                                    Branding
                                </p>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-[var(--paper-ink)]">
                                        Logo
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={(e) => handleFileChange(e.target.files?.[0])}
                                    />

                                    {logo ? (
                                        <div className="flex items-center gap-4 rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface)] p-3">
                                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--paper-border)]">
                                                <Image
                                                    src={logo}
                                                    alt="Logo preview"
                                                    width={64}
                                                    height={64}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-[var(--paper-ink)]">
                                                    {uploadingLogo
                                                        ? 'Uploading logo...'
                                                        : logoFileName || 'Selected logo'}
                                                </p>
                                                <button
                                                    type="button"
                                                    disabled={uploadingLogo}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="mt-1 text-sm text-[#7C3AED] transition-colors hover:text-[#5B21B6] disabled:opacity-50"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--paper-border)] bg-[var(--paper-surface)] px-4 py-8 transition-colors hover:border-[#7C3AED]/50 hover:bg-[var(--paper-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--paper-accent-soft)] text-[#7C3AED]">
                                                <Upload className="h-5 w-5" />
                                            </div>
                                            <span className="text-sm font-medium text-[var(--paper-ink)]">Choose logo</span>
                                            <span className="text-xs text-[var(--paper-muted)]">PNG or JPG</span>
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-[var(--paper-ink)]">
                                        Photos (up to {MAX_PHOTOS})
                                    </label>
                                    <input
                                        ref={photoInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        multiple
                                        className="sr-only"
                                        onChange={(e) => handlePhotosChange(e.target.files)}
                                    />

                                    <div className="flex flex-wrap gap-2">
                                        {photos.map((url, index) => (
                                            <div
                                                key={url}
                                                className="relative h-20 w-20 overflow-hidden rounded-xl border border-[var(--paper-border)]"
                                            >
                                                <Image
                                                    src={url}
                                                    alt={`Photo ${index + 1}`}
                                                    width={80}
                                                    height={80}
                                                    className="h-full w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPhotos((prev) => prev.filter((p) => p !== url))
                                                    }
                                                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white transition-colors hover:bg-black/80"
                                                    aria-label={`Remove photo ${index + 1}`}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}

                                        {photos.length < MAX_PHOTOS && (
                                            <button
                                                type="button"
                                                onClick={() => photoInputRef.current?.click()}
                                                disabled={uploadingPhotos}
                                                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--paper-border)] bg-[var(--paper-surface)] transition-colors hover:border-[#7C3AED]/50 hover:bg-[var(--paper-accent-soft)] disabled:opacity-60"
                                            >
                                                {uploadingPhotos ? (
                                                    <Spinner className="h-4 w-4 text-[#7C3AED]" />
                                                ) : (
                                                    <Images className="h-5 w-5 text-[#7C3AED]" />
                                                )}
                                                <span className="text-[10px] text-[var(--paper-muted)]">
                                                    {uploadingPhotos ? 'Uploading' : 'Add photo'}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-[var(--paper-ink)]">
                                        Demo video (optional)
                                    </label>
                                    <input
                                        ref={videoInputRef}
                                        type="file"
                                        accept="video/mp4,video/webm,video/quicktime"
                                        className="sr-only"
                                        onChange={(e) => handleVideoChange(e.target.files?.[0])}
                                    />

                                    {video ? (
                                        <div className="flex items-center gap-3 rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface)] p-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--paper-accent-soft)] text-[#7C3AED]">
                                                <Film className="h-5 w-5" />
                                            </div>
                                            <p className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--paper-ink)]">
                                                {uploadingVideo ? 'Uploading video...' : videoFileName || 'Video ready'}
                                            </p>
                                            <button
                                                type="button"
                                                disabled={uploadingVideo}
                                                onClick={() => {
                                                    setVideo('')
                                                    setVideoFileName('')
                                                }}
                                                className="text-sm text-[#7C3AED] transition-colors hover:text-[#5B21B6] disabled:opacity-50"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => videoInputRef.current?.click()}
                                            disabled={uploadingVideo}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--paper-border)] bg-[var(--paper-surface)] px-4 py-4 transition-colors hover:border-[#7C3AED]/50 hover:bg-[var(--paper-accent-soft)] disabled:opacity-60"
                                        >
                                            {uploadingVideo ? (
                                                <Spinner className="h-4 w-4 text-[#7C3AED]" />
                                            ) : (
                                                <Film className="h-4 w-4 text-[#7C3AED]" />
                                            )}
                                            <span className="text-sm text-[var(--paper-ink)]">
                                                {uploadingVideo ? 'Uploading video...' : 'Choose video'}
                                            </span>
                                            <span className="text-xs text-[var(--paper-muted)]">
                                                MP4, WebM or MOV, under 100MB
                                            </span>
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[var(--paper-ink)]">
                                        Tags (up to 3)
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {tagOptions.map((tag) => (
                                            <motion.button
                                                key={tag}
                                                type="button"
                                                whileTap={{ scale: 0.95 }}
                                                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                                                onClick={() => {
                                                    if (selectedTags.includes(tag)) {
                                                        setSelectedTags(selectedTags.filter((t) => t !== tag))
                                                    } else if (selectedTags.length < 3) {
                                                        setSelectedTags([...selectedTags, tag])
                                                    }
                                                }}
                                                disabled={!selectedTags.includes(tag) && selectedTags.length >= 3}
                                                className={cn(
                                                    'rounded-lg border px-2.5 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                                                    selectedTags.includes(tag)
                                                        ? 'border-[#7C3AED] bg-[var(--paper-accent-soft)] text-[#5B21B6]'
                                                        : 'border-[var(--paper-border)] bg-white text-[var(--paper-muted)] hover:border-[#7C3AED]/50'
                                                )}
                                            >
                                                {tag}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    uploadListing.isPending ||
                                    updateListing.isPending ||
                                    enrich.isPending ||
                                    uploadingLogo ||
                                    uploadingPhotos ||
                                    uploadingVideo
                                }
                                className="paper-btn-primary mt-1 flex h-10 w-full shrink-0 items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40 disabled:opacity-60"
                            >
                                {uploadListing.isPending || updateListing.isPending ? (
                                    <Spinner className="w-4 h-4" />
                                ) : isEdit ? (
                                    'Save changes'
                                ) : (
                                    'Submit project'
                                )}
                            </button>
                        </form>
                    </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}

export default UploadProject
