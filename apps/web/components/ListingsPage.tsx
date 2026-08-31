'use client'

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useListings, useTags } from "@/lib/queries/hooks"
import { useListingsMutations } from "@/lib/queries/mutations"
import { listingsKey } from "@/lib/queries/keys"
import { cn } from "@/lib/utils"
import { ProjectCardSkeleton } from "./ProjectCardSkeleton"
import ProjectListingCard from "./ProjectListingCard"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface ListingsPageProps {
    searchQuery: string
    isAuthenticated: boolean
}

function buildPageItems(current: number, total: number): (number | "ellipsis")[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1)
    }

    const items: (number | "ellipsis")[] = [1]

    if (current > 3) items.push("ellipsis")

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let p = start; p <= end; p++) items.push(p)

    if (current < total - 2) items.push("ellipsis")

    items.push(total)
    return items
}

const ListingsPage = ({ searchQuery, isAuthenticated }: ListingsPageProps) => {
    const router = useRouter()
    const [activeTag, setActiveTag] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    useEffect(() => {
        setPage(1)
    }, [activeTag, debouncedQuery])

    const filters = useMemo(
        () => ({ tag: activeTag, q: debouncedQuery, page }),
        [activeTag, debouncedQuery, page]
    )
    const { data, isLoading } = useListings(filters)
    const { upvote } = useListingsMutations(listingsKey(filters))
    const { data: curatedTags } = useTags()

    const visibleListings = data?.listings ?? []
    const totalPages = data?.totalPages ?? 1
    const isFiltered = !!activeTag || !!debouncedQuery.trim()

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
                <>
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

                    {totalPages > 1 && (
                        <Pagination className="mt-8">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        className={cn(
                                            page <= 1 && "pointer-events-none opacity-50"
                                        )}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            if (page > 1) setPage(page - 1)
                                        }}
                                    />
                                </PaginationItem>

                                {buildPageItems(page, totalPages).map((item, idx) =>
                                    item === "ellipsis" ? (
                                        <PaginationItem key={`ellipsis-${idx}`}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={item}>
                                            <PaginationLink
                                                href="#"
                                                isActive={item === page}
                                                className={cn(
                                                    item === page &&
                                                        "border-[var(--paper-border)]"
                                                )}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    setPage(item)
                                                }}
                                            >
                                                {item}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        className={cn(
                                            page >= totalPages &&
                                                "pointer-events-none opacity-50"
                                        )}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            if (page < totalPages) setPage(page + 1)
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
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
