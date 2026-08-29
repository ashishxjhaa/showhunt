import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function CtaBand() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F953C6] to-[#B91D73] px-8 py-16 text-center sm:px-16 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-12 h-72 w-72 rounded-full bg-white/10 blur-2xl"
        />

        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your launch is one listing away.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/85">
            Join the builders shipping in public. List your project on ShowHunt today, free forever.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-[0.625rem] bg-white px-8 text-sm font-semibold text-[#B91D73] shadow-md transition-all hover:brightness-105 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            Get started for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
