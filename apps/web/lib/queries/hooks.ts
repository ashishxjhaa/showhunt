import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryKeys, listingsKey, type ListingsFilters } from './keys'
import type { Listing, ListingComment, ListingsResponse, User, ActivityDay, PublicProfileResponse } from './types'

export function useListings(filters?: ListingsFilters) {
    const params = new URLSearchParams()
    if (filters?.tag) params.set('tag', filters.tag)
    const q = filters?.q?.trim()
    if (q) params.set('q', q)
    const page = filters?.page ?? 1
    params.set('page', String(page))
    params.set('limit', '10')
    const qs = params.toString()

    return useQuery({
        queryKey: listingsKey(filters),
        queryFn: async () => {
            const res = await api.get<ListingsResponse>(
                `/api/v1/listings${qs ? `?${qs}` : ''}`
            )
            return res.data
        },
    })
}

export function useListing(id: string | undefined) {
    return useQuery({
        queryKey: queryKeys.listing(id ?? ''),
        enabled: !!id,
        queryFn: async () => {
            const res = await api.get<{ listing: Listing }>(`/api/v1/listings/${id}`)
            return res.data.listing
        },
    })
}

export function useSimilarListings(id: string | undefined) {
    return useQuery({
        queryKey: [...queryKeys.listing(id ?? ''), 'similar'] as const,
        enabled: !!id,
        queryFn: async () => {
            const res = await api.get<{ listings: Listing[] }>(
                `/api/v1/listings/${id}/similar`
            )
            return res.data.listings
        },
    })
}

export function useComments(listingId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.comments(listingId ?? ''),
        enabled: !!listingId,
        queryFn: async () => {
            const res = await api.get<{ comments: ListingComment[] }>(
                `/api/v1/listings/${listingId}/comments`
            )
            return res.data.comments
        },
    })
}

export function useTags() {
    return useQuery({
        queryKey: queryKeys.tags,
        queryFn: async () => {
            const res = await api.get<{ tags: string[] }>('/api/v1/listings/tags')
            return res.data.tags
        },
        staleTime: Infinity,
    })
}

export function useMyListings() {
    return useQuery({
        queryKey: queryKeys.myListings,
        queryFn: async () => {
            const res = await api.get<ListingsResponse>('/api/v1/listings/mine')
            return res.data
        },
        refetchInterval: 15000,
    })
}

export function useMyActivity() {
    return useQuery({
        queryKey: queryKeys.myActivity,
        queryFn: async () => {
            const res = await api.get<{ activity: ActivityDay[] }>('/api/v1/auth/activity')
            return res.data.activity
        },
    })
}

export function useMe() {
    return useQuery({
        queryKey: queryKeys.me,
        queryFn: async () => {
            const res = await api.get<{ user: User }>('/api/v1/auth/me')
            return res.data.user
        },
        retry: false,
    })
}

export function usePublicUser(username: string | undefined) {
    return useQuery({
        queryKey: queryKeys.publicUser(username ?? ''),
        enabled: !!username,
        queryFn: async () => {
            const res = await api.get<PublicProfileResponse>(
                `/api/v1/users/${encodeURIComponent(username ?? '')}`
            )
            return res.data
        },
        retry: false,
    })
}
