'use client'

import { ArrowBigUp, Bookmark, Heart, SquareArrowOutUpRight, Tags } from "lucide-react"
import Image from "next/image"
import Back from "./Back"
import { useSaved } from "@/lib/queries/hooks"
import { useSavedMutations } from "@/lib/queries/mutations"
import { ProjectCardSkeleton } from "./ProjectCardSkeleton"
import type { Project } from "@/lib/queries/types"

const SavedPage = () => {
    const { data, isLoading } = useSaved()
    const { upvote, heart, unsave } = useSavedMutations()

    const projects = data?.projects ?? []

    return (
        <>
        <Back />
     
        <div className="py-15">
            <h2 className="text-3xl font-medium tracking-tight text-center sm:text-left sm:mx-14 pb-3 text-[#FF8162]">Saved Projects</h2>
            {isLoading ? (
                <div className="bg-gray-300 dark:bg-neutral-700 rounded-md px-3 py-3.5 grid gap-3 mx-4 sm:mx-12">
                    {[...Array(3)].map((_, i) => (
                        <ProjectCardSkeleton key={i} />
                    ))}
                </div>
            ) : projects.length > 0 ? (
                <div className="bg-gray-300 dark:bg-neutral-700 rounded-md px-3 py-3.5 grid gap-3 mx-4 sm:mx-12">
                    {projects.map((p: Project) => (
                        <div 
                            key={p.id} 
                            className="bg-gray-200 dark:bg-[#3A2F35] text-black dark:text-white p-4 rounded-lg flex flex-col sm:flex-row gap-3 group"
                        >
                            <div className="flex gap-3 flex-1">
                                <div className="w-12 h-12 shrink-0">
                                    <Image
                                        src={p.logoUrl} 
                                        alt={p.name}
                                        width={48}
                                        height={48}
                                        className="rounded-lg object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <a
                                        href={p.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium flex items-center gap-1 group-hover:text-[#FF8162] transition"
                                    >
                                        {p.name}
                                        <SquareArrowOutUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                                    </a>
                                    <p className="text-sm opacity-70">{p.description}</p>
    
                                    <div className="flex items-center gap-2 mt-2">
                                        <Tags className="w-4 h-4" />
                                        {p.tags.map((tag, i) => (
                                            <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-300 dark:bg-neutral-600">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 items-center">
                                <div onClick={() => upvote.mutate(p.id)} className='flex items-center justify-center w-12 h-12 rounded-xl border border-gray-400 dark:border-gray-50/30 hover:border-[#FF8162] dark:hover:border-[#FF8162] cursor-pointer'>
                                    <ArrowBigUp className={p.hasUpvoted ? 'fill-[#FF8162] text-[#FF8162]' : ''} />
                                </div>     
                    
                                <div onClick={() => heart.mutate(p.id)} className='flex items-center justify-center w-12 h-12 rounded-xl border border-gray-400 dark:border-gray-50/30 hover:border-[#FF8162] dark:hover:border-[#FF8162] cursor-pointer'>
                                    <Heart className={p.hasHearted ? 'fill-[#FF8162] text-[#FF8162]' : ''} />
                                </div>

                                <div onClick={() => unsave.mutate(p.id)} className='flex items-center justify-center w-12 h-12 rounded-xl border border-gray-400 dark:border-gray-50/30 hover:border-[#FF8162] dark:hover:border-[#FF8162] cursor-pointer'>
                                    <Bookmark className='fill-[#FF8162] text-[#FF8162]' />  
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-black dark:text-white opacity-85">No saved projects</p>
            )}
        </div>
        </>
    )
}

export default SavedPage
