import type { ReactNode } from "react"
import Link from "next/link"

interface AuthCardProps {
  title: string
  subtitle?: ReactNode
  children: ReactNode
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="auth-card w-full">
      <div className="auth-card-header">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F0F0F]">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-[#6B6879]">{subtitle}</p> : null}
      </div>
      <div className="auth-card-body">{children}</div>
    </div>
  )
}

export function AuthCardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="ml-1 font-medium text-[#DA5CC7] transition-colors hover:text-[#C431AE]">
      {children}
    </Link>
  )
}
