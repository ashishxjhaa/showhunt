'use client'

import { useMemo } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useListings } from "@/lib/queries/hooks"
import { useListingsMutations } from "@/lib/queries/mutations"
import { ProjectCardSkeleton } from "./ProjectCardSkeleton"
import ProjectListingCard from "./ProjectListingCard"

interface ListingsPageProps {
    searchQuery: string
    isAuthenticated: boolean
}

const ListingsPage = ({ searchQuery, isAuthenticated }: ListingsPageProps) => {
    const { data, isLoading } = useListings()
    const { upvote, heart, save } = useListingsMutations()
    const router = useRouter()

    const projects = data?.projects ?? []

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

    return (
        <div className="py-15 mt-10">
            {isLoading ? (
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
                            onUpvote={(id) => upvote.mutate(id)}
                            onHeart={(id) => heart.mutate(id)}
                            onSave={(id) => save.mutate(id)}
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
