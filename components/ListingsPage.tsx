'use client'

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useProjectStore } from "@/lib/store"
import { sortByTrending } from "@/lib/ranking"
import { ProjectCardSkeleton } from "./ProjectCardSkeleton"
import ProjectListingCard, { type ListingProject } from "./ProjectListingCard"

interface FeedStats {
    totalProjects: number
    totalUpvotes: number
    totalHearts: number
    totalSaves: number
}

interface ListingsPageProps {
    searchQuery: string
    isAuthenticated: boolean
}

const ListingsPage = ({ searchQuery, isAuthenticated }: ListingsPageProps) => {
    const [projects, setProjects] = useState<ListingProject[]>([])
    const [stats, setStats] = useState<FeedStats>({
        totalProjects: 0,
        totalUpvotes: 0,
        totalHearts: 0,
        totalSaves: 0,
    })
    const [loading, setLoading] = useState(true)
    const { setProjects: setGlobalProjects, updateProject } = useProjectStore()
    const router = useRouter()

    useEffect(() => {
        axios.get('/api/listings').then(res => {
            setProjects(res.data.projects)
            setStats(res.data.stats)
            setGlobalProjects(res.data.projects)
            setLoading(false)
        }).catch(() => {
            setLoading(false)
        })
    }, [setGlobalProjects])

    const filteredProjects = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return projects

        return projects.filter((p) => {
            const inName = p.name.toLowerCase().includes(query)
            const inDescription = p.description.toLowerCase().includes(query)
            const inTags = p.tags.some((tag) => tag.toLowerCase().includes(query))
            const inMaker = p.user.fullName.toLowerCase().includes(query)
            return inName || inDescription || inTags || inMaker
        })
    }, [projects, searchQuery])

    const handleRequireAuth = () => {
        toast.error("Please log in to engage with projects")
        router.push("/signin")
    }

    const handleUpvote = async (projectId: string) => {
        const project = projects.find(p => p.id === projectId)!
        const optimisticUpdate = {
            hasUpvoted: !project.hasUpvoted,
            upvotes: project.upvotes + (project.hasUpvoted ? -1 : 1),
        }

        setProjects(prev => sortByTrending(
            prev.map(p => p.id === projectId ? { ...p, ...optimisticUpdate } : p)
        ))
        updateProject(projectId, optimisticUpdate)

        try {
            await axios.post(`/api/projects/${projectId}/upvote`)
        } catch (error) {
            setProjects(prev => sortByTrending(
                prev.map(p => p.id === projectId ? project : p)
            ))
            updateProject(projectId, { hasUpvoted: project.hasUpvoted, upvotes: project.upvotes })
            console.log(error)
        }
    }

    const handleHeart = async (projectId: string) => {
        const project = projects.find(p => p.id === projectId)!
        const optimisticUpdate = {
            hasHearted: !project.hasHearted,
            hearts: project.hearts + (project.hasHearted ? -1 : 1),
        }

        setProjects(prev => sortByTrending(
            prev.map(p => p.id === projectId ? { ...p, ...optimisticUpdate } : p)
        ))
        updateProject(projectId, optimisticUpdate)

        try {
            await axios.post(`/api/projects/${projectId}/heart`)
        } catch (error) {
            setProjects(prev => sortByTrending(
                prev.map(p => p.id === projectId ? project : p)
            ))
            updateProject(projectId, { hasHearted: project.hasHearted, hearts: project.hearts })
            console.log(error)
        }
    }

    const handleSave = async (projectId: string) => {
        const project = projects.find(p => p.id === projectId)!
        const optimisticUpdate = {
            hasSaved: !project.hasSaved,
            saves: project.saves + (project.hasSaved ? -1 : 1),
        }

        setProjects(prev => sortByTrending(
            prev.map(p => p.id === projectId ? { ...p, ...optimisticUpdate } : p)
        ))
        updateProject(projectId, optimisticUpdate)
        toast.success(optimisticUpdate.hasSaved ? 'Project saved!' : 'Project unsaved')

        try {
            await axios.post(`/api/projects/${projectId}/save`)
        } catch (error) {
            setProjects(prev => sortByTrending(
                prev.map(p => p.id === projectId ? project : p)
            ))
            updateProject(projectId, { hasSaved: project.hasSaved, saves: project.saves })
            console.log(error)
        }
    }

    return (
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
            <header className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                    Discover projects
                </h1>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 sm:text-base">
                    Explore products from developers and founders. Ranked by community engagement.
                </p>

                {!loading && stats.totalProjects > 0 && (
                    <div className="mt-5 flex flex-wrap gap-3">
                        <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900/60">
                            <span className="text-neutral-500 dark:text-neutral-400">Projects </span>
                            <span className="font-semibold tabular-nums text-neutral-900 dark:text-white">{stats.totalProjects}</span>
                        </div>
                        <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900/60">
                            <span className="text-neutral-500 dark:text-neutral-400">Upvotes </span>
                            <span className="font-semibold tabular-nums text-neutral-900 dark:text-white">{stats.totalUpvotes}</span>
                        </div>
                        <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900/60">
                            <span className="text-neutral-500 dark:text-neutral-400">Hearts </span>
                            <span className="font-semibold tabular-nums text-neutral-900 dark:text-white">{stats.totalHearts}</span>
                        </div>
                        <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900/60">
                            <span className="text-neutral-500 dark:text-neutral-400">Saves </span>
                            <span className="font-semibold tabular-nums text-neutral-900 dark:text-white">{stats.totalSaves}</span>
                        </div>
                    </div>
                )}
            </header>

            {loading ? (
                <div className="grid gap-4">
                    {[...Array(5)].map((_, i) => (
                        <ProjectCardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredProjects.length > 0 ? (
                <div className="grid gap-4">
                    {filteredProjects.map((p, index) => (
                        <ProjectListingCard
                            key={p.id}
                            project={p}
                            rank={searchQuery.trim() ? undefined : index + 1}
                            isAuthenticated={isAuthenticated}
                            onUpvote={handleUpvote}
                            onHeart={handleHeart}
                            onSave={handleSave}
                            onRequireAuth={handleRequireAuth}
                        />
                    ))}
                </div>
            ) : projects.length > 0 ? (
                <p className="text-center text-neutral-600 dark:text-neutral-400">
                    No projects match your search.
                </p>
            ) : (
                <p className="text-center text-neutral-600 dark:text-neutral-400">
                    No projects yet. Be the first to list yours.
                </p>
            )}
        </div>
    )
}

export default ListingsPage
