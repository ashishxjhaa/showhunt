export interface Listing {
    id: string
    name: string
    description: string
    logoUrl: string
    isOpenSource: boolean
    repoUrl: string | null
    tags: string[]
    upvotes: number
    hasUpvoted: boolean
    links: { platform: string; url: string }[]
    user: { fullName: string }
    createdAt?: string | Date
}

export interface User {
    id: string
    fullName: string
    email: string
    avatarUrl: string | null
    createdAt: string
}

export interface ListingsResponse {
    listings: Listing[]
}
