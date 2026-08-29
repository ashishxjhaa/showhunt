import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryKeys } from './keys'
import type { ListingsResponse, Listing, User } from './types'

export function useListings() {
    return useQuery({
        queryKey: queryKeys.listings,
        queryFn: async () => {
            const res = await api.get<ListingsResponse>('/api/v1/listings')
            return res.data
        },
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
