'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Plus, Upload, X } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { useMe } from '@/lib/queries/hooks'
import { useUploadProject } from '@/lib/queries/mutations'
import { authFieldClass } from '@/lib/auth-field'
import { cn } from '@/lib/utils'

const TAGS = ['SaaS', 'Productivity', 'AI', 'Fintech', 'E-commerce', 'Others']
const MAX_DESCRIPTION_LENGTH = 100

function UploadProject() {
    const [mounted, setMounted] = useState(false)
    const [open, setOpen] = useState(false)
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [link, setLink] = useState('')
    const [logo, setLogo] = useState('')
    const [logoFileName, setLogoFileName] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { data: user } = useMe()
    const uploadProject = useUploadProject()

    const closeModal = () => setOpen(false)

    useEffect(() => {
        setMounted(true)
    }, [])

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

    const handleFileChange = (file: File | undefined) => {
        if (!file) return

        setLogoFileName(file.name)
        const reader = new FileReader()
        reader.onloadend = () => setLogo(reader.result as string)
        reader.readAsDataURL(file)
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

        try {
            await uploadProject.mutateAsync({
                name,
                description,
                link,
                logoUrl: logo,
                tags: selectedTags,
                userId: user.id,
            })

            toast.success('Project uploaded successfully!')
            closeModal()
            setName('')
            setDescription('')
            setLink('')
            setLogo('')
            setLogoFileName('')
            setSelectedTags([])
        } catch (error) {
            console.log(error)
            toast.error('Failed to upload project')
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="paper-btn-primary inline-flex h-10 shrink-0 items-center gap-2 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8162]/40"
            >
                <Plus className="h-4 w-4" />
                Upload project
            </button>

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
                                <h2 className="text-lg font-semibold text-[var(--paper-ink)]">List your project</h2>
                                <p className="mt-1 text-sm text-[var(--paper-muted)]">
                                    Tell the community about your launch.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="shrink-0 rounded-md p-1 text-[var(--paper-muted)] transition-colors hover:text-[var(--paper-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8162]/40"
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
                                        placeholder="BackIt, Inc"
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
                                    <input
                                        id="project-link"
                                        type="url"
                                        placeholder="https://example.com"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        className={authFieldClass}
                                    />
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
                                                    {logoFileName || 'Selected logo'}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="mt-1 text-sm text-[#FF8162] transition-colors hover:text-[#F12711]"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--paper-border)] bg-[var(--paper-surface)] px-4 py-8 transition-colors hover:border-[#FF8162]/50 hover:bg-[var(--paper-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8162]/40"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--paper-accent-soft)] text-[#FF8162]">
                                                <Upload className="h-5 w-5" />
                                            </div>
                                            <span className="text-sm font-medium text-[var(--paper-ink)]">Choose logo</span>
                                            <span className="text-xs text-[var(--paper-muted)]">PNG or JPG</span>
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[var(--paper-ink)]">
                                        Tags (up to 3)
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {TAGS.map((tag) => (
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
                                                        ? 'border-[#FF8162] bg-[var(--paper-accent-soft)] text-[#F12711]'
                                                        : 'border-[var(--paper-border)] bg-white text-[var(--paper-muted)] hover:border-[#FF8162]/50'
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
                                disabled={uploadProject.isPending}
                                className="paper-btn-primary mt-1 flex h-10 w-full shrink-0 items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8162]/40 disabled:opacity-60"
                            >
                                {uploadProject.isPending ? <Spinner className="w-4 h-4" /> : 'Submit project'}
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
