import Image from "next/image"
import Link from "next/link"

export default function CtaBand() {
  return (
    <section
      id="cta-banner"
      className="mx-auto w-full max-w-7xl px-5 sm:px-10"
    >
      <div className="relative flex h-[400px] items-center overflow-hidden rounded-[8px] sm:h-[500px]">
        {/* Banner background image */}
        <Image
          src="/cta-banner.avif"
          alt=""
          fill
          sizes="(min-width: 80rem) 80rem, 100vw"
          className="object-cover"
        />

        {/* Overlay content */}
        <div className="relative z-10 flex w-full flex-col items-start pl-6 pr-6 sm:pl-[65px] sm:pr-10">
          <div className="flex w-full flex-col items-start gap-3">
            <h2 className="text-[42px] font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-[42px]">
              Your launch is
              <span className="block">one listing away</span>
            </h2>
            <p className="text-base font-normal leading-[1.5] tracking-[-0.01em] text-white/85">
              Join the builders shipping in public.
              <br />
              List your project on ShowHunt today.
            </p>
          </div>

          <Link
            href="/signup"
            className="mt-[22px] inline-flex h-11 shrink-0 items-center justify-center rounded-[8px] bg-[#DA5CC7] px-[18px] text-sm font-semibold leading-none tracking-[-0.01em] text-white transition-colors hover:bg-[#D14BC0] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Begin Now
          </Link>
        </div>
      </div>
    </section>
  )
}
