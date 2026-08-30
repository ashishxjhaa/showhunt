import {
  LandingAccordion,
  LandingAccordionContent,
  LandingAccordionItem,
  LandingAccordionTrigger,
} from "./LandingAccordion"
import LandingSection from "./LandingSection"

const faqs = [
  {
    value: "item-1",
    question: "How is ShowHunt different from Product Hunt?",
    answer:
      "ShowHunt is always-on and free to list. No launch day lottery, no pay-to-play. Your project stays live and accumulates engagement over time through upvotes and discussion.",
  },
  {
    value: "item-2",
    question: "Who can list projects on ShowHunt?",
    answer:
      "Any developer or founder with a product, side project, or open-source tool to share, whether solo or as a team.",
  },
  {
    value: "item-3",
    question: "Is ShowHunt free to use?",
    answer: "Yes. Listing your project and engaging with the community is completely free. No credit card required.",
  },
  {
    value: "item-4",
    question: "How do upvotes work?",
    answer:
      "Upvotes signal interest and push your project up the trending feed. Any signed-in builder can upvote a listing once, and can undo it anytime.",
  },
  {
    value: "item-5",
    question: "How do I get more visibility?",
    answer:
      "Share your listing link on X, Reddit, or Hacker News. Pick tags that match your project. Engage with other launches. The community rewards active builders.",
  },
  {
    value: "item-6",
    question: "How do tags work?",
    answer:
      "When you list a project you pick up to three tags from a curated set of fifteen. Visitors can filter the whole feed by tag to find projects like yours.",
  },
]

export default function FaqSection() {
  return (
    <LandingSection id="faq" className="border-b-0! flex min-h-screen items-center">
      <div className="grid flex-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
        {/* Left: heading */}
        <div>
          <h2 className="text-5xl font-semibold tracking-tight text-[var(--paper-ink)] sm:text-6xl">
            <span className="block">Frequently</span>
            <span className="mt-3 block">Asked</span>
            <span className="mt-3 block">Questions</span>
          </h2>
        </div>

        {/* Right: accordion */}
        <div>
          <LandingAccordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <LandingAccordionItem key={faq.value} value={faq.value}>
                <LandingAccordionTrigger>{faq.question}</LandingAccordionTrigger>
                <LandingAccordionContent>
                  <p className="text-balance">{faq.answer}</p>
                </LandingAccordionContent>
              </LandingAccordionItem>
            ))}
          </LandingAccordion>
        </div>
      </div>
    </LandingSection>
  )
}
