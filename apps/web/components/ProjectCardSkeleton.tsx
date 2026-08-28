import { Skeleton } from "@/components/ui/skeleton"

export const ProjectCardSkeleton = () => {
    return (
        <div className="paper-sheet-static p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="flex flex-1 gap-3 sm:gap-4">
                    <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32 bg-[var(--paper-border)]" />
                        <Skeleton className="h-4 w-full bg-[var(--paper-border)]" />
                        <div className="flex gap-2 mt-2">
                            <Skeleton className="h-6 w-16 rounded-full bg-[var(--paper-border)]" />
                            <Skeleton className="h-6 w-16 rounded-full bg-[var(--paper-border)]" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 sm:gap-3">
                    <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-[var(--paper-border)]" />
                    <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-[var(--paper-border)]" />
                    <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-[var(--paper-border)]" />
                </div>
            </div>
        </div>
    )
}
