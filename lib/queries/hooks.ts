import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { queryKeys } from './keys'
import type { ListingsResponse, ProfileProjectsResponse, SavedResponse, User } from './types'

export function useListings() {
    return useQuery({
        queryKey: queryKeys.listings,
        queryFn: async () => {
            const res = await axios.get<ListingsResponse>('/api/listings')
            return res.data
        },
    })
}

export function useSaved() {
    return useQuery({
        queryKey: queryKeys.saved,
        queryFn: async () => {
            const res = await axios.get<SavedResponse>('/api/saved')
            return res.data
        },
    })
}

export function useProfileProjects() {
    return useQuery({
        queryKey: queryKeys.profileProjects,
        queryFn: async () => {
            const res = await axios.get<ProfileProjectsResponse>('/api/uploadproject')
            return res.data
        },
        refetchInterval: 15000,
    })
}

export function useMe() {
    return useQuery({
        queryKey: queryKeys.me,
        queryFn: async () => {
            const res = await axios.get<{ user: User }>('/api/me')
            return res.data.user
        },
        retry: false,
    })
}
