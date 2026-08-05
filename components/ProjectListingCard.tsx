import Image from "next/image"
import { ArrowBigUp, Bookmark, Heart, SquareArrowOutUpRight, Tags } from "lucide-react"

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
        <div className="relative bg-gray-200 dark:bg-[#3A2F35] text-black dark:text-white p-4 rounded-lg flex flex-col sm:flex-row gap-3 group">
            {rank !== undefined && rank <= 3 && (
                <div className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF8162] text-xs font-semibold text-white shadow-sm">
                    #{rank}
                </div>
            )}

            <div className="flex gap-3 flex-1">
                <div className="w-12 h-12 shrink-0">
                    <Image
                        src={project.logoUrl}
                        alt={project.name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                    />
                </div>
                <div className="flex-1">
                    <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium flex items-center gap-1 group-hover:text-[#FF8162] transition"
                    >
                        {project.name}
                        <SquareArrowOutUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                    </a>
                    <p className="text-sm opacity-70">{project.description}</p>

                    <div className="flex items-center gap-2 mt-2">
                        <Tags className="w-4 h-4" />
                        {project.tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-xs px-2 py-1 rounded-full bg-gray-300 dark:bg-neutral-600"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 items-center">
                <div
                    onClick={() => guardAction(() => onUpvote(project.id))}
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-xl border border-gray-400 dark:border-gray-50/30 hover:border-[#FF8162] dark:hover:border-[#FF8162] cursor-pointer"
                >
                    <ArrowBigUp className={project.hasUpvoted ? "fill-[#FF8162] text-[#FF8162]" : ""} />
                    <span className="text-xs font-medium tabular-nums">{project.upvotes}</span>
                </div>

                <div
                    onClick={() => guardAction(() => onHeart(project.id))}
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-xl border border-gray-400 dark:border-gray-50/30 hover:border-[#FF8162] dark:hover:border-[#FF8162] cursor-pointer"
                >
                    <Heart className={project.hasHearted ? "fill-[#FF8162] text-[#FF8162]" : ""} />
                    <span className="text-xs font-medium tabular-nums">{project.hearts}</span>
                </div>

                <div
                    onClick={() => guardAction(() => onSave(project.id))}
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-xl border border-gray-400 dark:border-gray-50/30 hover:border-[#FF8162] dark:hover:border-[#FF8162] cursor-pointer"
                >
                    <Bookmark className={project.hasSaved ? "fill-[#FF8162] text-[#FF8162]" : ""} />
                    <span className="text-xs font-medium tabular-nums">{project.saves}</span>
                </div>
            </div>
        </div>
    )
}
