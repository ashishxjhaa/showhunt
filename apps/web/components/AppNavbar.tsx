"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowUpRight, Compass, LogOutIcon, Menu, User, X } from "lucide-react"
import { useMe } from "@/lib/queries/hooks"
import { useLogout } from "@/lib/queries/mutations"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/listings", label: "Browse", icon: Compass },
  { href: "/profile", label: "Profile", icon: User },
]

const authLinks = [
  { href: "/signin", label: "Log in", className: "paper-btn-outline" },
  { href: "/signup", label: "Register", className: "paper-btn-primary" },
]

let clickAudio: HTMLAudioElement | null = null

const playClickSound = () => {
  clickAudio ??= new Audio("/switchtab.mp3")
  clickAudio.currentTime = 0
  clickAudio.play().catch(() => {})
}

interface AppNavbarProps {
  search?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
}

export default function AppNavbar({ search = "", onSearchChange, showSearch = false }: AppNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: user, isFetched } = useMe()
  const pathname = usePathname()
  const router = useRouter()
  const logout = useLogout()

  const handleLogout = () => {
    toast.success("Logged out")
    logout.mutate(undefined, {
      onSettled: () => router.push("/"),
    })
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[100] bg-[#FAF7FA]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[#FAF7FA]/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-8 sm:py-5">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40"
        >
          <Image src="/showcase.svg" alt="ShowHunt" width={38} height={38} className="rounded-lg" />
          <span className="text-xl font-bold tracking-tight text-[var(--paper-ink)]">ShowHunt</span>
        </Link>

        <div className="hidden flex-1 max-w-sm mx-4 md:block">
          {showSearch ? (
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search projects..."
              className="paper-input"
            />
          ) : (
            <div className="h-9" aria-hidden="true" />
          )}
        </div>

        <nav className="hidden items-center md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => {
                playClickSound()
                if (link.href === "/profile" && isFetched && !user) {
                  e.preventDefault()
                  toast.error("Please log in to continue", { id: "auth-notice" })
                  router.push("/signin")
                }
              }}
              className={cn(
                "group relative mx-4 flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40",
                pathname === link.href
                  ? "opacity-100"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <span className="flex items-center gap-2 font-bold text-[var(--paper-ink)] transition-transform duration-500 ease-in-out group-hover:-translate-x-2">
                <link.icon size={18} strokeWidth={2} />
                {link.label}
              </span>
              <ArrowUpRight
                size={48}
                strokeWidth={1}
                className="absolute -right-8 h-[20px] text-[var(--paper-ink)] opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
              />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 shrink-0 md:flex">
          {!isFetched ? (
            <div
              className="h-10 w-[104px] animate-pulse rounded-[8px] bg-black/5"
              aria-hidden="true"
            />
          ) : user ? (
            <button
              type="button"
              onClick={() => {
                playClickSound()
                handleLogout()
              }}
              className="group inline-flex h-10 cursor-pointer items-center gap-2 rounded-[8px] border border-red-200 bg-white px-4 text-sm font-medium text-red-500 transition-colors hover:border-red-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
            >
              <LogOutIcon
                size={16}
                className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
              />
              Sign out
            </button>
          ) : (
            <>
              {authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    link.className,
                    "inline-flex h-10 items-center px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] text-[var(--paper-ink)] shadow-sm md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-5 w-5 stroke-[var(--paper-ink)]" strokeWidth={2} />
          ) : (
            <Menu className="h-5 w-5 stroke-[var(--paper-ink)]" strokeWidth={2} />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-black/8 bg-[#FAF7FA]/95 backdrop-blur-md md:hidden">
          <div className="mx-auto w-full max-w-6xl">
            {showSearch && (
              <div className="px-5 pt-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="Search projects..."
                  className="paper-input"
                />
              </div>
            )}
            <nav className="flex flex-col gap-1 px-5 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-bold transition-colors hover:bg-[var(--paper-accent-soft)] hover:text-[var(--paper-ink)]",
                    pathname === link.href
                      ? "bg-[var(--paper-accent-soft)] text-[var(--paper-ink)]"
                      : "text-[var(--paper-muted)]"
                  )}
                  onClick={(e) => {
                    playClickSound()
                    setMobileOpen(false)
                    if (link.href === "/profile" && isFetched && !user) {
                      e.preventDefault()
                      toast.error("Please log in to continue", { id: "auth-notice" })
                      router.push("/signin")
                    }
                  }}
                >
                  <link.icon size={16} strokeWidth={2} />
                  {link.label}
                </Link>
              ))}
              {isFetched && user ? (
                <button
                  type="button"
                  onClick={() => {
                    playClickSound()
                    handleLogout()
                    setMobileOpen(false)
                  }}
                  className="group mt-3 inline-flex cursor-pointer items-center gap-2 rounded-[8px] px-3 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                >
                  <LogOutIcon
                    size={16}
                    className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                  />
                  Sign out
                </button>
              ) : isFetched ? (
                <div className="mt-3 flex flex-col gap-2 border-t border-[var(--paper-border)] pt-4">
                  {authLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(link.className, "inline-flex h-10 items-center justify-center text-sm")}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
