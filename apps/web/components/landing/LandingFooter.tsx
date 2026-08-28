import Link from "next/link"
import Image from "next/image"
import { FaGithub } from "react-icons/fa"
import { IconArrowUpRight } from "@tabler/icons-react"
import { MdCopyright } from "react-icons/md"

const pageLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Browse" },
  { href: "/profile", label: "List a project" },
  { href: "/signin", label: "Log in" },
  { href: "/signup", label: "Register" },
]

const connectLinks = [
  { href: "https://github.com/ashishxjhaa", label: "GitHub" },
  { href: "https://x.com/ashishxjha", label: "Twitter" },
]

export default function LandingFooter() {
  return (
    <footer className="bg-[var(--paper-surface)]">
      <div className="mx-auto w-full max-w-6xl border-x border-[var(--landing-rail-color)] px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/showcase.png" alt="BackIt" width={28} height={28} className="rounded-md" />
              <span className="text-base font-semibold text-[var(--paper-ink)]">BackIt</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--paper-muted)]">
              A product launch platform where developers and founders list projects, get discovered, and grow through real community engagement.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--paper-ink)] select-none">Pages</p>
            <ul className="mt-4 space-y-3">
              {pageLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--paper-muted)] transition-colors hover:text-[#FF8162]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--paper-ink)] select-none">Connect</p>
            <ul className="mt-4 space-y-3">
              {connectLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--paper-muted)] transition-colors hover:text-[#FF8162]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--paper-border)] pt-8 sm:flex-row">
          <p className="flex items-center gap-1.5 text-xs text-[var(--paper-muted)]">
            <MdCopyright className="h-3.5 w-3.5" />
            <span>{new Date().getFullYear()} BackIt. All rights reserved.</span>
          </p>

          <Link
            href="https://github.com/ashishxjhaa/BackIt"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-[var(--paper-ink)] transition-transform duration-300 group-hover:-translate-x-1">
              <FaGithub className="h-4 w-4" />
              Star on GitHub
            </span>
            <IconArrowUpRight
              size={20}
              strokeWidth={1.5}
              className="absolute -right-6 text-[var(--paper-ink)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          </Link>
        </div>
      </div>
    </footer>
  )
}
