"use client"

import { useEffect, useState } from "react"
import {
  SpriteAnimator,
  usePetController,
  type CodexPetAnimationName,
} from "codex-pets-react"
import {
  CODY_ATLAS,
  CODY_HEIGHT,
  CODY_SCALE,
  CODY_WIDTH,
} from "@/lib/voice/cody-atlas"
import type { VoiceSessionState } from "@/lib/voice/types"
import { cn } from "@/lib/utils"

const BUBBLE_IDLE = "Press F2 to talk"

function bubbleFor(state: VoiceSessionState, override: string | null) {
  if (override) return override
  switch (state) {
    case "connecting":
      return "Connecting…"
    case "listening":
      return "Listening… Esc to hang up"
    case "thinking":
      return "On it…"
    case "speaking":
      return "Speaking…"
    case "error":
      return "Something went wrong. Press F2"
    default:
      return BUBBLE_IDLE
  }
}

function animationFor(state: VoiceSessionState): CodexPetAnimationName {
  switch (state) {
    case "connecting":
      return "waving"
    case "listening":
      return "waiting"
    case "thinking":
      return "running"
    case "speaking":
      return "review"
    case "error":
      return "failed"
    default:
      return "idle"
  }
}

function statusLabel(state: VoiceSessionState) {
  switch (state) {
    case "connecting":
      return "Connecting"
    case "listening":
      return "Listening"
    case "thinking":
      return "Thinking"
    case "speaking":
      return "Speaking"
    case "error":
      return "Error"
    default:
      return "Voice guide"
  }
}

interface VoicePetProps {
  sessionState: VoiceSessionState
  bubbleText?: string | null
  onSuccessPulse?: boolean
}

export default function VoicePet({
  sessionState,
  bubbleText = null,
  onSuccessPulse = false,
}: VoicePetProps) {
  const { pet, petDispatch } = usePetController<CodexPetAnimationName>({
    initialState: {
      animation: { name: "idle", mode: "loop" },
    },
    defaultAnimation: "idle",
    waitingAnimation: "waiting",
    waitingAfterMs: 12_000,
  })

  // Client-only mount avoids SSR/hydration issues with the sprite.
  const [mounted, setMounted] = useState(false)
  const [visibleBubble, setVisibleBubble] = useState(BUBBLE_IDLE)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const next = animationFor(sessionState)
    if (onSuccessPulse) {
      petDispatch({
        type: "animation.play",
        animation: "jumping",
        mode: "once",
        then: next,
      })
      return
    }
    if (sessionState === "connecting") {
      petDispatch({
        type: "animation.play",
        animation: "waving",
        mode: "once",
        then: "waiting",
      })
    } else {
      petDispatch({ type: "animation.set", animation: next })
    }
  }, [sessionState, onSuccessPulse, petDispatch])

  useEffect(() => {
    setVisibleBubble(bubbleFor(sessionState, bubbleText))
  }, [sessionState, bubbleText])

  const active = sessionState !== "idle" && sessionState !== "error"
  const isError = sessionState === "error"
  const showHotkey = sessionState === "idle"

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[90] flex flex-col items-end gap-2 sm:bottom-5 sm:right-5"
      aria-live="polite"
    >
      <div
        className={cn(
          "voice-bubble relative h-[72px] w-[220px] shrink-0 overflow-hidden rounded-2xl px-3.5 py-2.5 text-left text-white shadow-lg sm:h-[76px] sm:w-[240px]",
          "bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#1e40af] ring-1 ring-white/25",
          isError && "from-rose-600 via-rose-500 to-rose-700",
          active && !isError && "voice-bubble--live"
        )}
      >
        <div className="mb-1 flex items-center gap-2">
          <span
            className={cn(
              "relative flex h-2 w-2 shrink-0 rounded-full",
              isError ? "bg-rose-200" : active ? "bg-emerald-300" : "bg-sky-200"
            )}
          >
            {active && !isError ? (
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300/80" />
            ) : null}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">
            {statusLabel(sessionState)}
          </span>
          {showHotkey ? (
            <kbd className="ml-auto rounded-md border border-white/25 bg-white/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white shadow-inner">
              F2
            </kbd>
          ) : null}
        </div>
        <p className="line-clamp-2 text-xs leading-snug font-medium sm:text-[13px]">
          {visibleBubble}
        </p>
        <span
          className={cn(
            "absolute -bottom-1.5 right-10 h-3 w-3 rotate-45",
            isError ? "bg-rose-600" : "bg-[#1e40af]"
          )}
          aria-hidden
        />
      </div>

      <div className="overflow-hidden" style={{ width: CODY_WIDTH, height: CODY_HEIGHT }}>
        {mounted ? (
          <SpriteAnimator
            src="/pet/cody/spritesheet.webp"
            atlas={CODY_ATLAS}
            animation={pet.animation}
            scale={CODY_SCALE}
            ariaLabel="Cody, ShowHunt voice guide"
            onAnimationComplete={(name) => {
              petDispatch({ type: "animation.complete", animation: name })
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
