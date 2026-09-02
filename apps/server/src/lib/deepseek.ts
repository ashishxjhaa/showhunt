import { AppError } from "./errors"
import { buildKey, IMAGE_TYPES, uploadBuffer } from "./s3"
import { CURATED_TAGS, isCuratedTag } from "./tags"

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
const MAX_HTML_BYTES = 300_000

export interface ScrapedPage {
  title: string | null
  description: string | null
  siteName: string | null
  image: string | null
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&nbsp;/g, " ")
    .trim()
}

function firstMatch(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern)
  return match?.[1] ? decodeEntities(match[1]) : null
}

function metaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${key}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${key}["']`, "i"),
  ]
  for (const pattern of patterns) {
    const value = firstMatch(html, pattern)
    if (value) return value
  }
  return null
}

/** Fetches a page and extracts the Open Graph metadata used for AI autofill. */
export async function scrapePage(url: string): Promise<ScrapedPage> {
  let res: Response
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ShowHuntBot/1.0; +https://showhunt.ashishjha.xyz)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw new AppError("Could not reach that URL", 400)
  }

  if (!res.ok) {
    throw new AppError(`That URL returned status ${res.status}`, 400)
  }

  const contentType = res.headers.get("content-type") ?? ""
  if (!contentType.includes("text/html")) {
    throw new AppError("That URL is not a web page", 400)
  }

  const html = (await res.text()).slice(0, MAX_HTML_BYTES)
  const titleTag = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
  const image = metaContent(html, "og:image") ?? metaContent(html, "twitter:image")

  let absoluteImage: string | null = null
  if (image) {
    try {
      absoluteImage = new URL(image, url).toString()
    } catch {
      absoluteImage = null
    }
  }

  return {
    title: metaContent(html, "og:title") ?? titleTag,
    description: metaContent(html, "og:description") ?? metaContent(html, "description"),
    siteName: metaContent(html, "og:site_name"),
    image: absoluteImage,
  }
}

export interface GeneratedMetadata {
  name: string
  description: string
  tags: string[]
}

/** Calls DeepSeek to turn scraped page metadata into listing fields. */
export async function generateMetadata(
  page: ScrapedPage,
  url: string
): Promise<GeneratedMetadata> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new AppError("AI metadata is not configured on the server", 500)
  }

  const systemPrompt = [
    "You write launch listings for ShowHunt, a community where builders launch products.",
    "Given scraped metadata from a website, produce listing fields.",
    "Respond ONLY with a JSON object with these keys:",
    '- "name": the product name as it brands itself, at most 60 characters',
    '- "description": a punchy one-line pitch, at most 100 characters, no trailing period',
    `- "tags": 1 to 3 tags chosen strictly from this list: ${CURATED_TAGS.join(", ")}`,
    "Use the real product name from the content, never the domain name, unless nothing else exists.",
  ].join("\n")

  const userPrompt = [
    `URL: ${url}`,
    page.title ? `Title: ${page.title}` : null,
    page.siteName ? `Site name: ${page.siteName}` : null,
    page.description ? `Meta description: ${page.description}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  let res: Response
  try {
    res = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 300,
      }),
      signal: AbortSignal.timeout(30_000),
    })
  } catch {
    throw new AppError("AI service timed out, please fill the form manually", 504)
  }

  if (!res.ok) {
    throw new AppError("AI service failed, please fill the form manually", 502)
  }

  const payload = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = payload.choices?.[0]?.message?.content
  if (!content) {
    throw new AppError("AI returned an empty response, please fill the form manually", 502)
  }

  let parsed: { name?: string; description?: string; tags?: unknown }
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new AppError("AI returned an invalid response, please fill the form manually", 502)
  }

  const rawTags = Array.isArray(parsed.tags) ? parsed.tags : []
  const tags = [
    ...new Set(
      rawTags
        .filter((tag): tag is string => typeof tag === "string" && isCuratedTag(tag))
        .slice(0, 3)
    ),
  ]

  return {
    name: (parsed.name ?? "").trim().slice(0, 80) || page.title?.slice(0, 80) || "Untitled project",
    description: (parsed.description ?? page.description ?? "").trim().slice(0, 160),
    tags: tags.length > 0 ? tags : ["Others"],
  }
}

/**
 * Downloads the page's og:image and re-hosts it on S3 so listings never
 * hotlink external images. Returns null (non-fatal) on any failure.
 */
export async function persistRemoteImage(
  imageUrl: string,
  userId: string
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return null

    const contentType = (res.headers.get("content-type") ?? "").split(";")[0]?.trim() ?? ""
    const ext = IMAGE_TYPES[contentType]
    if (!ext) return null

    const declaredLength = Number(res.headers.get("content-length") ?? "0")
    if (declaredLength > 5 * 1024 * 1024) return null

    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.byteLength === 0 || buffer.byteLength > 5 * 1024 * 1024) return null

    return await uploadBuffer(buildKey(userId, "logo", ext), contentType, buffer)
  } catch {
    return null
  }
}

