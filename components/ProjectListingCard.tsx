import Image from "next/image"
import { ArrowBigUp, Bookmark, Heart, SquareArrowOutUpRight } from "lucide-react"

export interface ListingProject {
    id: string
    name: string
    description: string
    link: string
    logoUrl: string
    tags: string[]
    upvotes: number
    hearts: number
    saves: number
    hasUpvoted: boolean
    hasHearted: boolean
    hasSaved: boolean
    user: { fullName: string }
    createdAt?: string | Date
}

interface ProjectListingCardProps {
    project: ListingProject
    rank?: number
    isAuthenticated: boolean
    onUpvote: (id: string) => void
    onHeart: (id: string) => void
    onSave: (id: string) => void
    onRequireAuth: () => void
}

export default function ProjectListingCard({
    project,
    rank,
    isAuthenticated,
    onUpvote,
    onHeart,
    onSave,
    onRequireAuth,
}: ProjectListingCardProps) {
    const guardAction = (action: () => void) => {
        if (!isAuthenticated) {
            onRequireAuth()
            return
        }
        action()
    }

    return (
        <article className="group relative flex gap-4 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700/80 dark:bg-neutral-900/60 sm:gap-5 sm:p-5">
            {rank !== undefined && rank <= 3 && (
                <div className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF8162] text-xs font-semibold text-white shadow-sm">
                    #{rank}
                </div>
            )}

            <button
                type="button"
                onClick={() => guardAction(() => onUpvote(project.id))}
                className={`flex min-w-[4.5rem] flex-col items-center justify-center rounded-xl border px-2 py-3 transition-colors ${
                    project.hasUpvoted
                        ? "border-[#FF8162] bg-[#FF8162]/10 text-[#FF8162]"
                        : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-[#FF8162] hover:text-[#FF8162] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
            >
                <ArrowBigUp className={`h-5 w-5 ${project.hasUpvoted ? "fill-[#FF8162]" : ""}`} />
                <span className="mt-1 text-sm font-semibold tabular-nums">{project.upvotes}</span>
            </button>

            <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
                        <Image
                            src={project.logoUrl}
                            alt={project.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold tracking-tight text-neutral-900 transition-colors group-hover:text-[#FF8162] dark:text-white"
                            >
                                {project.name}
                            </a>
                            <SquareArrowOutUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
                        </div>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                            by {project.user.fullName}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                            {project.description}
                        </p>

                        {project.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {project.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => guardAction(() => onHeart(project.id))}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                            project.hasHearted
                                ? "border-[#FF8162] bg-[#FF8162]/10 text-[#FF8162]"
                                : "border-neutral-200 text-neutral-600 hover:border-[#FF8162] hover:text-[#FF8162] dark:border-neutral-700 dark:text-neutral-300"
                        }`}
                    >
                        <Heart className={`h-4 w-4 ${project.hasHearted ? "fill-[#FF8162]" : ""}`} />
                        <span className="tabular-nums font-medium">{project.hearts}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => guardAction(() => onSave(project.id))}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                            project.hasSaved
                                ? "border-[#FF8162] bg-[#FF8162]/10 text-[#FF8162]"
                                : "border-neutral-200 text-neutral-600 hover:border-[#FF8162] hover:text-[#FF8162] dark:border-neutral-700 dark:text-neutral-300"
                        }`}
                    >
                        <Bookmark className={`h-4 w-4 ${project.hasSaved ? "fill-[#FF8162]" : ""}`} />
                        <span className="tabular-nums font-medium">{project.saves}</span>
                    </button>
                </div>
            </div>
        </article>
    )
}
