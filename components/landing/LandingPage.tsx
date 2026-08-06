import StickyPaperNavbar from "./StickyPaperNavbar"
import HeroSection from "./HeroSection"
import LiveFeedDemo from "./LiveFeedDemo"
import WhyBackIt from "./WhyBackIt"
import EngagementSignals from "./EngagementSignals"
import HowItWorks from "./HowItWorks"
import CommunitySection from "./CommunitySection"
import FaqSection from "./FaqSection"
import CtaBand from "./CtaBand"
import LandingFooter from "./LandingFooter"

export default function LandingPage() {
  return (
    <>
      <div className="landing-frame-rail-left" aria-hidden="true" />
      <div className="landing-frame-rail-right" aria-hidden="true" />
      <StickyPaperNavbar />
      <div className="landing-page light min-h-screen w-full">
        <main>
          <HeroSection />
          <LiveFeedDemo />
          <WhyBackIt />
          <EngagementSignals />
          <HowItWorks />
          <CommunitySection />
          <FaqSection />
          <CtaBand />
        </main>
        <LandingFooter />
      </div>
    </>
  )
}
