'use client'

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useProjectStore } from "@/lib/store"
import { sortByTrending } from "@/lib/ranking"
import { ProjectCardSkeleton } from "./ProjectCardSkeleton"
import ProjectListingCard, { type ListingProject } from "./ProjectListingCard"

interface ListingsPageProps {
    searchQuery: string
    isAuthenticated: boolean
}

const ListingsPage = ({ searchQuery, isAuthenticated }: ListingsPageProps) => {
    const [projects, setProjects] = useState<ListingProject[]>([])
    const [loading, setLoading] = useState(true)
    const { setProjects: setGlobalProjects, updateProject } = useProjectStore()
    const router = useRouter()

    useEffect(() => {
        axios.get('/api/listings').then(res => {
            setProjects(res.data.projects)
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
        <div className="py-15 mt-10">
            {loading ? (
                <div className="bg-gray-300 dark:bg-neutral-700 rounded-md px-3 py-3.5 grid gap-3 mx-4 sm:mx-12">
                    {[...Array(5)].map((_, i) => (
                        <ProjectCardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredProjects.length > 0 ? (
                <div className="bg-gray-300 dark:bg-neutral-700 rounded-md px-3 py-3.5 grid gap-3 mx-4 sm:mx-12">
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
                <p className="text-center text-black dark:text-white opacity-85">
                    No projects match your search.
                </p>
            ) : (
                <p className="text-center text-black dark:text-white opacity-85">No projects yet</p>
            )}
        </div>
    )
}

export default ListingsPage
