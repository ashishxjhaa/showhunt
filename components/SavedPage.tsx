'use client'

import { useSaved } from "@/lib/queries/hooks"
import { useSavedMutations } from "@/lib/queries/mutations"
import { ProjectCardSkeleton } from "./ProjectCardSkeleton"
import ProjectListingCard from "./ProjectListingCard"
import type { Project } from "@/lib/queries/types"

const SavedPage = () => {
    const { data, isLoading } = useSaved()
    const { upvote, heart, unsave } = useSavedMutations()

    const projects = data?.projects ?? []

    return (
        <div className="px-5 py-8 sm:px-8 sm:py-10">
            <h2 className="text-2xl font-semibold tracking-tight text-[#FF8162] sm:text-3xl">Saved Projects</h2>
            <p className="mt-1 mb-6 text-sm text-[var(--paper-muted)]">Projects you bookmarked for later.</p>
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
                            onSave={(id) => unsave.mutate(id)}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-[var(--paper-muted)]">No saved projects</p>
            )}
        </div>
    )
}

export default SavedPage
