'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
    ArrowLeft,
    Github,
    Globe,
    LayoutGrid,
    Linkedin,
    List,
    Pencil,
    SquareArrowOutUpRight,
    Twitter,
} from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/AppShell'
import ProfileActivityChart from '@/components/ProfileActivityChart'
import ProjectListingCard from '@/components/ProjectListingCard'
import PublicProfileDrawer from '@/components/PublicProfileDrawer'
import { ProjectCardSkeleton } from '@/components/ProjectCardSkeleton'
import UserAvatar from '@/components/UserAvatar'
import IndiaBuildersMap from '@/components/IndiaBuildersMap'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMe, useBuildersMap, usePublicUser } from '@/lib/queries/hooks'
import { useListingsMutations } from '@/lib/queries/mutations'
import { queryKeys } from '@/lib/queries/keys'
import { normalizeUsername } from '@/lib/username'
import { indiaStateName } from '@/lib/india-states'
import type { PublicUser } from '@/lib/queries/types'
import { cn } from '@/lib/utils'
import { useVoiceSite } from '@/components/voice/VoiceSiteContext'

type ProjectsView = 'grid' | 'list'

const PROJECTS_VIEW_KEY = 'showhunt:projects-view'

const SOCIALS = [
    { key: 'twitterUrl' as const, label: 'Twitter / X', icon: Twitter },
    { key: 'githubUrl' as const, label: 'GitHub', icon: Github },
    { key: 'portfolioUrl' as const, label: 'Portfolio', icon: Globe },
    { key: 'linkedinUrl' as const, label: 'LinkedIn', icon: Linkedin },
]

function ProjectsViewToggle({
    isGrid,
    onChange,
}: {
    isGrid: boolean
    onChange: (view: ProjectsView) => void
}) {
    return (
        <div className="mb-4 flex items-center gap-2 rounded-[8px] border border-[var(--paper-border)] bg-white p-1 w-fit">
            <h2 className="px-2.5 text-sm font-medium text-[var(--paper-ink)] sm:text-base">
                Listings
            </h2>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onChange('list')}
                    aria-label="List view"
                    aria-pressed={!isGrid}
                    title="List view"
                    className={cn(
                        'flex h-8 w-8 cursor-pointer items-center justify-center rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40',
                        !isGrid
                            ? 'bg-[var(--paper-ink)] text-white'
                            : 'text-[var(--paper-muted)] hover:bg-black/5 hover:text-[var(--paper-ink)]',
                    )}
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => onChange('grid')}
                    aria-label="Grid view"
                    aria-pressed={isGrid}
                    title="Grid view"
                    className={cn(
                        'flex h-8 w-8 cursor-pointer items-center justify-center rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40',
                        isGrid
                            ? 'bg-[var(--paper-ink)] text-white'
                            : 'text-[var(--paper-muted)] hover:bg-black/5 hover:text-[var(--paper-ink)]',
                    )}
                >
                    <LayoutGrid className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}

function ProfileSidebar({ user }: { user: PublicUser }) {
    const socials = SOCIALS.filter(({ key }) => user[key])
    const hasSocials = socials.length > 0
    const hasTech = user.techStack.length > 0

    if (!hasSocials && !hasTech) return null

    return (
        <aside className="space-y-6">
            {hasSocials && (
                <section className="rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-[#E93545]">
                        Links
                    </h2>
                    <ul className="mt-3 space-y-1.5">
                        {socials.map(({ key, label, icon: Icon }) => (
                            <li key={key}>
                                <a
                                    href={user[key]!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/link flex items-center gap-2.5 rounded-[8px] px-2.5 py-2.5 text-sm text-[var(--paper-ink)] transition-colors hover:bg-[var(--paper-accent-soft)] hover:text-[#C431AE]"
                                >
                                    <Icon className="h-4 w-4 shrink-0 text-[var(--paper-muted)] transition-colors group-hover/link:text-[#DA5CC7]" />
                                    <span className="min-w-0 flex-1 truncate font-medium">
                                        {label}
                                    </span>
                                    <SquareArrowOutUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover/link:opacity-100" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {hasTech && (
                <section className="rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] p-5">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-[#1CB061]">
                        Tech stack
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {user.techStack.map((item) => (
                            <span
                                key={item}
                                className="rounded-[8px] border border-[var(--paper-border)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--paper-muted)]"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </aside>
    )
}

function PublicProfileSkeleton({
    showEdit,
    isGrid,
}: {
    showEdit?: boolean
    isGrid: boolean
}) {
    const listClassName = isGrid
        ? 'grid grid-cols-1 gap-3 sm:grid-cols-2'
        : 'paper-sheet-list'

    return (
        <div className="px-5 pb-12 pt-4 sm:px-8 sm:pt-5">
            <Skeleton className="h-8 w-36 rounded-[8px] bg-[var(--paper-border)]" />

            <div className="mt-5 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
                <Skeleton className="h-24 w-24 shrink-0 rounded-full bg-[var(--paper-border)]" />
                <div className="min-w-0 flex-1 space-y-3">
                    <Skeleton className="h-9 w-48 bg-[var(--paper-border)] sm:w-64" />
                    <Skeleton className="h-4 w-28 bg-[var(--paper-border)]" />
                    <Skeleton className="h-4 w-full max-w-xl bg-[var(--paper-border)]" />
                    <Skeleton className="h-4 w-2/3 max-w-md bg-[var(--paper-border)]" />
                    {showEdit && (
                        <Skeleton className="mt-1 h-10 w-44 rounded-[8px] bg-[var(--paper-border)]" />
                    )}
                </div>
            </div>

            <div className="py-8 sm:py-10">
                <Skeleton className="mb-4 h-10 w-52 rounded-[8px] bg-[var(--paper-border)]" />
                <div className={listClassName}>
                    {[...Array(isGrid ? 4 : 3)].map((_, i) => (
                        <ProjectCardSkeleton key={i} />
                    ))}
                </div>
            </div>

            <div className="grid gap-6 pb-2 lg:grid-cols-[minmax(0,1fr)_280px]">
                <ProfileActivityChart isLoading />
                <aside className="space-y-6">
                    <section className="rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] p-5">
                        <Skeleton className="h-4 w-14 bg-[var(--paper-border)]" />
                        <div className="mt-3 space-y-2">
                            <Skeleton className="h-10 w-full rounded-[8px] bg-[var(--paper-border)]" />
                            <Skeleton className="h-10 w-full rounded-[8px] bg-[var(--paper-border)]" />
                            <Skeleton className="h-10 w-full rounded-[8px] bg-[var(--paper-border)]" />
                        </div>
                    </section>
                    <section className="rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] p-5">
                        <Skeleton className="h-4 w-20 bg-[var(--paper-border)]" />
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Skeleton className="h-7 w-16 rounded-[8px] bg-[var(--paper-border)]" />
                            <Skeleton className="h-7 w-20 rounded-[8px] bg-[var(--paper-border)]" />
                            <Skeleton className="h-7 w-14 rounded-[8px] bg-[var(--paper-border)]" />
                        </div>
                    </section>
                </aside>
            </div>

            <div className="py-8">
                <section className="flex h-svh flex-col overflow-hidden rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)]">
                    <div className="flex shrink-0 items-center border-b border-[var(--paper-border)] px-5 py-3">
                        <Skeleton className="h-4 w-40 bg-[var(--paper-border)]" />
                    </div>
                    <Skeleton className="min-h-0 w-full flex-1 rounded-none bg-[var(--paper-border)]" />
                </section>
            </div>
        </div>
    )
}

export default function PublicProfilePage() {
    const params = useParams<{ username: string }>()
    const router = useRouter()
    const username = normalizeUsername(params?.username ?? '')
    const { data, isLoading, isError } = usePublicUser(username || undefined)
    const { data: builders } = useBuildersMap()
    const { data: me, isFetched } = useMe()
    const { upvote } = useListingsMutations(queryKeys.publicUser(username))
    const [profileOpen, setProfileOpen] = useState(false)
    const [projectsView, setProjectsView] = useState<ProjectsView>('grid')
    const { patchSnapshot, registerHandlers } = useVoiceSite()

    const isOwner =
        !!me?.username && !!username && me.username === username
    const isGrid = projectsView === 'grid'
    const listClassName = isGrid
        ? 'grid grid-cols-1 gap-3 sm:grid-cols-2'
        : 'paper-sheet-list'

    useEffect(() => {
        try {
            const stored = localStorage.getItem(PROJECTS_VIEW_KEY)
            if (stored === 'grid' || stored === 'list') setProjectsView(stored)
        } catch {
            // ignore storage errors
        }
    }, [])

    useEffect(() => {
        if (!data?.user) return
        patchSnapshot({
            profile: {
                username: data.user.username,
                fullName: data.user.fullName,
                isOwn: isOwner,
                state: data.user.state ?? null,
                stateName: indiaStateName(data.user.state),
                bio: data.user.bio ?? null,
                techStack: data.user.techStack ?? [],
            },
            profileEditorOpen: profileOpen,
            visibleListings: data.listings.map((l) => ({
                id: l.id,
                name: l.name,
                builderName: data.user.fullName,
                builderUsername: data.user.username,
            })),
        })
    }, [data, isOwner, profileOpen, patchSnapshot])

    useEffect(() => {
        if (!isOwner) return
        return registerHandlers({
            openProfileEditor: () => {
                setProfileOpen(true)
                return 'Opened the profile editor'
            },
        })
    }, [isOwner, registerHandlers])

    const changeProjectsView = (view: ProjectsView) => {
        setProjectsView(view)
        try {
            localStorage.setItem(PROJECTS_VIEW_KEY, view)
        } catch {
            // ignore storage errors
        }
    }

    const handleRequireAuth = () => {
        toast.error('Please log in to upvote listings')
        router.push('/signin')
    }

    const goBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back()
            return
        }
        router.push('/listings')
    }

    return (
        <AppShell showNavbar={false}>
            {isLoading ? (
                <PublicProfileSkeleton showEdit={isOwner} isGrid={isGrid} />
            ) : isError || !data ? (
                <div className="px-5 pb-10 pt-4 sm:px-8 sm:pt-5">
                    <p className="text-sm text-[var(--paper-muted)]">Profile not found.</p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={goBack}
                        className="mt-4 cursor-pointer rounded-[8px]"
                    >
                        <ArrowLeft />
                        Back
                    </Button>
                </div>
            ) : (
                <div className="px-5 pb-12 pt-4 sm:px-8 sm:pt-5">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={goBack}
                        className="cursor-pointer rounded-[8px]"
                    >
                        <ArrowLeft />
                        Back
                    </Button>

                    <div className="mt-5 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-[var(--paper-surface)]">
                            <UserAvatar
                                avatarUrl={data.user.avatarUrl}
                                seed={data.user.username}
                                size={96}
                                alt={`${data.user.fullName} avatar`}
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-3xl font-semibold tracking-tight text-white">
                                <span
                                    className="box-decoration-clone px-2.5 py-1"
                                    style={{ backgroundColor: '#E93545' }}
                                >
                                    {data.user.fullName}
                                </span>
                            </h1>
                            <p className="mt-2 text-sm text-[var(--paper-muted)]">
                                @{data.user.username}
                            </p>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--paper-ink)]">
                                {data.user.bio}
                            </p>
                            {isOwner && (
                                <button
                                    type="button"
                                    onClick={() => setProfileOpen(true)}
                                    className="mt-4 inline-flex h-10 cursor-pointer items-center gap-2 rounded-[8px] border border-[var(--paper-border)] bg-white px-4 text-sm text-[var(--paper-muted)] transition-colors hover:bg-[var(--paper-accent-soft)] hover:text-[#DA5CC7]"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit public profile
                                </button>
                            )}
                        </div>
                    </div>

                    <div id="listings" className="py-8 sm:py-10">
                        <ProjectsViewToggle
                            isGrid={isGrid}
                            onChange={changeProjectsView}
                        />
                        {data.listings.length > 0 ? (
                            <div className={listClassName}>
                                {data.listings.map((listing) => (
                                    <ProjectListingCard
                                        key={listing.id}
                                        listing={listing}
                                        isAuthenticated={isFetched && !!me}
                                        onUpvote={(id) => upvote.mutate(id)}
                                        onRequireAuth={handleRequireAuth}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-[var(--paper-muted)]">
                                No listings yet
                            </p>
                        )}
                    </div>

                    <div className="grid gap-6 pb-2 lg:grid-cols-[minmax(0,1fr)_280px]">
                        <ProfileActivityChart data={data.activity} />
                        <ProfileSidebar user={data.user} />
                    </div>

                    <div className="py-8">
                        <IndiaBuildersMap
                            builders={builders ?? []}
                            highlightUsername={data.user.username}
                            highlightState={data.user.state}
                        />
                    </div>

                    {me && isOwner && (
                        <PublicProfileDrawer
                            user={me}
                            open={profileOpen}
                            onOpenChange={setProfileOpen}
                        />
                    )}
                </div>
            )}
        </AppShell>
    )
}
