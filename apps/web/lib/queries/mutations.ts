import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { sortByTrending } from '@/lib/ranking'
import { queryKeys } from './keys'
import type { ListingsResponse, ListingInput, EnrichedMetadata, User, Listing, ListingComment, PublicProfileInput, PublicProfileResponse } from './types'

type ListingListKey = readonly unknown[]

function toggleListingUpvote(listing: Listing): Listing {
    return {
        ...listing,
        hasUpvoted: !listing.hasUpvoted,
        upvotes: listing.upvotes + (listing.hasUpvoted ? -1 : 1),
    }
}

/** Patch a listing inside every cached feed (paginated lists + mine). Immediate UI sync. */
function patchListingInListCaches(
    queryClient: QueryClient,
    listingId: string,
    patch: (listing: Listing) => Listing
) {
    queryClient.setQueriesData<ListingsResponse>(
        { queryKey: queryKeys.listings },
        (previous) => {
            if (!previous?.listings) return previous
            return {
                ...previous,
                listings: previous.listings.map((l) =>
                    l.id === listingId ? patch(l) : l
                ),
            }
        }
    )
    queryClient.setQueriesData<ListingsResponse>(
        { queryKey: queryKeys.myListings },
        (previous) => {
            if (!previous?.listings) return previous
            return {
                ...previous,
                listings: previous.listings.map((l) =>
                    l.id === listingId ? patch(l) : l
                ),
            }
        }
    )
    queryClient.setQueriesData<PublicProfileResponse>(
        { queryKey: ['user'] },
        (previous) => {
            if (!previous?.listings) return previous
            return {
                ...previous,
                listings: previous.listings.map((l) =>
                    l.id === listingId ? patch(l) : l
                ),
            }
        }
    )
}

function useOptimisticUpvote(
    queryKey: ListingListKey,
    options?: { invalidateKeys?: ListingListKey[] }
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (listingId: string) => {
            const res = await api.post<{ upvoted: boolean }>(
                `/api/v1/listings/${listingId}/upvote`
            )
            return res.data
        },
        onMutate: async (listingId) => {
            await queryClient.cancelQueries({ queryKey })

            const previous = queryClient.getQueryData<{ listings: Listing[] }>(queryKey)
            if (!previous) return { previous: undefined }

            const listings = previous.listings.map((l) =>
                listingId === l.id ? toggleListingUpvote(l) : l
            )

            queryClient.setQueryData(queryKey, {
                ...previous,
                listings:
                    queryKey === queryKeys.listings
                        ? sortByTrending(listings)
                        : listings,
            })

            // Keep detail cache in sync when upvoting from the feed.
            const detail = queryClient.getQueryData<Listing>(queryKeys.listing(listingId))
            if (detail) {
                queryClient.setQueryData<Listing>(
                    queryKeys.listing(listingId),
                    toggleListingUpvote(detail)
                )
            }

            return { previous }
        },
        onError: (_err, listingId, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous)
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.listing(listingId) })
        },
        onSettled: (_data, _err, listingId) => {
            // Soft background refresh — optimistic data already shown.
            queryClient.invalidateQueries({ queryKey })
            queryClient.invalidateQueries({ queryKey: queryKeys.listing(listingId) })
            queryClient.invalidateQueries({ queryKey: ['user'] })
            options?.invalidateKeys?.forEach((key) => {
                queryClient.invalidateQueries({ queryKey: key })
            })
        },
    })
}

export function useListingsMutations(activeKey?: ListingListKey) {
    const upvote = useOptimisticUpvote(activeKey ?? queryKeys.listings)
    return { upvote }
}

export function useListingUpvote(listingId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const res = await api.post<{ upvoted: boolean }>(
                `/api/v1/listings/${listingId}/upvote`
            )
            return res.data
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: queryKeys.listing(listingId) })
            await queryClient.cancelQueries({ queryKey: queryKeys.listings })

            const previousDetail = queryClient.getQueryData<Listing>(
                queryKeys.listing(listingId)
            )
            const previousLists = queryClient.getQueriesData<ListingsResponse>({
                queryKey: queryKeys.listings,
            })
            const previousMine = queryClient.getQueryData<ListingsResponse>(
                queryKeys.myListings
            )

            if (previousDetail) {
                queryClient.setQueryData<Listing>(
                    queryKeys.listing(listingId),
                    toggleListingUpvote(previousDetail)
                )
            }
            patchListingInListCaches(queryClient, listingId, toggleListingUpvote)

            return { previousDetail, previousLists, previousMine }
        },
        onError: (_err, _vars, context) => {
            if (context?.previousDetail) {
                queryClient.setQueryData(
                    queryKeys.listing(listingId),
                    context.previousDetail
                )
            }
            context?.previousLists?.forEach(([key, data]) => {
                queryClient.setQueryData(key, data)
            })
            if (context?.previousMine) {
                queryClient.setQueryData(queryKeys.myListings, context.previousMine)
            }
        },
        onSettled: () => {
            // Background reconcile only — UI already updated optimistically.
            queryClient.invalidateQueries({ queryKey: queryKeys.listing(listingId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.listings })
            queryClient.invalidateQueries({ queryKey: queryKeys.myListings })
            queryClient.invalidateQueries({ queryKey: ['user'] })
        },
    })
}

export function useUploadListing() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: ListingInput) => {
            await api.post('/api/v1/listings', data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.myListings })
            queryClient.invalidateQueries({ queryKey: queryKeys.listings })
        },
    })
}

export function useUpdateListing() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: ListingInput }) => {
            await api.patch(`/api/v1/listings/${id}`, data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.myListings })
            queryClient.invalidateQueries({ queryKey: queryKeys.listings })
        },
    })
}

export function useDeleteListing() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (listingId: string) => {
            await api.delete(`/api/v1/listings/${listingId}`)
        },
        onMutate: async (listingId) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.myListings })
            const previous = queryClient.getQueryData<ListingsResponse>(queryKeys.myListings)
            if (previous) {
                queryClient.setQueryData<ListingsResponse>(queryKeys.myListings, {
                    ...previous,
                    listings: previous.listings.filter((l) => l.id !== listingId),
                })
            }
            return { previous }
        },
        onError: (_err, _listingId, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.myListings, context.previous)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.myListings })
            queryClient.invalidateQueries({ queryKey: queryKeys.listings })
        },
    })
}

export function useEnrichListing() {
    return useMutation({
        mutationFn: async (url: string) => {
            const res = await api.post<EnrichedMetadata>('/api/v1/listings/enrich', { url })
            return res.data
        },
    })
}

export function useUpdateAvatar() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (avatarUrl: string) => {
            const res = await api.patch<{ user: User }>('/api/v1/auth/avatar', { avatarUrl })
            return res.data.user
        },
        onSuccess: (user) => {
            queryClient.setQueryData(queryKeys.me, user)
        },
    })
}

export function useUpdatePublicProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: PublicProfileInput) => {
            const res = await api.put<{ user: User }>('/api/v1/auth/public-profile', data)
            return res.data.user
        },
        onSuccess: (user) => {
            queryClient.setQueryData(queryKeys.me, user)
            if (user.username) {
                queryClient.invalidateQueries({ queryKey: queryKeys.publicUser(user.username) })
            }
        },
    })
}

export function useCreateComment(listingId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (content: string) => {
            const res = await api.post<{ comment: ListingComment }>(
                `/api/v1/listings/${listingId}/comments`,
                { content }
            )
            return res.data.comment
        },
        onSuccess: (comment) => {
            queryClient.setQueryData<ListingComment[]>(
                queryKeys.comments(listingId),
                (prev) => (prev ? [comment, ...prev] : [comment])
            )
            queryClient.setQueryData<Listing>(queryKeys.listing(listingId), (prev) =>
                prev ? { ...prev, comments: prev.comments + 1 } : prev
            )
            queryClient.invalidateQueries({ queryKey: queryKeys.listings })
            queryClient.invalidateQueries({ queryKey: queryKeys.myListings })
        },
    })
}

export function useLogout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            await api.post('/api/v1/auth/signout')
        },
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: queryKeys.me })
            queryClient.removeQueries({ queryKey: queryKeys.myListings })
            queryClient.invalidateQueries({ queryKey: queryKeys.listings })
        },
    })
}
