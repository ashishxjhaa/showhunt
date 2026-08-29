import StickyPaperNavbar from "./StickyPaperNavbar"
import HeroSection from "./HeroSection"
import StatsBand from "./StatsBand"
import WhyShowHunt from "./WhyShowHunt"
import HowItWorks from "./HowItWorks"
import LiveListings from "./LiveListings"
import FaqSection from "./FaqSection"
import CtaBand from "./CtaBand"
import LandingFooter from "./LandingFooter"

export default function LandingPage() {
  return (
    <>
      <StickyPaperNavbar />
      <div className="landing-page light min-h-screen w-full">
        <main>
          <HeroSection />
          <StatsBand />
          <WhyShowHunt />
          <HowItWorks />
          <LiveListings />
          <FaqSection />
          <CtaBand />
        </main>
        <LandingFooter />
      </div>
    </>
  )
}
