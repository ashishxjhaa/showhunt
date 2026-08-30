import StickyPaperNavbar from "@/components/landing/StickyPaperNavbar"
import HeroSection from "@/components/landing/HeroSection"
import StatsBand from "@/components/landing/StatsBand"
import WhyShowHunt from "@/components/landing/WhyShowHunt"
import HowItWorks from "@/components/landing/HowItWorks"
import FaqSection from "@/components/landing/FaqSection"
import CtaBand from "@/components/landing/CtaBand"
import LandingFooter from "@/components/landing/LandingFooter"

export default function Home() {
  return (
    <>
      <StickyPaperNavbar />
      <div className="landing-page light min-h-screen w-full">
        <main>
          <HeroSection />
          <StatsBand />
          <WhyShowHunt />
          <HowItWorks />
          <FaqSection />
          <CtaBand />
        </main>
        <LandingFooter />
      </div>
    </>
  )
}
