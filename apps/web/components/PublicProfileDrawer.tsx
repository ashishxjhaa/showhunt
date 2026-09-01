'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { authFieldClass, authTextareaClass } from '@/lib/auth-field'
import { apiErrorMessage } from '@/lib/api'
import { INDIA_STATES } from '@/lib/india-states'
import { CURATED_TECH_STACK, MAX_TECH_STACK, MAX_TECH_STACK_ITEM } from '@/lib/tech-stack'
import { normalizeUsername, RESERVED_USERNAMES, USERNAME_PATTERN } from '@/lib/username'
import { useUpdatePublicProfile } from '@/lib/queries/mutations'
import type { User } from '@/lib/queries/types'
import { cn } from '@/lib/utils'

const BIO_MAX = 280

interface PublicProfileDrawerProps {
    user: User
    open: boolean
    onOpenChange: (open: boolean) => void
}

function isValidUrl(value: string) {
    return /^https?:\/\/.+\..+/.test(value.trim())
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label className="text-sm font-medium text-[#0F0F0F]">{children}</label>
}

function TechStackPicker({
    value,
    onChange,
}: {
    value: string[]
    onChange: (next: string[]) => void
}) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')

    const trimmed = query.trim()
    const options = useMemo(() => {
        const extra = value.filter(
            (item) =>
                !(CURATED_TECH_STACK as readonly string[]).includes(item)
        )
        const all = [...CURATED_TECH_STACK, ...extra]
        if (!trimmed) return all
        const q = trimmed.toLowerCase()
        return all.filter((item) => item.toLowerCase().includes(q))
    }, [trimmed, value])

    const canAddCustom =
        trimmed.length > 0 &&
        trimmed.length <= MAX_TECH_STACK_ITEM &&
        !value.some((item) => item.toLowerCase() === trimmed.toLowerCase()) &&
        !options.some((item) => item.toLowerCase() === trimmed.toLowerCase())

    const toggle = (item: string) => {
        if (value.includes(item)) {
            onChange(value.filter((v) => v !== item))
            return
        }
        if (value.length >= MAX_TECH_STACK) {
            toast.error(`Pick at most ${MAX_TECH_STACK} techs`)
            return
        }
        onChange([...value, item])
        setQuery('')
    }

    const addCustom = () => {
        if (!canAddCustom) return
        if (value.length >= MAX_TECH_STACK) {
            toast.error(`Pick at most ${MAX_TECH_STACK} techs`)
            return
        }
        onChange([...value, trimmed])
        setQuery('')
    }

    return (
        <div className="space-y-2">
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => onChange(value.filter((v) => v !== item))}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-[8px] border border-[#DA5CC7] bg-[var(--paper-accent-soft)] px-2 py-0.5 text-xs font-medium text-[#C431AE]"
                        >
                            {item}
                            <X className="h-3 w-3" />
                        </button>
                    ))}
                </div>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            authFieldClass,
                            'flex cursor-pointer items-center justify-between text-left font-normal'
                        )}
                    >
                        <span className={value.length ? 'text-[#0F0F0F]' : 'text-[#6B6879]/60'}>
                            {value.length
                                ? `${value.length} selected`
                                : 'Search or add techs'}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                    <div className="border-b border-[var(--paper-border)] p-2">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search techs…"
                            className="h-9 w-full rounded-md border border-[#D4D4D4] bg-white px-2.5 text-sm outline-none focus-visible:border-[#A3A3A3]"
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto p-1">
                        {canAddCustom && (
                            <li>
                                <button
                                    type="button"
                                    onClick={addCustom}
                                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-[var(--paper-accent-soft)] hover:text-[#C431AE]"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add “{trimmed}”
                                </button>
                            </li>
                        )}
                        {options.map((item) => {
                            const selected = value.includes(item)
                            return (
                                <li key={item}>
                                    <button
                                        type="button"
                                        onClick={() => toggle(item)}
                                        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-[var(--paper-accent-soft)] hover:text-[#C431AE]"
                                    >
                                        <Check
                                            className={cn(
                                                'h-3.5 w-3.5',
                                                selected ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        {item}
                                    </button>
                                </li>
                            )
                        })}
                        {options.length === 0 && !canAddCustom && (
                            <li className="px-2 py-3 text-sm text-[var(--paper-muted)]">
                                No matches
                            </li>
                        )}
                    </ul>
                </PopoverContent>
            </Popover>
        </div>
    )
}

function StatePicker({
    value,
    onChange,
}: {
    value: string
    onChange: (next: string) => void
}) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const selected = INDIA_STATES.find((s) => s.slug === value)

    const options = useMemo(() => {
        if (!query.trim()) return INDIA_STATES
        const q = query.trim().toLowerCase()
        return INDIA_STATES.filter(
            (s) => s.name.toLowerCase().includes(q) || s.slug.includes(q)
        )
    }, [query])

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next)
                if (!next) setQuery('')
            }}
        >
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        authFieldClass,
                        'flex cursor-pointer items-center justify-between text-left font-normal'
                    )}
                >
                    <span className={selected ? 'text-[#0F0F0F]' : 'text-[#6B6879]/60'}>
                        {selected?.name ?? 'Select state or UT'}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <div className="border-b border-[var(--paper-border)] p-2">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search states…"
                        className="h-9 w-full rounded-md border border-[#D4D4D4] bg-white px-2.5 text-sm outline-none focus-visible:border-[#A3A3A3]"
                    />
                </div>
                <ul className="max-h-56 overflow-y-auto p-1">
                    {options.map((state) => (
                        <li key={state.slug}>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(state.slug)
                                    setOpen(false)
                                    setQuery('')
                                }}
                                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-[var(--paper-accent-soft)] hover:text-[#C431AE]"
                            >
                                <Check
                                    className={cn(
                                        'h-3.5 w-3.5',
                                        value === state.slug ? 'opacity-100' : 'opacity-0'
                                    )}
                                />
                                {state.name}
                            </button>
                        </li>
                    ))}
                    {options.length === 0 && (
                        <li className="px-2 py-3 text-sm text-[var(--paper-muted)]">
                            No matches
                        </li>
                    )}
                </ul>
            </PopoverContent>
        </Popover>
    )
}

export default function PublicProfileDrawer({
    user,
    open,
    onOpenChange,
}: PublicProfileDrawerProps) {
    const published = !!user.username
    const updateProfile = useUpdatePublicProfile()
    const [username, setUsername] = useState('')
    const [bio, setBio] = useState('')
    const [twitterUrl, setTwitterUrl] = useState('')
    const [githubUrl, setGithubUrl] = useState('')
    const [portfolioUrl, setPortfolioUrl] = useState('')
    const [linkedinUrl, setLinkedinUrl] = useState('')
    const [state, setState] = useState('')
    const [techStack, setTechStack] = useState<string[]>([])
    const bioRemaining = BIO_MAX - bio.length
    const bioOverLimit = bioRemaining < 0

    useEffect(() => {
        if (!open) return
        setUsername(user.username ?? '')
        setBio(user.bio ?? '')
        setTwitterUrl(user.twitterUrl ?? '')
        setGithubUrl(user.githubUrl ?? '')
        setPortfolioUrl(user.portfolioUrl ?? '')
        setLinkedinUrl(user.linkedinUrl ?? '')
        setState(user.state ?? '')
        setTechStack(user.techStack ?? [])
    }, [open, user])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const normalized = normalizeUsername(username)
        if (!published) {
            if (!USERNAME_PATTERN.test(normalized)) {
                toast.error('Username must be 3–20 characters: lowercase letters, numbers, underscores')
                return
            }
            if (RESERVED_USERNAMES.has(normalized)) {
                toast.error('This username is reserved')
                return
            }
        }
        if (!bio.trim()) {
            toast.error('Bio is required')
            return
        }
        if (bioOverLimit) {
            toast.error(`Bio is ${Math.abs(bioRemaining)} characters over the limit`)
            return
        }
        const socials = [
            { label: 'Twitter / X', value: twitterUrl.trim() },
            { label: 'GitHub', value: githubUrl.trim() },
            { label: 'Portfolio', value: portfolioUrl.trim() },
            { label: 'LinkedIn', value: linkedinUrl.trim() },
        ]
        for (const social of socials) {
            if (social.value && !isValidUrl(social.value)) {
                toast.error(`Enter a valid ${social.label} URL, or leave it blank`)
                return
            }
        }
        if (techStack.length === 0) {
            toast.error('Pick at least one tech')
            return
        }
        if (!state) {
            toast.error('Select your state')
            return
        }

        updateProfile.mutate(
            {
                username: published ? user.username! : normalized,
                bio: bio.trim(),
                twitterUrl: twitterUrl.trim(),
                githubUrl: githubUrl.trim(),
                portfolioUrl: portfolioUrl.trim(),
                linkedinUrl: linkedinUrl.trim(),
                state,
                techStack,
            },
            {
                onSuccess: () => {
                    toast.success(published ? 'Public profile updated' : 'Public profile created')
                    onOpenChange(false)
                },
                onError: (err) => {
                    toast.error(apiErrorMessage(err, 'Could not save public profile'))
                },
            }
        )
    }

    return (
        <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-full gap-0 overflow-hidden bg-[var(--paper-surface)] p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-xl">
                <DrawerTitle className="sr-only">
                    {published ? 'Edit public profile' : 'Create public profile'}
                </DrawerTitle>
                <form onSubmit={handleSubmit} className="flex h-full flex-col">
                    <div className="shrink-0 border-b border-[var(--paper-border)] px-5 py-4 sm:px-7">
                        <h2 className="text-lg font-semibold text-[var(--paper-ink)]">
                            {published ? 'Edit public profile' : 'Create public profile'}
                        </h2>
                        <p className="mt-1 text-sm text-[var(--paper-muted)]">
                            This is what people see at /u/{published ? user.username : 'username'}
                        </p>
                    </div>

                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
                        <div className="flex flex-col gap-1.5">
                            <FieldLabel>Username</FieldLabel>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--paper-muted)]">
                                    @
                                </span>
                                <input
                                    value={username}
                                    disabled={published}
                                    onChange={(e) =>
                                        setUsername(
                                            e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                                        )
                                    }
                                    placeholder="ashish"
                                    maxLength={20}
                                    className={cn(authFieldClass, 'pl-7')}
                                />
                            </div>
                            {published && (
                                <p className="text-xs text-[var(--paper-muted)]">
                                    Username can’t be changed after you publish.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-3">
                                <FieldLabel>Bio</FieldLabel>
                                <span
                                    className={cn(
                                        'text-xs tabular-nums',
                                        bioOverLimit
                                            ? 'font-medium text-red-600'
                                            : 'text-[var(--paper-muted)]'
                                    )}
                                >
                                    {bioRemaining} left
                                </span>
                            </div>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="What you build, in a sentence or two"
                                rows={3}
                                className={authTextareaClass}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <FieldLabel>
                                Twitter / X{' '}
                                <span className="font-normal text-[var(--paper-muted)]">(optional)</span>
                            </FieldLabel>
                            <input
                                value={twitterUrl}
                                onChange={(e) => setTwitterUrl(e.target.value)}
                                placeholder="https://x.com/you"
                                className={authFieldClass}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <FieldLabel>
                                GitHub{' '}
                                <span className="font-normal text-[var(--paper-muted)]">(optional)</span>
                            </FieldLabel>
                            <input
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                placeholder="https://github.com/you"
                                className={authFieldClass}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <FieldLabel>
                                Portfolio{' '}
                                <span className="font-normal text-[var(--paper-muted)]">(optional)</span>
                            </FieldLabel>
                            <input
                                value={portfolioUrl}
                                onChange={(e) => setPortfolioUrl(e.target.value)}
                                placeholder="https://yoursite.com"
                                className={authFieldClass}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <FieldLabel>
                                LinkedIn{' '}
                                <span className="font-normal text-[var(--paper-muted)]">(optional)</span>
                            </FieldLabel>
                            <input
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                placeholder="https://linkedin.com/in/you"
                                className={authFieldClass}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <FieldLabel>Tech stack</FieldLabel>
                            <TechStackPicker value={techStack} onChange={setTechStack} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <FieldLabel>State</FieldLabel>
                            <StatePicker value={state} onChange={setState} />
                        </div>
                    </div>

                    <div className="flex shrink-0 justify-end border-t border-[var(--paper-border)] bg-white px-5 py-4 sm:px-7">
                        <button
                            type="submit"
                            disabled={updateProfile.isPending || bioOverLimit}
                            className="paper-btn-primary inline-flex h-10 min-w-[140px] cursor-pointer items-center justify-center px-5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {updateProfile.isPending ? (
                                <Spinner className="h-4 w-4" />
                            ) : published ? (
                                'Save profile'
                            ) : (
                                'Publish profile'
                            )}
                        </button>
                    </div>
                </form>
            </DrawerContent>
        </Drawer>
    )
}
