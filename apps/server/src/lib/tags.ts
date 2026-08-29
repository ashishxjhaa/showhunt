export const CURATED_TAGS = [
  "AI",
  "SaaS",
  "Dev Tools",
  "Productivity",
  "Fintech",
  "E-commerce",
  "Open Source",
  "Social",
  "Design",
  "Health & Fitness",
  "Education",
  "Gaming",
  "Crypto",
  "Hardware",
  "Others",
] as const

export type CuratedTag = (typeof CURATED_TAGS)[number]

export function isCuratedTag(tag: string): tag is CuratedTag {
  return (CURATED_TAGS as readonly string[]).includes(tag)
}
