'use client'

import { useCallback, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import {
    Check,
    Film,
    Images,
    Plus,
    Sparkles,
    Trash2,
    Upload,
    X,
} from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useMe, useTags } from '@/lib/queries/hooks'
import {
    useEnrichListing,
    useUpdateListing,
    useUploadListing,
} from '@/lib/queries/mutations'
import type { Listing } from '@/lib/queries/types'
import { UPLOAD_LIMITS_MB, uploadFile, validateFileType } from '@/lib/upload'
import { useModalBehavior } from '@/lib/use-modal'
import { authFieldClass } from '@/lib/auth-field'
import { apiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

const FALLBACK_TAGS = [
    'SaaS', 'Productivity', 'AI', 'Fintech', 'E-commerce', 'Open Source',
    'Dev Tools', 'Social', 'Design', 'Education', 'Gaming', 'Crypto',
    'Hardware', 'Health & Fitness', 'Others',
]
const MAX_PHOTOS = 5
const MAX_DESCRIPTION_LENGTH = 160
const MAX_LINKS = 6
const PROGRESS_GREEN = '#1CB061'

const STEPS = [
    { key: 'basics', label: 'Basics' },
    { key: 'media', label: 'Media' },
    { key: 'links', label: 'Links' },
    { key: 'tags', label: 'Tags' },
] as const

type StepKey = (typeof STEPS)[number]['key']

const PLATFORM_OPTIONS = [
    { value: 'GITHUB', label: 'GitHub' },
    { value: 'X_TWITTER', label: 'X (Twitter)' },
    { value: 'PRODUCT_HUNT', label: 'Product Hunt' },
    { value: 'YOUTUBE', label: 'YouTube' },
    { value: 'PLAY_STORE', label: 'Play Store' },
    { value: 'APP_STORE', label: 'App Store' },
    { value: 'OTHER', label: 'Custom' },
] as const

type PlatformValue = (typeof PLATFORM_OPTIONS)[number]['value']

interface SocialRow {
    id: string
    platform: PlatformValue | ''
    url: string
}

interface UploadProjectProps {
    listing?: Listing | null
    trigger?: ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

function newRowId() {
    return Math.random().toString(36).slice(2, 10)
}

function isValidUrl(value: string) {
    return /^https?:\/\/.+\..+/.test(value.trim())
}

export default function UploadProject({ listing, trigger, open: openProp, onOpenChange }: UploadProjectProps) {
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    )
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const isControlled = openProp !== undefined
    const open = isControlled ? !!openProp : uncontrolledOpen
    const setOpen = useCallback(
        (value: boolean) => {
            if (!isControlled) setUncontrolledOpen(value)
            onOpenChange?.(value)
        },
        [isControlled, onOpenChange]
    )

    useModalBehavior(open, () => setOpen(false))

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
                    className="paper-btn-dark inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40"
                >
                    <Plus className="h-4 w-4" />
                    Upload project
                </button>
            )}

            {open && mounted && createPortal(
                <div
                    className="fixed inset-0 z-[250] bg-black/25 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="flex min-h-full items-center justify-center overflow-y-auto p-4 sm:p-6"
                        onClick={() => setOpen(false)}
                    >
                        <div
                            className="auth-card relative my-auto flex h-[min(90vh,760px)] w-full max-w-xl flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <UploadProjectForm
                                key={listing?.id ?? 'new'}
                                listing={listing}
                                onDone={() => setOpen(false)}
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}

function StepProgress({ step }: { step: number }) {
    return (
        <div className="flex h-14 shrink-0 items-center border-b border-[var(--paper-border)] px-5 sm:px-7">
            <div className="grid w-full grid-cols-4 gap-2">
                {STEPS.map((s, i) => {
                    const filled = i <= step
                    return (
                        <div
                            key={s.key}
                            className={cn(
                                'h-1.5 rounded-full transition-colors',
                                filled ? 'bg-[#1CB061]' : 'bg-[var(--paper-border)]'
                            )}
                            style={filled ? { backgroundColor: PROGRESS_GREEN } : undefined}
                            aria-label={s.label}
                        />
                    )
                })}
            </div>
        </div>
    )
}

function UploadProjectForm({ listing, onDone }: { listing?: Listing | null; onDone: () => void }) {
    const isEdit = !!listing
    const [step, setStep] = useState(0)
    const [aiUsed, setAiUsed] = useState(false)

    const [selectedTags, setSelectedTags] = useState<string[]>(() => listing?.tags ?? [])
    const [name, setName] = useState(() => listing?.name ?? '')
    const [description, setDescription] = useState(() => listing?.description ?? '')
    const [link, setLink] = useState(
        () =>
            listing?.links.find((l) => l.platform === 'WEBSITE')?.url ??
            listing?.links[0]?.url ??
            ''
    )
    const [socialRows, setSocialRows] = useState<SocialRow[]>(() => {
        const extras = (listing?.links ?? []).filter((l) => l.platform !== 'WEBSITE')
        if (extras.length === 0) return []
        return extras.map((l) => ({
            id: newRowId(),
            platform: (PLATFORM_OPTIONS.some((p) => p.value === l.platform)
                ? l.platform
                : 'OTHER') as PlatformValue,
            url: l.url,
        }))
    })
    const [isOpenSource, setIsOpenSource] = useState(() => listing?.isOpenSource ?? false)
    const [repoUrl, setRepoUrl] = useState(() => listing?.repoUrl ?? '')
    const [logo, setLogo] = useState(() => listing?.logoUrl ?? '')
    const [logoFileName, setLogoFileName] = useState(() => (listing ? 'Current logo' : ''))
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [photos, setPhotos] = useState<string[]>(() => listing?.photos ?? [])
    const [uploadingPhotos, setUploadingPhotos] = useState(false)
    const [video, setVideo] = useState(() => listing?.videoUrl ?? '')
    const [videoFileName, setVideoFileName] = useState(() => (listing?.videoUrl ? 'Current video' : ''))
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

    const remaining = MAX_DESCRIPTION_LENGTH - description.length
    const overLimit = remaining < 0

    const uploadOne = async (file: File, kind: 'logo' | 'photo' | 'video') => {
        if (!validateFileType(file, kind)) {
            toast.error(
                kind === 'video'
                    ? 'Video must be an MP4, WebM or MOV file'
                    : 'File must be a PNG, JPG, WebP or SVG image'
            )
            return null
        }
        const limitMb = UPLOAD_LIMITS_MB[kind]
        if (file.size > limitMb * 1024 * 1024) {
            toast.error(`File must be under ${limitMb}MB`)
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
        } catch (err) {
            setLogoFileName('')
            toast.error(apiErrorMessage(err, 'Failed to upload logo'))
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
                toast.error('Some photos failed to upload')
            }
        } catch (err) {
            toast.error(apiErrorMessage(err, 'Failed to upload photos'))
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
        } catch (err) {
            setVideoFileName(video ? 'Current video' : '')
            toast.error(apiErrorMessage(err, 'Failed to upload video'))
        } finally {
            setUploadingVideo(false)
            if (videoInputRef.current) videoInputRef.current.value = ''
        }
    }

    const handleAutofill = async () => {
        if (aiUsed || enrich.isPending) return
        if (!link.trim()) {
            toast.error('Paste your live link first')
            return
        }
        if (!isValidUrl(link)) {
            toast.error('Live link must be a full URL starting with https://')
            return
        }
        try {
            const metadata = await enrich.mutateAsync(link.trim())
            setName(metadata.name)
            setDescription(metadata.description)
            setAiUsed(true)
            toast.success('Name and description filled with AI')
        } catch (err) {
            toast.error(apiErrorMessage(err, 'Could not autofill from that link'))
        }
    }

    const validateStep = (index: number): boolean => {
        if (index === 0) {
            if (!link.trim()) {
                toast.error('Live link is required')
                return false
            }
            if (!isValidUrl(link)) {
                toast.error('Live link must be a full URL starting with https://')
                return false
            }
            if (!name.trim()) {
                toast.error('Project name is required')
                return false
            }
            if (!description.trim()) {
                toast.error('Short description is required')
                return false
            }
            if (overLimit) {
                toast.error(`Description is ${Math.abs(remaining)} characters over the limit`)
                return false
            }
            if (isOpenSource) {
                if (!repoUrl.trim()) {
                    toast.error('Repository URL is required for open source projects')
                    return false
                }
                if (!isValidUrl(repoUrl)) {
                    toast.error('Repository URL must be a full URL starting with https://')
                    return false
                }
            }
            return true
        }
        if (index === 1) {
            if (!logo) {
                toast.error('Logo is required')
                return false
            }
            return true
        }
        if (index === 2) {
            for (const row of socialRows) {
                const hasUrl = row.url.trim() !== ''
                const hasPlatform = row.platform !== ''
                if (hasUrl && !hasPlatform) {
                    toast.error('Choose a platform for each link')
                    return false
                }
                if (hasPlatform && !hasUrl) {
                    toast.error('Enter a URL for each selected platform')
                    return false
                }
                if (hasUrl && !isValidUrl(row.url)) {
                    toast.error('Every social link must be a full URL starting with https://')
                    return false
                }
            }
            const platforms = socialRows
                .map((r) => r.platform)
                .filter((p): p is PlatformValue => p !== '')
            if (new Set(platforms).size !== platforms.length) {
                toast.error('Each platform can only be used once')
                return false
            }
            return true
        }
        if (index === 3) {
            if (selectedTags.length === 0) {
                toast.error('Pick at least one tag')
                return false
            }
            return true
        }
        return true
    }

    const goNext = () => {
        if (!validateStep(step)) return
        setStep((s) => Math.min(s + 1, STEPS.length - 1))
    }

    const goPrev = () => setStep((s) => Math.max(s - 1, 0))

    const handleSubmit = async () => {
        if (!validateStep(0) || !validateStep(1) || !validateStep(2) || !validateStep(3)) {
            if (overLimit) setStep(0)
            else if (!logo) setStep(1)
            else if (selectedTags.length === 0) setStep(3)
            return
        }
        if (!user) {
            toast.error('Please log in to upload a project')
            return
        }

        const socialLinks = socialRows
            .filter((r): r is SocialRow & { platform: PlatformValue } => r.platform !== '' && r.url.trim() !== '')
            .map((r) => ({ platform: r.platform, url: r.url.trim() }))

        const payload = {
            name: name.trim(),
            description: description.trim(),
            link: link.trim(),
            logoUrl: logo,
            tags: selectedTags,
            videoUrl: video || null,
            photos,
            isOpenSource,
            repoUrl: isOpenSource && repoUrl.trim() ? repoUrl.trim() : null,
            socialLinks,
        }

        try {
            if (isEdit && listing) {
                await updateListing.mutateAsync({ id: listing.id, data: payload })
                toast.success('Project updated')
            } else {
                await uploadListing.mutateAsync(payload)
                toast.success('Project uploaded')
            }
            onDone()
        } catch (err) {
            toast.error(apiErrorMessage(err, isEdit ? 'Failed to update project' : 'Failed to upload project'))
        }
    }

    const submitting =
        uploadListing.isPending ||
        updateListing.isPending ||
        enrich.isPending ||
        uploadingLogo ||
        uploadingPhotos ||
        uploadingVideo

    const usedPlatforms = new Set(
        socialRows.map((r) => r.platform).filter((p): p is PlatformValue => p !== '')
    )

    const addSocialRow = () => {
        if (socialRows.length >= MAX_LINKS) {
            toast.error(`Up to ${MAX_LINKS} links allowed`)
            return
        }
        setSocialRows((prev) => [...prev, { id: newRowId(), platform: '', url: '' }])
    }

    const updateRow = (id: string, patch: Partial<SocialRow>) => {
        setSocialRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    }

    const removeRow = (id: string) => {
        setSocialRows((prev) => prev.filter((r) => r.id !== id))
    }

    const currentKey: StepKey = STEPS[step].key

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <StepProgress step={step} />

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
                {currentKey === 'basics' && (
                    <div className="space-y-5">
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
                                    disabled={aiUsed || enrich.isPending}
                                    title={aiUsed ? 'AI fill already used' : 'Fill name and description with AI'}
                                    className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#DA5CC7] bg-[var(--paper-accent-soft)] px-3 text-xs font-semibold text-[#C431AE] transition-colors hover:bg-[#DA5CC7]/20 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {enrich.isPending ? (
                                        <Spinner className="h-3.5 w-3.5" />
                                    ) : aiUsed ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        <Sparkles className="h-3.5 w-3.5" />
                                    )}
                                    {aiUsed ? 'Filled' : 'Fill with AI'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="project-name" className="mb-1.5 block text-sm font-medium text-[var(--paper-ink)]">
                                Project name
                            </label>
                            <input
                                id="project-name"
                                type="text"
                                placeholder="ShowHunt"
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
                                <span className={cn('text-xs tabular-nums', overLimit ? 'font-medium text-red-600' : 'text-[var(--paper-muted)]')}>
                                    {remaining} left
                                </span>
                            </div>
                            <textarea
                                id="project-description"
                                placeholder="What does your project do?"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={cn(authFieldClass, 'h-auto min-h-[5rem] resize-none py-2')}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex cursor-pointer items-center gap-2.5 select-none">
                                <input
                                    type="checkbox"
                                    checked={isOpenSource}
                                    onChange={(e) => setIsOpenSource(e.target.checked)}
                                    className="h-4 w-4 shrink-0 cursor-pointer accent-[#DA5CC7]"
                                />
                                <span className="text-sm font-medium text-[var(--paper-ink)]">
                                    This is an open source project
                                </span>
                            </label>
                            {isOpenSource && (
                                <input
                                    type="url"
                                    aria-label="Repository URL"
                                    placeholder="https://github.com/you/project"
                                    value={repoUrl}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                    className={authFieldClass}
                                />
                            )}
                        </div>
                    </div>
                )}

                {currentKey === 'media' && (
                    <div className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--paper-ink)]">Logo</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => handleFileChange(e.target.files?.[0])}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingLogo}
                                className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-[var(--paper-border)] bg-[#FAFAFA] p-4 text-left transition-colors hover:border-[#DA5CC7]/40 hover:bg-[var(--paper-accent-soft)]/40 disabled:opacity-60"
                            >
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--paper-border)] bg-white">
                                    {logo ? (
                                        <Image src={logo} alt="Logo preview" width={56} height={56} className="h-full w-full object-cover" />
                                    ) : (
                                        <Upload className="h-5 w-5 text-[#DA5CC7]" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-[var(--paper-ink)]">
                                        {uploadingLogo
                                            ? 'Uploading...'
                                            : logo
                                              ? logoFileName || 'Logo ready'
                                              : 'Upload logo'}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[var(--paper-muted)]">
                                        PNG, JPG, WebP or SVG · under {UPLOAD_LIMITS_MB.logo}MB
                                    </p>
                                    {logo && !uploadingLogo && (
                                        <span className="mt-1.5 inline-block text-sm font-medium text-[#DA5CC7]">Replace</span>
                                    )}
                                </div>
                            </button>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--paper-ink)]">
                                Photos <span className="font-normal text-[var(--paper-muted)]">(up to {MAX_PHOTOS})</span>
                            </label>
                            <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                multiple
                                className="sr-only"
                                onChange={(e) => handlePhotosChange(e.target.files)}
                            />
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                {photos.map((url, index) => (
                                    <div key={url} className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--paper-border)]">
                                        <Image src={url} alt={`Photo ${index + 1}`} fill sizes="96px" className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setPhotos((prev) => prev.filter((p) => p !== url))}
                                            className="absolute right-1.5 top-1.5 cursor-pointer rounded-full bg-black/65 p-1 text-white hover:bg-black/80"
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
                                        className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[var(--paper-border)] bg-[#FAFAFA] transition-colors hover:border-[#DA5CC7]/50 hover:bg-[var(--paper-accent-soft)] disabled:opacity-60"
                                    >
                                        {uploadingPhotos ? (
                                            <Spinner className="h-4 w-4 text-[#DA5CC7]" />
                                        ) : (
                                            <Images className="h-5 w-5 text-[#DA5CC7]" />
                                        )}
                                        <span className="text-[10px] text-[var(--paper-muted)]">
                                            {uploadingPhotos ? 'Uploading' : 'Add'}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--paper-ink)]">
                                Demo video <span className="font-normal text-[var(--paper-muted)]">(optional)</span>
                            </label>
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime"
                                className="sr-only"
                                onChange={(e) => handleVideoChange(e.target.files?.[0])}
                            />
                            <div className="flex w-full items-center gap-4 rounded-2xl border border-[var(--paper-border)] bg-[#FAFAFA] p-4">
                                <button
                                    type="button"
                                    onClick={() => videoInputRef.current?.click()}
                                    disabled={uploadingVideo}
                                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-left disabled:opacity-60"
                                >
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--paper-border)] bg-white text-[#DA5CC7]">
                                        {uploadingVideo ? <Spinner className="h-5 w-5" /> : <Film className="h-5 w-5" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-[var(--paper-ink)]">
                                            {uploadingVideo
                                                ? 'Uploading...'
                                                : video
                                                  ? videoFileName || 'Video ready'
                                                  : 'Upload demo video'}
                                        </p>
                                        <p className="mt-0.5 text-xs text-[var(--paper-muted)]">
                                            MP4, WebM or MOV · under {UPLOAD_LIMITS_MB.video}MB
                                        </p>
                                        {video && !uploadingVideo && (
                                            <span className="mt-1.5 inline-block text-sm font-medium text-[#DA5CC7]">Replace</span>
                                        )}
                                    </div>
                                </button>
                                {video && !uploadingVideo && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setVideo('')
                                            setVideoFileName('')
                                        }}
                                        className="shrink-0 cursor-pointer text-sm font-medium text-[#DA5CC7] hover:text-[#C431AE]"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {currentKey === 'links' && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-[var(--paper-ink)]">
                            Social links <span className="font-normal text-[var(--paper-muted)]">(optional)</span>
                        </h3>

                        <div className="space-y-3">
                            {socialRows.map((row) => (
                                <div key={row.id} className="flex items-center gap-2">
                                    <Select
                                        value={row.platform || undefined}
                                        onValueChange={(value) =>
                                            updateRow(row.id, { platform: value as PlatformValue })
                                        }
                                    >
                                        <SelectTrigger className="w-[140px] shrink-0 sm:w-[160px]">
                                            <SelectValue placeholder="Choose..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PLATFORM_OPTIONS.map((opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                    disabled={
                                                        opt.value !== row.platform &&
                                                        usedPlatforms.has(opt.value)
                                                    }
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <input
                                        type="url"
                                        placeholder="https://"
                                        value={row.url}
                                        onChange={(e) => updateRow(row.id, { url: e.target.value })}
                                        className={cn(authFieldClass, 'min-w-0 flex-1')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeRow(row.id)}
                                        aria-label="Remove link"
                                        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-[var(--paper-border)] text-[var(--paper-muted)] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {socialRows.length < MAX_LINKS && (
                            <button
                                type="button"
                                onClick={addSocialRow}
                                className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-[8px] border border-dashed border-[var(--paper-border)] px-3 text-sm font-medium text-[var(--paper-muted)] transition-colors hover:border-[#DA5CC7]/50 hover:bg-[var(--paper-accent-soft)] hover:text-[#DA5CC7]"
                            >
                                <Plus className="h-4 w-4" />
                                Add link
                            </button>
                        )}
                    </div>
                )}

                {currentKey === 'tags' && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-[var(--paper-ink)]">
                            Tags <span className="font-normal text-[var(--paper-muted)]">(up to 3)</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {tagOptions.map((tag) => {
                                const selected = selectedTags.includes(tag)
                                const disabled = !selected && selectedTags.length >= 3
                                return (
                                    <motion.button
                                        key={tag}
                                        type="button"
                                        whileTap={disabled ? undefined : { scale: 0.95 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                                        disabled={disabled}
                                        onClick={() => {
                                            if (selected) {
                                                setSelectedTags(selectedTags.filter((t) => t !== tag))
                                            } else if (selectedTags.length < 3) {
                                                setSelectedTags([...selectedTags, tag])
                                            }
                                        }}
                                        className={cn(
                                            'rounded-[8px] border px-2.5 py-1 text-sm transition-colors',
                                            selected
                                                ? 'cursor-pointer border-[#DA5CC7] bg-[var(--paper-accent-soft)] text-[#C431AE]'
                                                : disabled
                                                  ? 'cursor-not-allowed border-[var(--paper-border)] bg-white text-[var(--paper-muted)] opacity-50'
                                                  : 'cursor-pointer border-[var(--paper-border)] bg-white text-[var(--paper-muted)] hover:border-[#DA5CC7]/50'
                                        )}
                                    >
                                        {tag}
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--paper-border)] bg-white px-5 py-4 sm:px-7">
                {step > 0 ? (
                    <button
                        type="button"
                        onClick={goPrev}
                        disabled={submitting}
                        className="h-10 cursor-pointer rounded-[8px] border border-[var(--paper-border)] px-4 text-sm text-[var(--paper-muted)] transition-colors hover:bg-black/5 hover:text-[var(--paper-ink)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>
                ) : (
                    <div />
                )}
                {step < STEPS.length - 1 ? (
                    <button
                        type="button"
                        onClick={goNext}
                        disabled={submitting}
                        className="paper-btn-primary inline-flex h-10 cursor-pointer items-center px-5 text-sm disabled:opacity-60"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="paper-btn-primary inline-flex h-10 min-w-[140px] cursor-pointer items-center justify-center px-5 text-sm disabled:opacity-60"
                    >
                        {uploadListing.isPending || updateListing.isPending ? (
                            <Spinner className="h-4 w-4" />
                        ) : isEdit ? (
                            'Save changes'
                        ) : (
                            'Upload project'
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
