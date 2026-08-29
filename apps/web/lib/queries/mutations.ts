import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { sortByTrending } from '@/lib/ranking'
import { queryKeys } from './keys'
import type { Listing, ListingsResponse, ListingInput, EnrichedMetadata } from './types'

type ListingListKey = typeof queryKeys.listings | typeof queryKeys.myListings

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

            const previous = queryClient.getQueryData<ListingsResponse>(queryKey)
            if (!previous) return { previous: undefined }

            const listings = previous.listings.map((l) =>
                l.id === listingId
                    ? {
                          ...l,
                          hasUpvoted: !l.hasUpvoted,
                          upvotes: l.upvotes + (l.hasUpvoted ? -1 : 1),
                      }
                    : l
            )

            if (queryKey === queryKeys.listings) {
                queryClient.setQueryData<ListingsResponse>(queryKey, {
                    listings: sortByTrending(listings),
                })
            } else {
                queryClient.setQueryData<ListingsResponse>(queryKey, { listings })
            }

            return { previous }
        },
        onError: (_err, _listingId, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
            options?.invalidateKeys?.forEach((key) => {
                queryClient.invalidateQueries({ queryKey: key })
            })
        },
    })
}

export function useListingsMutations() {
    const upvote = useOptimisticUpvote(queryKeys.listings)
    return { upvote }
}

export function useProfileMutations() {
    const upvote = useOptimisticUpvote(queryKeys.myListings, {
        invalidateKeys: [queryKeys.listings],
    })
    return { upvote }
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

export function useEnrichListing() {
    return useMutation({
        mutationFn: async (url: string) => {
            const res = await api.post<EnrichedMetadata>('/api/v1/listings/enrich', { url })
            return res.data
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
        },
    })
}
