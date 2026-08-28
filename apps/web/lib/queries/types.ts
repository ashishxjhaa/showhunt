export interface Project {
    id: string
    name: string
    description: string
    link: string
    logoUrl: string
    tags: string[]
    upvotes: number
    hearts: number
    saves: number
    hasUpvoted: boolean
    hasHearted: boolean
    hasSaved: boolean
    user: { fullName: string }
    createdAt?: string | Date
}

export interface User {
    id: string
    fullName: string
    email: string
    createdAt: string
}

export interface ListingsResponse {
    projects: Project[]
    stats: {
        totalProjects: number
        totalUpvotes: number
        totalHearts: number
        totalSaves: number
    }
}

export interface SavedResponse {
    projects: Project[]
}

export interface ProfileProjectsResponse {
    projects: Project[]
}
