import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { sortByTrending } from '@/lib/ranking'
import { queryKeys } from './keys'
import type { ListingsResponse, ListingInput, EnrichedMetadata, User, Listing, ListingComment } from './types'

type ListingListKey = readonly unknown[]

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
            const previous = queryClient.getQueryData<Listing>(queryKeys.listing(listingId))
            if (previous) {
                queryClient.setQueryData<Listing>(queryKeys.listing(listingId), {
                    ...previous,
                    hasUpvoted: !previous.hasUpvoted,
                    upvotes: previous.upvotes + (previous.hasUpvoted ? -1 : 1),
                })
            }
            return { previous }
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.listing(listingId), context.previous)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.listing(listingId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.listings })
            queryClient.invalidateQueries({ queryKey: queryKeys.myListings })
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
