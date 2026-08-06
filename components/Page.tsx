'use client'

import { ArrowBigUp, Bookmark, Heart, Layers, User } from "lucide-react"
import { useMemo } from "react"
import UploadProject from "./UploadProject"
import { useMe, useProfileProjects } from "@/lib/queries/hooks"
import { useProfileMutations } from "@/lib/queries/mutations"
import { ProjectCardSkeleton } from "./ProjectCardSkeleton"
import ProjectListingCard from "./ProjectListingCard"
import type { Project } from "@/lib/queries/types"

function computeStats(projects: Project[]) {
    return {
        projects: projects.length,
        upvotes: projects.reduce((sum, p) => sum + p.upvotes, 0),
        hearts: projects.reduce((sum, p) => sum + p.hearts, 0),
        saves: projects.reduce((sum, p) => sum + p.saves, 0),
    }
}

const statCards = [
    { key: "projects", label: "Projects", icon: Layers, sub: "Time to build more!" },
    { key: "upvotes", label: "Upvotes", icon: ArrowBigUp, sub: "Dedication level: Good" },
    { key: "hearts", label: "Hearts", icon: Heart, sub: "Time to learn more!" },
    { key: "saves", label: "Saved", icon: Bookmark, sub: "Start listing more project" },
] as const

const Page = () => {
    const { data: user } = useMe()
    const { data, isLoading } = useProfileProjects()
    const { upvote, heart, save } = useProfileMutations()

    const projects = data?.projects ?? []
    const stats = useMemo(() => computeStats(projects), [projects])

    const initials = user?.fullName.split(' ').map(n => n[0]).join('').toUpperCase() ?? ''
    const formattedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : ''

  return (
    <div>
        <div className="flex flex-col items-start gap-6 border-b border-[var(--app-rail-color)] p-5 sm:flex-row sm:items-center sm:gap-10 sm:p-8">
            <div className="relative shrink-0">
                <div className="absolute -inset-[5px] rounded-full bg-gradient-to-r from-[#FF8162] to-[#FEB57F] opacity-75 blur-sm" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[var(--paper-surface)] text-2xl font-medium text-[var(--paper-ink)] ring-2 ring-[var(--paper-border)]">
                    {initials}
                </div>
            </div>

            <div className="flex-1">
                <h1 className="text-3xl font-semibold tracking-tight text-[#FF8162]">{user?.fullName ?? ''}</h1>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--paper-muted)]">
                    <span className="flex items-center gap-2">
                        <User size={16} />
                        Joined {formattedDate}
                    </span>
                </div>
            </div>
            <UploadProject />
        </div>

        <div className="grid grid-cols-1 gap-4 border-b border-[var(--app-rail-color)] p-5 sm:grid-cols-2 sm:p-8 md:grid-cols-4">
            {statCards.map(({ key, label, icon: Icon, sub }) => (
                <div key={key} className="paper-sheet-static p-5">
                    <div className="mb-2 flex items-center gap-2 text-[var(--paper-muted)]">
                        <Icon size={16} />
                        <span className="text-sm tracking-wide">{label}</span>
                    </div>
                    <p className="text-2xl font-semibold text-[var(--paper-ink)]">
                        {key === "upvotes" ? `${stats.upvotes} vote${stats.upvotes !== 1 ? "s" : ""}` : stats[key]}
                    </p>
                    <p className="mt-2 text-xs tracking-wide text-[var(--paper-muted)] opacity-70">{sub}</p>
                </div>
            ))}
        </div>

        <div className="px-5 py-8 sm:px-8 sm:py-10">
            <h2 className="pb-4 text-2xl font-semibold tracking-tight text-[#FF8162] sm:text-3xl">My Projects</h2>
            {isLoading ? (
                <div className="paper-sheet-list">
                    {[...Array(3)].map((_, i) => (
                        <ProjectCardSkeleton key={i} />
                    ))}
                </div>
            ) : projects.length > 0 ? (
                <div className="paper-sheet-list">
                    {projects.map((p: Project) => (
                        <ProjectListingCard
                            key={p.id}
                            project={p}
                            isAuthenticated
                            onUpvote={(id) => upvote.mutate(id)}
                            onHeart={(id) => heart.mutate(id)}
                            onSave={(id) => save.mutate(id)}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-[var(--paper-muted)]">No projects yet</p>
            )}
        </div>
    </div>
  )
}

export default Page
