import { chromium } from "@playwright/test"
import { mkdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const OUT_DIR = join(ROOT, "docs", "screenshots")
const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000"

function loadEnvFile() {
  try {
    const contents = readFileSync(join(ROOT, ".env"), "utf8")
    for (const line of contents.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env is optional if vars are already exported
  }
}

loadEnvFile()

const email = process.env.SCREENSHOT_EMAIL
const password = process.env.SCREENSHOT_PASSWORD

if (!email || !password) {
  console.error(
    "Missing SCREENSHOT_EMAIL or SCREENSHOT_PASSWORD.\n" +
      "Add them to .env or export them before running: bun run screenshots"
  )
  process.exit(1)
}

async function ensureTestAccount() {
  const response = await fetch(`${BASE_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Screenshot User",
      email,
      password,
    }),
  })

  if (response.ok || response.status === 400) return

  const body = await response.text()
  throw new Error(`Failed to ensure screenshot account (${response.status}): ${body}`)
}

async function waitForPageReady(page) {
  await page.waitForLoadState("load")
  await page.waitForTimeout(800)
}

async function capture(page, name) {
  const path = join(OUT_DIR, `${name}.png`)
  await page.screenshot({ path, fullPage: false })
  console.log(`Saved ${path}`)
}

async function signIn(page) {
  await page.goto(`${BASE_URL}/signin`, { waitUntil: "load" })
  await page.getByPlaceholder("you@example.com").fill(email)
  await page.getByPlaceholder("Password").fill(password)
  await page.getByRole("button", { name: "Log in" }).click()
  await page.waitForURL("**/listings", { timeout: 15000 })
  await waitForPageReady(page)
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })

  try {
    const response = await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (error) {
    console.error(
      `Dev server not reachable at ${BASE_URL}. Run "bun run dev" first.\n` +
        `If using a different port, set SCREENSHOT_BASE_URL (e.g. http://localhost:3001).`
    )
    process.exit(1)
  }

  await ensureTestAccount()

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  await page.goto(`${BASE_URL}/`, { waitUntil: "load" })
  await waitForPageReady(page)
  await capture(page, "landing")

  await page.goto(`${BASE_URL}/listings`, { waitUntil: "load" })
  await waitForPageReady(page)
  await capture(page, "listings")

  await page.goto(`${BASE_URL}/signin`, { waitUntil: "load" })
  await waitForPageReady(page)
  await capture(page, "signin")

  await signIn(page)

  await page.goto(`${BASE_URL}/profile`, { waitUntil: "load" })
  await waitForPageReady(page)
  await capture(page, "profile")

  await page.goto(`${BASE_URL}/saved`, { waitUntil: "load" })
  await waitForPageReady(page)
  await capture(page, "saved")

  await page.goto(`${BASE_URL}/profile`, { waitUntil: "load" })
  await waitForPageReady(page)
  await page.getByRole("button", { name: "Upload project" }).click()
  await page.getByRole("heading", { name: "List your project" }).waitFor({ state: "visible" })
  await waitForPageReady(page)
  await capture(page, "upload")

  await browser.close()
  console.log("All screenshots captured.")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
