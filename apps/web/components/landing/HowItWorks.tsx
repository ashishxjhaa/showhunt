"use client"

import { motion } from "motion/react"
import { Plus, RadioTower, Rocket } from "lucide-react"
import LandingSection from "./LandingSection"

const steps = [
  {
    icon: Plus,
    step: "01",
    title: "Create your account",
    description: ["Sign up in seconds.", "No onboarding maze, no sales call."],
    theme: {
      highlight: "#E93545",
    },
  },
  {
    icon: Rocket,
    step: "02",
    title: "List your project",
    description: ["Add your name, description, link, logo,", "and tags. Takes under 5 minutes."],
    theme: {
      highlight: "#3559E9",
    },
  },
  {
    icon: RadioTower,
    step: "03",
    title: "Get discovered",
    description: ["Share your listing, collect upvotes,", "and climb the trending feed as builders find you."],
    theme: {
      highlight: "#1CB061",
    },
  },
]

export default function HowItWorks() {
  return (
    <LandingSection id="how-it-works" className="landing-section--flush pt-20 pb-0 sm:pt-28 sm:pb-0">
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: [0.21, 0.65, 0.36, 1] }}
        className="max-w-2xl text-4xl font-semibold tracking-tight text-[var(--paper-ink)] sm:text-5xl lg:text-[56px] lg:leading-[1.1]"
      >
        <span className="block">From signup to</span>
        <span className="block">launch in minutes</span>
      </motion.h2>

      <div className="mt-12 flex flex-col gap-10 sm:mt-16 sm:gap-14">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: index * 0.1, ease: [0.21, 0.65, 0.36, 1] }}
              className="flex flex-col gap-8 rounded-2xl bg-[#F7F7F7] p-7 sm:p-12 lg:min-h-[360px] lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-14"
            >
              <div className="max-w-md shrink-0">
                <span className="block text-[32px] font-normal leading-none tracking-tight text-[#D1D1D1] select-none sm:text-[36px]">
                  {step.step}
                </span>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-[28px] sm:leading-snug">
                  <span
                    className="box-decoration-clone px-2.5 py-1 -mx-2.5"
                    style={{ backgroundColor: step.theme.highlight }}
                  >
                    {step.title}
                  </span>
                </h3>
                <p className="mt-4 text-base leading-relaxed text-[var(--paper-muted)]">
                  <span className="block">{step.description[0]}</span>
                  <span className="block">{step.description[1]}</span>
                </p>
              </div>
              <div
                className="flex min-h-[200px] w-full items-center justify-center rounded-xl lg:max-w-[540px] lg:self-stretch"
                style={{
                  backgroundColor: "#FFFFFF",
                  backgroundImage:
                    "linear-gradient(#ECECEC 1px, transparent 1px), linear-gradient(90deg, #ECECEC 1px, transparent 1px)",
                  backgroundSize: "26px 26px",
                }}
              >
                <div
                  className="flex h-[72px] w-[72px] items-center justify-center rounded-[14px] shadow-[0_14px_30px_-10px_rgba(20,30,60,0.35)] sm:h-20 sm:w-20"
                  style={{ backgroundColor: step.theme.highlight }}
                >
                  <Icon className="h-8 w-8 text-white sm:h-9 sm:w-9" strokeWidth={1.8} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </LandingSection>
  )
}
