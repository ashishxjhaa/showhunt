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
    hasUpvoted: boolean
    links: { platform: string; url: string }[]
    user: { fullName: string }
    createdAt?: string | Date
}

export interface EnrichedMetadata {
    name: string
    description: string
    tags: string[]
    logoUrl: string | null
}

export interface ListingInput {
    name: string
    description: string
    link: string
    logoUrl: string
    tags: string[]
    videoUrl?: string | null
    photos?: string[]
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
