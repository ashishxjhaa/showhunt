export function engagementScore(p: { upvotes: number; hearts: number; saves: number }) {
    return p.upvotes * 3 + p.hearts * 2 + p.saves;
}

export function sortByTrending<
    T extends { upvotes: number; hearts: number; saves: number; createdAt?: string | Date },
>(projects: T[]) {
    return [...projects].sort((a, b) => {
        const scoreDiff = engagementScore(b) - engagementScore(a);
        if (scoreDiff !== 0) return scoreDiff;

        if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        return 0;
    });
}
