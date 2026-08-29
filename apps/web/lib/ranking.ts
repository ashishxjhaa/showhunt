export function sortByTrending<
    T extends { upvotes: number; createdAt?: string | Date },
>(listings: T[]) {
    return [...listings].sort((a, b) => {
        if (a.upvotes !== b.upvotes) return b.upvotes - a.upvotes;

        if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        return 0;
    });
}
