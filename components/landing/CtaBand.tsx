import Link from "next/link"
import { ArrowRight } from "lucide-react"
import LandingSection from "./LandingSection"

export default function CtaBand() {
  return (
    <LandingSection>
      <div className="rounded-2xl bg-gradient-to-br from-[#FF8162] to-[#F12711] px-8 py-14 text-center shadow-[0_8px_32px_-8px_rgba(255,129,98,0.5)] sm:px-16 sm:py-16">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Your launch is one listing away.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-white/80">
          Join builders who ship in public. List your project on BackIt today.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-[0.625rem] bg-white px-8 text-sm font-semibold text-[#F12711] shadow-md transition-all hover:brightness-105 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          Get started for free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </LandingSection>
  )
}
