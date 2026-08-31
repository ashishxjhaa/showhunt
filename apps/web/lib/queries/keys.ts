export const queryKeys = {
    listings: ['listings'] as const,
    myListings: ['profile', 'listings'] as const,
    me: ['me'] as const,
    tags: ['tags'] as const,
    listing: (id: string) => ['listing', id] as const,
    comments: (id: string) => ['listing', id, 'comments'] as const,
}

export interface ListingsFilters {
    tag?: string | null
    q?: string
    page?: number
}

export function listingsKey(filters?: ListingsFilters) {
    return [
        'listings',
        {
            tag: filters?.tag ?? null,
            q: filters?.q ?? '',
            page: filters?.page ?? 1,
        },
    ] as const
}
