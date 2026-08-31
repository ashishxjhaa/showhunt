import { Skeleton } from "@/components/ui/skeleton"

export default function ListingDetailSkeleton() {
    return (
        <div className="px-5 pb-12 pt-4 sm:px-8 sm:pt-5">
            <Skeleton className="h-4 w-28 bg-[var(--paper-border)]" />

            {/* Hero */}
            <div className="mt-5 rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] p-5 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                        <Skeleton className="h-16 w-16 shrink-0 rounded-2xl bg-[var(--paper-border)] sm:h-20 sm:w-20" />
                        <div className="min-w-0 flex-1 space-y-2.5 pt-0.5">
                            <Skeleton className="h-7 w-48 bg-[var(--paper-border)] sm:w-64" />
                            <Skeleton className="h-4 w-full max-w-md bg-[var(--paper-border)]" />
                            <div className="flex gap-2 pt-1">
                                <Skeleton className="h-6 w-16 rounded-[8px] bg-[var(--paper-border)]" />
                                <Skeleton className="h-6 w-20 rounded-[8px] bg-[var(--paper-border)]" />
                                <Skeleton className="h-6 w-14 rounded-[8px] bg-[var(--paper-border)]" />
                            </div>
                        </div>
                    </div>
                    <Skeleton className="h-14 w-14 shrink-0 self-start rounded-[8px] bg-[var(--paper-border)]" />
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="min-w-0 space-y-6">
                    {/* Gallery */}
                    <div className="overflow-hidden rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)]">
                        <Skeleton className="aspect-video w-full rounded-none bg-[var(--paper-border)]" />
                        <div className="flex gap-2 p-3">
                            <Skeleton className="h-14 w-20 shrink-0 rounded-lg bg-[var(--paper-border)]" />
                            <Skeleton className="h-14 w-20 shrink-0 rounded-lg bg-[var(--paper-border)]" />
                            <Skeleton className="h-14 w-20 shrink-0 rounded-lg bg-[var(--paper-border)]" />
                        </div>
                    </div>

                    {/* Discussion */}
                    <div className="rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] p-5 sm:p-6">
                        <Skeleton className="h-5 w-36 bg-[var(--paper-border)]" />
                        <div className="mt-5 flex gap-3">
                            <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-[var(--paper-border)]" />
                            <Skeleton className="h-24 flex-1 rounded-xl bg-[var(--paper-border)]" />
                        </div>
                        <div className="mt-6 space-y-5 border-t border-[var(--paper-border)] pt-5">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-[var(--paper-border)]" />
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Skeleton className="h-3.5 w-32 bg-[var(--paper-border)]" />
                                        <Skeleton className="h-4 w-full bg-[var(--paper-border)]" />
                                        <Skeleton className="h-4 w-[66%] bg-[var(--paper-border)]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="space-y-4">
                    <div className="rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] p-5">
                        <Skeleton className="h-4 w-16 bg-[var(--paper-border)]" />
                        <div className="mt-4 space-y-2.5">
                            <Skeleton className="h-10 w-full rounded-[8px] bg-[var(--paper-border)]" />
                            <Skeleton className="h-10 w-full rounded-[8px] bg-[var(--paper-border)]" />
                            <Skeleton className="h-10 w-full rounded-[8px] bg-[var(--paper-border)]" />
                        </div>
                    </div>
                    <div className="rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] p-5">
                        <Skeleton className="h-4 w-14 bg-[var(--paper-border)]" />
                        <div className="mt-4 flex items-center gap-3">
                            <Skeleton className="h-11 w-11 rounded-full bg-[var(--paper-border)]" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28 bg-[var(--paper-border)]" />
                                <Skeleton className="h-3 w-20 bg-[var(--paper-border)]" />
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}
