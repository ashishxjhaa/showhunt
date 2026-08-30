import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryKeys, listingsKey, type ListingsFilters } from './keys'
import type { ListingsResponse, User } from './types'

export function useListings(filters?: ListingsFilters) {
    const params = new URLSearchParams()
    if (filters?.tag) params.set('tag', filters.tag)
    const q = filters?.q?.trim()
    if (q) params.set('q', q)
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
