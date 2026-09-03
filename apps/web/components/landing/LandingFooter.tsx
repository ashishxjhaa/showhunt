import Link from "next/link"
import Image from "next/image"
import { Github, Mail, Twitter } from "lucide-react"

interface FooterLink {
  href: string
  label: string
  external?: boolean
}

const productLinks: FooterLink[] = [
  { href: "/listings", label: "Browse listings" },
  { href: "/signup", label: "List your project" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
]

const resourceLinks: FooterLink[] = [
  {
    href: "https://github.com/ashishxjhaa/showhunt",
    label: "GitHub repository",
    external: true,
  },
  {
    href: "https://github.com/ashishxjhaa/showhunt/issues",
    label: "Report an issue",
    external: true,
  },
]

const connectLinks: FooterLink[] = [
  { href: "https://github.com/ashishxjhaa", label: "GitHub", external: true },
  { href: "https://x.com/ashishxjha", label: "X (Twitter)", external: true },
  { href: "mailto:ashishxyzjha@gmail.com", label: "Email us", external: true },
]

const socials = [
  { href: "https://github.com/ashishxjhaa/showhunt", label: "GitHub", icon: Github },
  { href: "https://x.com/ashishxjha", label: "X (Twitter)", icon: Twitter },
  { href: "mailto:ashishxyzjha@gmail.com", label: "Email", icon: Mail },
]

const columns = [
  { title: "Product", links: productLinks },
  { title: "Resources", links: resourceLinks },
  { title: "Connect", links: connectLinks },
]

export default function LandingFooter() {
  return (
    <footer id="footer" className="bg-[var(--paper-surface)]">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-10 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/showcase.svg" alt="ShowHunt" width={32} height={32} className="rounded-lg" />
              <span className="text-lg font-semibold tracking-tight text-[var(--paper-ink)]">ShowHunt</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--paper-muted)]">
              A launch platform where developers and founders list projects, get discovered, and grow through real community engagement.
            </p>
            <div className="mt-5 flex gap-2.5">
              {socials.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--paper-border)] text-[var(--paper-muted)] transition-colors hover:border-[#DA5CC7]/40 hover:bg-[var(--paper-accent-soft)] hover:text-[#DA5CC7]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-[var(--paper-ink)] select-none">{column.title}</p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-[var(--paper-muted)] transition-colors hover:text-[#DA5CC7]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[var(--paper-border)] pt-8 sm:flex-row">
          <p className="text-xs text-[var(--paper-muted)] select-none">
            © {new Date().getFullYear()} ShowHunt. All rights reserved.
          </p>
          <p className="text-xs text-[var(--paper-muted)] select-none">
            Built by{" "}
            <Link
              href="https://www.ashishjha.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--paper-ink)] transition-colors hover:text-[#DA5CC7]"
            >
              Ashish Jha
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
