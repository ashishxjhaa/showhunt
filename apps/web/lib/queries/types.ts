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
    user: {
        fullName: string
        username: string | null
        avatarUrl: string | null
    }
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
    username: string | null
    bio: string | null
    twitterUrl: string | null
    githubUrl: string | null
    portfolioUrl: string | null
    linkedinUrl: string | null
    state: string | null
    techStack: string[]
}

export interface PublicUser {
    id: string
    fullName: string
    username: string
    avatarUrl: string | null
    bio: string
    twitterUrl: string | null
    githubUrl: string | null
    portfolioUrl: string | null
    linkedinUrl: string | null
    techStack: string[]
    createdAt: string
}

export interface PublicProfileInput {
    username: string
    bio: string
    twitterUrl: string
    githubUrl: string
    portfolioUrl: string
    linkedinUrl: string
    state: string
    techStack: string[]
}

export interface ActivityDay {
    date: string
    listings: number
    upvotes: number
}

export interface PublicProfileResponse {
    user: PublicUser
    activity: ActivityDay[]
    listings: Listing[]
}

export interface ListingsResponse {
    listings: Listing[]
    total?: number
    page?: number
    limit?: number
    totalPages?: number
}
