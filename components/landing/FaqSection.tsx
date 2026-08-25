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
    question: "How is BackIt different from Product Hunt?",
    answer:
      "BackIt is always-on and free to list. No launch day lottery, no pay-to-play. Your project stays live and accumulates engagement over time through upvotes, hearts, and saves.",
  },
  {
    value: "item-2",
    question: "Who can list projects on BackIt?",
    answer:
      "Any developer or founder with a product, side project, or open-source tool to share, whether solo or as a team.",
  },
  {
    value: "item-3",
    question: "Is BackIt free to use?",
    answer: "Yes. Listing your project and engaging with the community is completely free. No credit card required.",
  },
  {
    value: "item-4",
    question: "How do upvotes, hearts, and saves work?",
    answer:
      "Upvotes signal interest and push your project up the feed. Hearts show genuine admiration. Saves mean someone will come back, the strongest intent signal.",
  },
  {
    value: "item-5",
    question: "How do I get more visibility?",
    answer:
      "Share your listing link on Twitter, Reddit, or Hacker News. Use relevant tags. Engage with other projects. The community rewards active builders.",
  },
  {
    value: "item-6",
    question: "Can I save projects I'm interested in?",
    answer:
      "Yes. Click the save icon on any project card. View all saved projects from the Saved page in your dashboard.",
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
