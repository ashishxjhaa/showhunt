import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { sortByTrending } from '@/lib/ranking'
import { queryKeys } from './keys'
import type { Project, SavedResponse } from './types'

type ProjectListKey = typeof queryKeys.listings | typeof queryKeys.saved | typeof queryKeys.profileProjects

function updateProjectInList(projects: Project[], projectId: string, updates: Partial<Project>) {
    return projects.map(p => p.id === projectId ? { ...p, ...updates } : p)
}

function useOptimisticProjectMutation(
    queryKey: ProjectListKey,
    getUpdates: (project: Project) => Partial<Project>,
    endpoint: (projectId: string) => string,
    options?: {
        sortAfterUpdate?: boolean
        onOptimistic?: (projects: Project[], projectId: string, updates: Partial<Project>) => Project[]
        invalidateKeys?: (typeof queryKeys)[keyof typeof queryKeys][]
        showSaveToast?: boolean
    }
) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (projectId: string) => {
            await axios.post(endpoint(projectId))
            return projectId
        },
        onMutate: async (projectId) => {
            await queryClient.cancelQueries({ queryKey })

            const previous = queryClient.getQueryData<{ projects: Project[] }>(queryKey)
            if (!previous) return { previous }

            const project = previous.projects.find(p => p.id === projectId)
            if (!project) return { previous }

            const updates = getUpdates(project)
            let nextProjects = updateProjectInList(previous.projects, projectId, updates)

            if (options?.onOptimistic) {
                nextProjects = options.onOptimistic(previous.projects, projectId, updates)
            } else if (options?.sortAfterUpdate) {
                nextProjects = sortByTrending(nextProjects)
            }

            queryClient.setQueryData(queryKey, { ...previous, projects: nextProjects })

            if (options?.showSaveToast) {
                toast.success(updates.hasSaved ? 'Project saved!' : 'Project unsaved')
            }

            return { previous }
        },
        onError: (_err, _projectId, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
            options?.invalidateKeys?.forEach(key => {
                queryClient.invalidateQueries({ queryKey: key })
            })
        },
    })
}

export function useListingsMutations() {
    const upvote = useOptimisticProjectMutation(
        queryKeys.listings,
        (project) => ({
            hasUpvoted: !project.hasUpvoted,
            upvotes: project.upvotes + (project.hasUpvoted ? -1 : 1),
        }),
        (id) => `/api/projects/${id}/upvote`,
        { sortAfterUpdate: true }
    )

    const heart = useOptimisticProjectMutation(
        queryKeys.listings,
        (project) => ({
            hasHearted: !project.hasHearted,
            hearts: project.hearts + (project.hasHearted ? -1 : 1),
        }),
        (id) => `/api/projects/${id}/heart`,
        { sortAfterUpdate: true }
    )

    const save = useOptimisticProjectMutation(
        queryKeys.listings,
        (project) => ({
            hasSaved: !project.hasSaved,
            saves: project.saves + (project.hasSaved ? -1 : 1),
        }),
        (id) => `/api/projects/${id}/save`,
        { sortAfterUpdate: true, invalidateKeys: [queryKeys.saved], showSaveToast: true }
    )

    return { upvote, heart, save }
}

export function useSavedMutations() {
    const queryClient = useQueryClient()

    const upvote = useOptimisticProjectMutation(
        queryKeys.saved,
        (project) => ({
            hasUpvoted: !project.hasUpvoted,
            upvotes: project.upvotes + (project.hasUpvoted ? -1 : 1),
        }),
        (id) => `/api/projects/${id}/upvote`,
        { invalidateKeys: [queryKeys.listings] }
    )

    const heart = useOptimisticProjectMutation(
        queryKeys.saved,
        (project) => ({
            hasHearted: !project.hasHearted,
            hearts: project.hearts + (project.hasHearted ? -1 : 1),
        }),
        (id) => `/api/projects/${id}/heart`,
        { invalidateKeys: [queryKeys.listings] }
    )

    const unsave = useMutation({
        mutationFn: async (projectId: string) => {
            await axios.post(`/api/projects/${projectId}/save`)
            return projectId
        },
        onMutate: async (projectId) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.saved })

            const previous = queryClient.getQueryData<SavedResponse>(queryKeys.saved)
            if (!previous) return { previous }

            const project = previous.projects.find(p => p.id === projectId)
            if (!project) return { previous }

            queryClient.setQueryData<SavedResponse>(queryKeys.saved, {
                projects: previous.projects.filter(p => p.id !== projectId),
            })

            toast.success('Project unsaved')
            return { previous }
        },
        onError: (_err, _projectId, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.saved, context.previous)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.saved })
            queryClient.invalidateQueries({ queryKey: queryKeys.listings })
        },
    })

    return { upvote, heart, unsave }
}

export function useProfileMutations() {
    const upvote = useOptimisticProjectMutation(
        queryKeys.profileProjects,
        (project) => ({
            hasUpvoted: !project.hasUpvoted,
            upvotes: project.upvotes + (project.hasUpvoted ? -1 : 1),
        }),
        (id) => `/api/projects/${id}/upvote`,
        { invalidateKeys: [queryKeys.listings] }
    )

    const heart = useOptimisticProjectMutation(
        queryKeys.profileProjects,
        (project) => ({
            hasHearted: !project.hasHearted,
            hearts: project.hearts + (project.hasHearted ? -1 : 1),
        }),
        (id) => `/api/projects/${id}/heart`,
        { invalidateKeys: [queryKeys.listings] }
    )

    const save = useOptimisticProjectMutation(
        queryKeys.profileProjects,
        (project) => ({
            hasSaved: !project.hasSaved,
            saves: project.saves + (project.hasSaved ? -1 : 1),
        }),
        (id) => `/api/projects/${id}/save`,
        { invalidateKeys: [queryKeys.saved, queryKeys.listings], showSaveToast: true }
    )

    return { upvote, heart, save }
}

export function useUploadProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: {
            name: string
            description: string
            link: string
            logoUrl: string
            tags: string[]
            userId: string
        }) => {
            await axios.post('/api/uploadproject', data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.profileProjects })
            queryClient.invalidateQueries({ queryKey: queryKeys.listings })
        },
    })
}

export function useLogout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            await axios.get('/api/logout')
        },
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: queryKeys.me })
            queryClient.removeQueries({ queryKey: queryKeys.saved })
            queryClient.removeQueries({ queryKey: queryKeys.profileProjects })
        },
    })
}
