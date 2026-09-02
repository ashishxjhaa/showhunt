export const INDIA_STATES = [
  { slug: "andhra-pradesh", name: "Andhra Pradesh" },
  { slug: "arunachal-pradesh", name: "Arunachal Pradesh" },
  { slug: "assam", name: "Assam" },
  { slug: "bihar", name: "Bihar" },
  { slug: "chhattisgarh", name: "Chhattisgarh" },
  { slug: "goa", name: "Goa" },
  { slug: "gujarat", name: "Gujarat" },
  { slug: "haryana", name: "Haryana" },
  { slug: "himachal-pradesh", name: "Himachal Pradesh" },
  { slug: "jharkhand", name: "Jharkhand" },
  { slug: "karnataka", name: "Karnataka" },
  { slug: "kerala", name: "Kerala" },
  { slug: "madhya-pradesh", name: "Madhya Pradesh" },
  { slug: "maharashtra", name: "Maharashtra" },
  { slug: "manipur", name: "Manipur" },
  { slug: "meghalaya", name: "Meghalaya" },
  { slug: "mizoram", name: "Mizoram" },
  { slug: "nagaland", name: "Nagaland" },
  { slug: "odisha", name: "Odisha" },
  { slug: "punjab", name: "Punjab" },
  { slug: "rajasthan", name: "Rajasthan" },
  { slug: "sikkim", name: "Sikkim" },
  { slug: "tamil-nadu", name: "Tamil Nadu" },
  { slug: "telangana", name: "Telangana" },
  { slug: "tripura", name: "Tripura" },
  { slug: "uttar-pradesh", name: "Uttar Pradesh" },
  { slug: "uttarakhand", name: "Uttarakhand" },
  { slug: "west-bengal", name: "West Bengal" },
  { slug: "andaman-and-nicobar", name: "Andaman and Nicobar Islands" },
  { slug: "chandigarh", name: "Chandigarh" },
  { slug: "dadra-and-nagar-haveli-and-daman-and-diu", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { slug: "delhi", name: "Delhi" },
  { slug: "jammu-and-kashmir", name: "Jammu and Kashmir" },
  { slug: "ladakh", name: "Ladakh" },
  { slug: "lakshadweep", name: "Lakshadweep" },
  { slug: "puducherry", name: "Puducherry" },
] as const

export type IndiaStateSlug = (typeof INDIA_STATES)[number]["slug"]

/** GeoJSON / TopoJSON shapeName (ASCII) → INDIA_STATES slug. */
export const GEO_NAME_TO_SLUG: Record<string, IndiaStateSlug> = {
  "Andaman and Nicobar Islands": "andaman-and-nicobar",
  "Andhra Pradesh": "andhra-pradesh",
  "Arunachal Pradesh": "arunachal-pradesh",
  Assam: "assam",
  Bihar: "bihar",
  Chandigarh: "chandigarh",
  Chhattisgarh: "chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu": "dadra-and-nagar-haveli-and-daman-and-diu",
  Delhi: "delhi",
  Goa: "goa",
  Gujarat: "gujarat",
  Haryana: "haryana",
  "Himachal Pradesh": "himachal-pradesh",
  "Jammu and Kashmir": "jammu-and-kashmir",
  Jharkhand: "jharkhand",
  Karnataka: "karnataka",
  Kerala: "kerala",
  Ladakh: "ladakh",
  Lakshadweep: "lakshadweep",
  "Madhya Pradesh": "madhya-pradesh",
  Maharashtra: "maharashtra",
  Manipur: "manipur",
  Meghalaya: "meghalaya",
  Mizoram: "mizoram",
  Nagaland: "nagaland",
  Odisha: "odisha",
  Puducherry: "puducherry",
  Punjab: "punjab",
  Rajasthan: "rajasthan",
  Sikkim: "sikkim",
  "Tamil Nadu": "tamil-nadu",
  Telangana: "telangana",
  Tripura: "tripura",
  "Uttar Pradesh": "uttar-pradesh",
  Uttarakhand: "uttarakhand",
  "West Bengal": "west-bengal",
}

const SLUG_SET = new Set<string>(INDIA_STATES.map((s) => s.slug))

export function isIndiaStateSlug(value: string): value is IndiaStateSlug {
  return SLUG_SET.has(value)
}

export function indiaStateName(slug: string | null | undefined): string | null {
  if (!slug) return null
  return INDIA_STATES.find((s) => s.slug === slug)?.name ?? null
}
