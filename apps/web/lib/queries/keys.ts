export const queryKeys = {
    listings: ['listings'] as const,
    myListings: ['profile', 'listings'] as const,
    me: ['me'] as const,
    tags: ['tags'] as const,
}

export interface ListingsFilters {
    tag?: string | null
    q?: string
}

export function listingsKey(filters?: ListingsFilters) {
    return ['listings', { tag: filters?.tag ?? null, q: filters?.q ?? '' }] as const
}
