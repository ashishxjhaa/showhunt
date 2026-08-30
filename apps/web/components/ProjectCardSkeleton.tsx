import { Skeleton } from "@/components/ui/skeleton"

const cardShadow = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)]"

const CardBodySkeleton = () => (
    <>
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl bg-[var(--paper-border)]" />
        <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-36 bg-[var(--paper-border)]" />
            <Skeleton className="h-4 w-full bg-[var(--paper-border)]" />
            <Skeleton className="h-4 w-2/3 bg-[var(--paper-border)]" />
            <div className="flex gap-3 pt-0.5">
                <Skeleton className="h-3 w-14 bg-[var(--paper-border)]" />
                <Skeleton className="h-3 w-14 bg-[var(--paper-border)]" />
                <Skeleton className="h-3 w-14 bg-[var(--paper-border)]" />
            </div>
        </div>
    </>
)

export const ProjectCardSkeleton = () => {
    return (
        <div className={`rounded-2xl bg-[var(--paper-surface)] p-4 sm:p-5 ${cardShadow}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="flex flex-1 gap-3 sm:gap-4">
                    <CardBodySkeleton />
                </div>
                <div className="flex items-center justify-end">
                    <Skeleton className="h-12 w-12 rounded-[8px] bg-[var(--paper-border)] sm:h-14 sm:w-14" />
                </div>
            </div>
        </div>
    )
}

export const MyListingCardSkeleton = () => {
    return (
        <div className={`overflow-hidden rounded-2xl bg-[var(--paper-surface)] ${cardShadow}`}>
            <div className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                <CardBodySkeleton />
            </div>
            <div className="flex items-center justify-between border-t border-[var(--paper-border)] px-4 py-2.5 sm:px-5">
                <div className="flex gap-4">
                    <Skeleton className="h-3.5 w-16 bg-[var(--paper-border)]" />
                    <Skeleton className="h-3.5 w-24 bg-[var(--paper-border)]" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-9 rounded-[8px] bg-[var(--paper-border)]" />
                    <Skeleton className="h-9 w-9 rounded-[8px] bg-[var(--paper-border)]" />
                </div>
            </div>
        </div>
    )
}
