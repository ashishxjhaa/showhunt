"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { PipecatClient } from "@pipecat-ai/client-js"
import {
  PipecatClientAudio,
  PipecatClientProvider,
} from "@pipecat-ai/client-react"
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport"
import VoicePet from "@/components/voice/VoicePet"
import { useVoiceSite } from "@/components/voice/VoiceSiteContext"
import { executeVoiceTool } from "@/lib/voice/execute-tool"
import type { VoiceSessionState, VoiceToolName } from "@/lib/voice/types"

const VOICE_URL =
  process.env.NEXT_PUBLIC_VOICE_URL?.replace(/\/$/, "") || "http://localhost:7860"

// Browser-executed tools only. FAQ stays on the voice server.
const CLIENT_TOOLS: VoiceToolName[] = [
  "get_page_info",
  "navigate",
  "go_back",
  "scroll_to",
  "set_listings_page",
  "search_listings",
  "filter_by_tag",
  "open_listing",
  "open_builder",
  "fill_signup",
  "fill_signin",
  "submit_auth",
  "open_upload",
  "fill_listing",
  "enrich_from_url",
  "upload_next",
  "upload_previous",
  "upload_goto_step",
  "submit_listing",
  "set_upload_link",
  "remove_upload_link",
  "edit_listing",
  "delete_listing",
  "cancel_delete_listing",
  "confirm_delete_listing",
  "open_avatar_picker",
  "set_avatar",
  "sign_out",
  "upvote_listing",
  "fill_comment",
  "submit_comment",
  "open_link",
  "open_similar",
  "open_profile_editor",
  "fill_profile",
]

function playNotify() {
  try {
    const audio = new Audio("/notify.mp3")
    audio.volume = 0.7
    void audio.play().catch(() => {})
  } catch {
    // ignore autoplay failures
  }
}

function createClient() {
  return new PipecatClient({
    transport: new SmallWebRTCTransport({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    }),
    enableMic: true,
    enableCam: false,
  })
}

export function VoiceProvider({ children }: { children: ReactNode }) {
  const { getSnapshot, getHandlers } = useVoiceSite()
  const [client, setClient] = useState<PipecatClient | null>(null)
  const clientRef = useRef<PipecatClient | null>(null)
  const [sessionState, setSessionState] = useState<VoiceSessionState>("idle")
  const [bubbleText, setBubbleText] = useState<string | null>(null)
  const [successPulse, setSuccessPulse] = useState(false)
  const sessionStateRef = useRef(sessionState)
  sessionStateRef.current = sessionState

  const stop = useCallback(async () => {
    const current = clientRef.current
    clientRef.current = null
    setClient(null)
    try {
      current?.unregisterAllFunctionCallHandlers()
      await current?.disconnect()
    } catch {
      // ignore
    }
    setSessionState("idle")
    setBubbleText(null)
  }, [])

  const pushContext = useCallback(() => {
    const c = clientRef.current
    if (!c) return
    try {
      c.sendClientMessage("page_context", getSnapshot())
    } catch {
      // ignore
    }
  }, [getSnapshot])

  const registerTools = useCallback(
    (c: PipecatClient) => {
      for (const name of CLIENT_TOOLS) {
        c.registerFunctionCallHandler(name, async ({ functionName, arguments: args }) => {
          setSessionState("thinking")
          try {
            const result = await executeVoiceTool(
              functionName,
              args ?? {},
              getSnapshot,
              getHandlers
            )
            const ok =
              typeof result === "object" && result && "ok" in result
                ? Boolean((result as { ok?: boolean }).ok)
                : true
            if (ok && functionName !== "get_page_info") {
              setSuccessPulse(true)
              window.setTimeout(() => setSuccessPulse(false), 900)
            }
            return result
          } catch (err) {
            const message = err instanceof Error ? err.message : "Tool failed"
            return { ok: false, error: message }
          }
        })
      }
    },
    [getSnapshot, getHandlers]
  )

  const start = useCallback(async () => {
    if (sessionStateRef.current !== "idle" && sessionStateRef.current !== "error") {
      return
    }

    playNotify()
    setSessionState("connecting")
    setBubbleText("Hi, I'm Cody.")

    try {
      await stop()
      const next = createClient()
      clientRef.current = next
      setClient(next)

      next.on("botReady", () => {
        setSessionState("listening")
        setBubbleText("Listening… Esc to hang up")
        pushContext()
      })
      next.on("userStartedSpeaking", () => setSessionState("listening"))
      next.on("botStartedSpeaking", () => setSessionState("speaking"))
      next.on("botStoppedSpeaking", () => setSessionState("listening"))
      next.on("botLlmStarted", () => setSessionState("thinking"))
      next.on("disconnected", () => {
        setSessionState("idle")
        setBubbleText(null)
        clientRef.current = null
        setClient(null)
      })
      next.on("error", () => {
        setSessionState("error")
        setBubbleText("Could not connect. Press F2")
      })

      registerTools(next)

      await next.connect({
        webrtcRequestParams: {
          endpoint: `${VOICE_URL}/api/offer`,
        },
      })

      pushContext()
    } catch (err) {
      console.error("Voice connect failed", err)
      setSessionState("error")
      setBubbleText("Mic unavailable. Press F2")
      await stop()
    }
  }, [pushContext, registerTools, stop])

  useEffect(() => {
    if (sessionState === "idle" || sessionState === "error") return
    pushContext()
    const id = window.setInterval(pushContext, 2500)
    return () => window.clearInterval(id)
  }, [sessionState, pushContext])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (sessionStateRef.current !== "idle") {
          e.preventDefault()
          void stop()
        }
        return
      }
      if (e.key !== "F2") return
      const target = e.target as HTMLElement | null
      if (target?.closest?.('input[type="password"]')) return
      e.preventDefault()
      if (sessionStateRef.current === "idle" || sessionStateRef.current === "error") {
        void start()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [start, stop])

  useEffect(() => () => {
    void stop()
  }, [stop])

  const tree = (
    <>
      {children}
      <VoicePet
        sessionState={sessionState}
        bubbleText={bubbleText}
        onSuccessPulse={successPulse}
      />
    </>
  )

  if (!client) return tree

  return (
    <PipecatClientProvider client={client}>
      {tree}
      <PipecatClientAudio />
    </PipecatClientProvider>
  )
}
