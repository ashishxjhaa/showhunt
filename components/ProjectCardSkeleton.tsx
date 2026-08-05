import { Skeleton } from "@/components/ui/skeleton"

export const ProjectCardSkeleton = () => {
    return (
        <div className="flex gap-4 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm dark:border-neutral-700/80 dark:bg-neutral-900/60 sm:gap-5 sm:p-5">
            <Skeleton className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-3">
                <div className="flex gap-3">
                    <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-16 rounded-lg" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
            </div>
        </div>
    )
}
