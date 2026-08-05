import { Clock, ArrowRight, ChartColumn, Globe, ArrowBigUp, Heart, Bookmark } from 'lucide-react';


export default function Bentogrid() {

    return (
        <div className="py-24">
            <div className="container px-4 md:px-6 w-full mx-auto text-black dark:text-white">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl opacity-85 dark:opacity-100">Launch Your Vision</h2>
                    <p className="mx-auto mt-4 max-w-[700px] opacity-70 md:text-xl">List your project, get discovered, and grow through community engagement.</p>
                </div>
            
                <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    
                    <div className="flex">
                        <div className="group relative w-full rounded-2xl p-4 sm:p-6 shadow-blue-500/20 shadow-sm transition-all duration-300 hover:shadow-md border">
                            <div className="relative z-10">
                                <div className="mb-4 sm:mb-5 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-blue-400 p-2 sm:p-3 text-white shadow-lg">
                                    <Clock className='h-10 w-10' />
                                </div>
                                <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold tracking-wide">Quick Launch</h3>
                                <p className="text-sm sm:text-base opacity-90">List your project in minutes with a name, description, link, logo, and tags.</p>
                                
                                <div className="text-[#FF8162] mt-4 sm:mt-5 flex items-center text-sm font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100 cursor-pointer">
                                    <span>Learn more</span>
                                    <ArrowRight className='ml-1 h-4 w-4' />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex">
                        <div className="group relative w-full rounded-2xl p-4 sm:p-6 shadow-blue-500/20 shadow-sm transition-all duration-300 hover:shadow-md border">
                            <div className="relative z-10">
                                <div className="mb-4 sm:mb-5 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-yellow-300 p-2 sm:p-3 text-white shadow-lg">
                                    <Globe className='h-10 w-10' />
                                </div>
                                <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold tracking-wide">Get Discovered</h3>
                                <p className="text-sm sm:text-base opacity-90">Browse the listings feed and discover innovative projects from developers and founders.</p>
                                
                                <div className="text-[#FF8162] mt-4 sm:mt-5 flex items-center text-sm font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100 cursor-pointer">
                                    <span>Learn more</span>
                                    <ArrowRight className='ml-1 h-4 w-4' />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex">
                        <div className="group relative w-full rounded-2xl p-4 sm:p-6 shadow-blue-500/20 shadow-sm transition-all duration-300 hover:shadow-md border">
                            <div className="relative z-10">
                                <div className="mb-4 sm:mb-5 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-linear-to-br from-purple-600 to-violet-400 p-2 sm:p-3 text-white shadow-lg">
                                    <ArrowBigUp className='h-10 w-10' />
                                </div>
                                <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold tracking-wide">Upvotes</h3>
                                <p className="text-sm sm:text-base opacity-90">Let the community upvote your project to signal interest and boost visibility.</p>
                                
                                <div className="text-[#FF8162] mt-4 sm:mt-5 flex items-center text-sm font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100 cursor-pointer">
                                    <span>Learn more</span>
                                    <ArrowRight className='ml-1 h-4 w-4' />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex">
                        <div className="group relative w-full rounded-2xl p-4 sm:p-6 shadow-blue-500/20 shadow-sm transition-all duration-300 hover:shadow-md border">
                            <div className="relative z-10">
                                <div className="mb-4 sm:mb-5 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-linear-to-br from-orange-600 to-red-400 p-2 sm:p-3 text-white shadow-lg">
                                    <Heart className='h-10 w-10' />
                                </div>
                                <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold tracking-wide">Hearts</h3>
                                <p className="text-sm sm:text-base opacity-90">Receive hearts from users who love your product and want to show support.</p>
                                
                                <div className="text-[#FF8162] mt-4 sm:mt-5 flex items-center text-sm font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100 cursor-pointer">
                                    <span>Learn more</span>
                                    <ArrowRight className='ml-1 h-4 w-4' />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex">
                        <div className="group relative w-full rounded-2xl p-4 sm:p-6 shadow-blue-500/20 shadow-sm transition-all duration-300 hover:shadow-md border">
                            <div className="relative z-10">
                                <div className="mb-4 sm:mb-5 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-linear-to-br from-emerald-600 to-teal-400 p-2 sm:p-3 text-white shadow-lg">
                                    <Bookmark className='h-10 w-10' />
                                </div>
                                <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold tracking-wide">Saves</h3>
                                <p className="text-sm sm:text-base opacity-90">Users can bookmark your project to revisit later — track saves as a signal of lasting interest.</p>
                                
                                <div className="text-[#FF8162] mt-4 sm:mt-5 flex items-center text-sm font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100 cursor-pointer">
                                    <span>Learn more</span>
                                    <ArrowRight className='ml-1 h-4 w-4' />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex">
                        <div className="group relative w-full rounded-2xl p-4 sm:p-6 shadow-blue-500/20 shadow-sm transition-all duration-300 hover:shadow-md border">
                            <div className="relative z-10">
                                <div className="mb-4 sm:mb-5 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-linear-to-br from-cyan-600 to-sky-400 p-2 sm:p-3 text-white shadow-lg">
                                    <ChartColumn className='h-10 w-10' />
                                </div>
                                <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold tracking-wide">Engagement Dashboard</h3>
                                <p className="text-sm sm:text-base opacity-90">Monitor upvotes, hearts, and saves on your project dashboard in real time.</p>
                                
                                <div className="text-[#FF8162] mt-4 sm:mt-5 flex items-center text-sm font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100 cursor-pointer">
                                    <span>Learn more</span>
                                    <ArrowRight className='ml-1 h-4 w-4' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
