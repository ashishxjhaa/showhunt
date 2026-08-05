'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'
import { Bookmark, ChevronDown, LogOutIcon, Search, User } from 'lucide-react'
import { AvatarDemo } from './Avatar'
import { Button } from './ui/button'

interface User {
  id: string
  fullName: string
  email: string
}

interface ListingNavbarProps {
  search: string
  onSearchChange: (value: string) => void
}

const ListingNavbar = ({ search, onSearchChange }: ListingNavbarProps) => {
  const [openProfile, setOpenProfile] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setOpenProfile(false)
      }
    }

    if (openProfile) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openProfile])

  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/me")
        setUser(res.data.user)
      } catch {
        setUser(null)
      } finally {
        setAuthChecked(true)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    await axios.get('/api/logout')
    setUser(null)
    router.push('/')
    toast.success('Logged out')
  }

  return (
    <div className="fixed w-full z-50 border-b border-neutral-200/80 bg-[#F6F6EF]/90 backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-900/80">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/listings" className="flex items-center gap-2 shrink-0">
          <Image src="/BackIt.svg" alt="BackIt logo" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="hidden text-sm font-semibold tracking-wide text-neutral-900 dark:text-white sm:inline">
            BackIt
          </span>
        </Link>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects, tags..."
            className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF8162]/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {authChecked && user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setOpenProfile(true)}
                className="flex items-center gap-0.5 text-black dark:text-white"
              >
                <AvatarDemo />
                <ChevronDown size={20} />
              </button>

              {openProfile && (
                <div className="absolute top-full right-0 mt-2 w-fit z-50">
                  <div className="bg-[#fab885] flex flex-col gap-3 p-4 rounded-t-lg border border-b-0 border-black dark:border-white/35">
                    <div className="flex items-center gap-3">
                      <div className="relative rounded-full size-12">
                        <div className="absolute flex h-full w-full items-center justify-center rounded-full bg-gray-600 text-white text-2xl font-serif">
                          {user.fullName?.[0]}
                        </div>
                      </div>
                      <div>
                        <p className="text-base truncate text-black tracking-wide">{user.fullName?.split(' ')[0]}</p>
                        <p className="text-xs text-black/80 truncate tracking-wide">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-200 dark:bg-neutral-700 text-black dark:text-white p-2 space-y-1 w-full rounded-b-lg border border-t-0 border-black dark:border-white/35">
                    <div onClick={() => router.push("/profile")} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md hover:bg-accent dark:hover:bg-accent/50 text-sm">
                      <User size={17} />
                      <span className="tracking-wide">Profile</span>
                    </div>

                    <div onClick={() => router.push("/saved")} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md hover:bg-accent dark:hover:bg-accent/50 text-sm">
                      <Bookmark size={16} />
                      <span className="tracking-wide whitespace-nowrap">Saved Projects</span>
                    </div>

                    <div className="border-t border-black dark:border-white/50">
                      <div onClick={handleLogout} className="flex items-center gap-2 cursor-pointer px-3 py-2 mt-1 rounded-md hover:bg-red-100 hover:dark:bg-red-700/10 text-sm">
                        <LogOutIcon size={16} />
                        <span className="text-red-400 tracking-wide whitespace-nowrap">Log out</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : authChecked ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/signin" className="font-light">Log in</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/signup">Register</Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ListingNavbar
