export interface Listing {
    id: string
    name: string
    description: string
    logoUrl: string
    videoUrl: string | null
    photos: string[]
    isOpenSource: boolean
    repoUrl: string | null
    tags: string[]
    upvotes: number
    comments: number
    hasUpvoted: boolean
    links: { platform: string; url: string }[]
    user: { fullName: string }
    createdAt?: string | Date
}

export interface ListingComment {
    id: string
    content: string
    createdAt: string | Date
    user: {
        id: string
        fullName: string
        avatarUrl: string | null
    }
}

export interface EnrichedMetadata {
    name: string
    description: string
}

export interface ListingInput {
    name: string
    description: string
    link: string
    logoUrl: string
    tags: string[]
    videoUrl?: string | null
    photos?: string[]
    isOpenSource?: boolean
    repoUrl?: string | null
    socialLinks?: { platform: string; url: string }[]
}

export interface User {
    id: string
    fullName: string
    email: string
    avatarUrl: string | null
    createdAt: string
}

export interface ActivityDay {
    date: string
    listings: number
    upvotes: number
}

export interface ListingsResponse {
    listings: Listing[]
    total?: number
    page?: number
    limit?: number
    totalPages?: number
}
