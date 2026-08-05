import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    value: "item-1",
    question: "How do I list my project on BackIt?",
    answer: "Sign up, go to your profile, and submit your project with a name, description, link, logo, and tags.",
  },
  {
    value: "item-2",
    question: "Who can list projects on BackIt?",
    answer: "Any developer or founder with a product or project to share, whether as an individual or a team.",
  },
  {
    value: "item-3",
    question: "Is BackIt free to use?",
    answer: "Yes. Listing your project and engaging with the community is free.",
  },
  {
    value: "item-4",
    question: "How do upvotes, hearts, and saves work?",
    answer: "Users can upvote to signal interest, heart to show support, or save to bookmark a project for later. All three are visible on each project card.",
  },
  {
    value: "item-5",
    question: "How do I get discovered on BackIt?",
    answer: "Share your listing link, use relevant tags, and engage with the community. Projects with more upvotes, hearts, and saves gain more visibility in the feed.",
  },
  {
    value: "item-6",
    question: "Can I save projects I'm interested in?",
    answer: "Yes. Click the save icon on any project to bookmark it. View all saved projects from the Saved page in your dashboard.",
  },
];
  
export default function Faq() {
    return (
        <>
        <div className="text-center pb-6">
            <h2 className="dark:text-white text-black opacity-90 text-3xl font-semibold sm:text-4xl md:text-5xl tracking-tight">
                Still Got <span className="font-serif font-normal tracking-wide">Questions?</span>
            </h2>
            <p className="mt-4 md:text-xl dark:text-white text-black opacity-75 tracking-wide">
                {`We've got answers.`}
            </p>
        </div>

        <div className="mx-5 sm:mx-auto max-w-3xl rounded-lg border p-4 dark:bg-neutral-700 bg-amber-50 dark:text-white text-black">
            <Accordion type="single" collapsible className="w-full flex flex-col gap-2">
                {faqs.map((faq) => (
                    <AccordionItem key={faq.value} value={faq.value}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-balance">{faq.answer}</p>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
        </>
    )
}
