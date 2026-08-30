'use client'

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useListings, useTags } from "@/lib/queries/hooks"
import { useListingsMutations } from "@/lib/queries/mutations"
import { listingsKey } from "@/lib/queries/keys"
import { sortByTrending } from "@/lib/ranking"
import { cn } from "@/lib/utils"
import { ProjectCardSkeleton } from "./ProjectCardSkeleton"
import ProjectListingCard from "./ProjectListingCard"

interface ListingsPageProps {
    searchQuery: string
    isAuthenticated: boolean
}

const ListingsPage = ({ searchQuery, isAuthenticated }: ListingsPageProps) => {
    const router = useRouter()
    const [activeTag, setActiveTag] = useState<string | null>(null)
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const filters = useMemo(
        () => ({ tag: activeTag, q: debouncedQuery }),
        [activeTag, debouncedQuery]
    )
    const { data, isLoading } = useListings(filters)
    const { upvote } = useListingsMutations(listingsKey(filters))
    const { data: curatedTags } = useTags()

    const isFiltered = !!activeTag || !!debouncedQuery.trim()
    const visibleListings = useMemo(() => {
        const listings = data?.listings ?? []
        return isFiltered ? listings : sortByTrending(listings)
    }, [data, isFiltered])

    const handleRequireAuth = () => {
        toast.error("Please log in to upvote listings")
        router.push("/signin")
    }

    return (
        <div className="px-5 pb-8 pt-4 sm:px-8 sm:pb-10 sm:pt-5">
            <div className="mb-6 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[null, ...(curatedTags ?? [])].map((tag) => (
                    <button
                        key={tag ?? 'all'}
                        type="button"
                        onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                        className={cn(
                            'shrink-0 rounded-[8px] border px-3 py-1.5 text-sm transition-colors',
                            activeTag === tag
                                ? 'border-[#DA5CC7] bg-[var(--paper-accent-soft)] font-medium text-[#C431AE]'
                                : 'border-[var(--paper-border)] bg-white text-[var(--paper-muted)] hover:border-[#DA5CC7]/50'
                        )}
                    >
                        {tag ?? 'All'}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="grid gap-3">
                    {[...Array(5)].map((_, i) => (
                        <ProjectCardSkeleton key={i} />
                    ))}
                </div>
            ) : visibleListings.length > 0 ? (
                <div className="grid gap-3">
                    {visibleListings.map((l) => (
                        <ProjectListingCard
                            key={l.id}
                            listing={l}
                            isAuthenticated={isAuthenticated}
                            onUpvote={(id) => upvote.mutate(id)}
                            onRequireAuth={handleRequireAuth}
                        />
                    ))}
                </div>
            ) : isFiltered ? (
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
