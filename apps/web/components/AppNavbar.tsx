"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronDown, LogOutIcon, Menu, X } from "lucide-react"
import { useMe } from "@/lib/queries/hooks"
import { useLogout } from "@/lib/queries/mutations"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/listings", label: "Browse" },
  { href: "/profile", label: "Profile" },
]

interface AppNavbarProps {
  search?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
}

export default function AppNavbar({ search = "", onSearchChange, showSearch = false }: AppNavbarProps) {
  const [openProfile, setOpenProfile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const { data: user, isFetched } = useMe()
  const logout = useLogout()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setOpenProfile(false)
      }
    }

    if (openProfile) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [openProfile])

  const handleLogout = async () => {
    await logout.mutateAsync()
    router.push("/")
    toast.success("Logged out")
  }

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? ""

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-black/8 bg-[#F5F4FA]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[#F5F4FA]/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 border-x border-[var(--app-rail-color)] px-5 py-3 sm:px-8 sm:py-3.5">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40"
        >
          <Image src="/showcase.png" alt="ShowHunt" width={30} height={30} className="rounded-md" />
          <span className="text-base font-semibold tracking-tight text-[var(--paper-ink)]">ShowHunt</span>
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

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "paper-nav-link text-sm font-medium",
                pathname === link.href && "paper-nav-link-active"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 shrink-0 md:flex">
          {isFetched && user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setOpenProfile((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[var(--paper-ink)] transition-colors hover:bg-[var(--paper-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--paper-accent-soft)] text-sm font-medium text-[#7C3AED]">
                  {initials}
                </div>
                <ChevronDown className="h-4 w-4 text-[var(--paper-muted)]" />
              </button>

              {openProfile && (
                <div className="absolute top-full right-0 mt-2 w-56 z-50 overflow-hidden rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface)] shadow-lg">
                  <div className="border-b border-[var(--paper-border)] bg-[#f7f5fe] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--paper-accent-soft)] text-sm font-medium text-[#7C3AED]">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--paper-ink)]">
                          {user.fullName?.split(" ")[0]}
                        </p>
                        <p className="truncate text-xs text-[var(--paper-muted)]">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
                    >
                      <LogOutIcon size={16} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : isFetched ? (
            <>
              <Link
                href="/signin"
                className="paper-btn-outline inline-flex h-9 items-center px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="paper-btn-primary inline-flex h-9 items-center px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40"
              >
                Register
              </Link>
            </>
          ) : null}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--paper-border)] bg-[var(--paper-surface)] text-[var(--paper-ink)] shadow-sm md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40"
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
        <div className="border-t border-black/8 bg-[#F5F4FA]/95 backdrop-blur-md md:hidden">
          <div className="mx-auto w-full max-w-6xl border-x border-[var(--app-rail-color)]">
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
                    "rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-[var(--paper-accent-soft)] hover:text-[var(--paper-ink)]",
                    pathname === link.href
                      ? "bg-[var(--paper-accent-soft)] text-[var(--paper-ink)] font-medium"
                      : "text-[var(--paper-muted)]"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isFetched && user ? (
                <button
                  type="button"
                  onClick={() => {
                    handleLogout()
                    setMobileOpen(false)
                  }}
                  className="mt-3 rounded-md px-3 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                >
                  Log out
                </button>
              ) : isFetched ? (
                <div className="mt-3 flex flex-col gap-2 border-t border-[var(--paper-border)] pt-4">
                  <Link
                    href="/signin"
                    className="paper-btn-outline inline-flex h-10 items-center justify-center text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="paper-btn-primary inline-flex h-10 items-center justify-center text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              ) : null}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
