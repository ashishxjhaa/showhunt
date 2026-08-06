import { cn } from "@/lib/utils"

interface LandingSectionProps {
  id?: string
  children: React.ReactNode
  className?: string
}

export default function LandingSection({ id, children, className }: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "landing-section mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28",
        className
      )}
    >
      {children}
    </section>
  )
}
