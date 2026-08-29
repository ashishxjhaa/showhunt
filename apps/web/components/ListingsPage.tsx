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
    const { upvote } = useListingsMutations()
    const router = useRouter()

    const listings = data?.listings ?? []

    const filteredListings = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return listings

        return listings.filter((l) => {
            const inName = l.name.toLowerCase().includes(query)
            const inDescription = l.description.toLowerCase().includes(query)
            const inTags = l.tags.some((tag) => tag.toLowerCase().includes(query))
            const inMaker = l.user.fullName.toLowerCase().includes(query)
            return inName || inDescription || inTags || inMaker
        })
    }, [listings, searchQuery])

    const handleRequireAuth = () => {
        toast.error("Please log in to upvote listings")
        router.push("/signin")
    }

    return (
        <div className="px-5 py-8 sm:px-8 sm:py-10">
            {isLoading ? (
                <div className="paper-sheet-list">
                    {[...Array(5)].map((_, i) => (
                        <ProjectCardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredListings.length > 0 ? (
                <div className="paper-sheet-list">
                    {filteredListings.map((l, index) => (
                        <ProjectListingCard
                            key={l.id}
                            listing={l}
                            rank={searchQuery.trim() ? undefined : index + 1}
                            isAuthenticated={isAuthenticated}
                            onUpvote={(id) => upvote.mutate(id)}
                            onRequireAuth={handleRequireAuth}
                        />
                    ))}
                </div>
            ) : listings.length > 0 ? (
                <p className="text-center text-[var(--paper-muted)]">
                    No listings match your search.
                </p>
            ) : (
                <p className="text-center text-[var(--paper-muted)]">No listings yet</p>
            )}
        </div>
    )
}

export default ListingsPage
