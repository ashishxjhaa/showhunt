"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
]

const authLinks = [
  { href: "/signin", label: "Log in", className: "paper-btn-outline px-5" },
  { href: "/signup", label: "List your project", className: "paper-btn-dark px-6" },
]

export default function StickyPaperNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-[100] bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-10 sm:py-5">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40"
        >
          <Image src="/showcase.svg" alt="ShowHunt" width={38} height={38} className="rounded-lg" />
          <span className="text-lg font-semibold tracking-tight text-[var(--paper-ink)]">ShowHunt</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="paper-nav-link text-[15px] font-medium">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${link.className} inline-flex h-10 items-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)] text-[var(--paper-ink)] shadow-sm md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40"
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
        <div className="border-t border-black/8 bg-white/95 backdrop-blur-md md:hidden">
          <div className="mx-auto w-full max-w-7xl">
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
            <div className="mt-3 flex flex-col gap-3 border-t border-[var(--paper-border)] pt-4">
              {authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${link.className} inline-flex h-10 items-center justify-center text-sm`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
          </div>
        </div>
      )}
    </header>
  )
}
