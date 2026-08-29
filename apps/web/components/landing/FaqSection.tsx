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
    <LandingSection id="faq">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--paper-ink)] sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mt-3 text-[var(--paper-muted)]">Everything you need to know before you launch.</p>
      </div>

      <div className="mx-auto max-w-2xl">
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
    </LandingSection>
  )
}
