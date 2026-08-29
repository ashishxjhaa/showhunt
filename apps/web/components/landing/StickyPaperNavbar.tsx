"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import GoogleSignInButton from "@/components/GoogleSignInButton"

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
]

export default function StickyPaperNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-black/8 bg-[#F5F4FA]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[#F5F4FA]/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 border-x border-[var(--landing-rail-color)] px-5 py-3 sm:px-8 sm:py-3.5">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40"
        >
          <Image src="/showcase.png" alt="ShowHunt" width={30} height={30} className="rounded-md" />
          <span className="text-base font-semibold tracking-tight text-[var(--paper-ink)]">ShowHunt</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="paper-nav-link text-sm font-medium">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <GoogleSignInButton variant="navbar" />
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
            List your project
          </Link>
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
          <div className="mx-auto w-full max-w-6xl border-x border-[var(--landing-rail-color)]">
          <nav className="flex flex-col gap-1 px-5 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2.5 text-sm text-[var(--paper-muted)] transition-colors hover:bg-[var(--paper-accent-soft)] hover:text-[var(--paper-ink)]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-[var(--paper-border)] pt-4">
              <Link href="/signin" className="paper-btn-outline inline-flex h-10 items-center justify-center text-sm" onClick={() => setMobileOpen(false)}>
                Log in
              </Link>
              <Link href="/signup" className="paper-btn-primary inline-flex h-10 items-center justify-center text-sm" onClick={() => setMobileOpen(false)}>
                List your project
              </Link>
            </div>
          </nav>
          </div>
        </div>
      )}
    </header>
  )
}
