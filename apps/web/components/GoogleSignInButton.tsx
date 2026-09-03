'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, apiErrorMessage } from '@/lib/api'
import { queryKeys } from '@/lib/queries/keys'

type GoogleTokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void
}

type GoogleTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: GoogleTokenResponse) => void
            error_callback?: (error: { type?: string; message?: string }) => void
          }) => GoogleTokenClient
        }
      }
    }
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GOOGLE_SCOPES = 'openid email profile'

export default function GoogleSignInButton() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const tokenClientRef = useRef<GoogleTokenClient | null>(null)
  const [googleReady, setGoogleReady] = useState(
    () => typeof window !== 'undefined' && Boolean(window.google?.accounts?.oauth2)
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (googleReady) return
    const interval = window.setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        setGoogleReady(true)
        window.clearInterval(interval)
      }
    }, 200)
    const timeout = window.setTimeout(() => window.clearInterval(interval), 15000)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [googleReady])

  const finishSignIn = useCallback(
    async (accessToken: string) => {
      setLoading(true)
      try {
        await api.post('/api/v1/auth/google', { accessToken })
        await queryClient.invalidateQueries({ queryKey: queryKeys.me })
        await queryClient.invalidateQueries({ queryKey: queryKeys.listings })
        router.push('/listings')
      } catch (err) {
        toast.error(apiErrorMessage(err, 'Google sign-in failed'))
        setLoading(false)
      }
    },
    [queryClient, router]
  )

  useEffect(() => {
    if (!CLIENT_ID || !googleReady || !window.google?.accounts?.oauth2) return

    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: GOOGLE_SCOPES,
      callback: (response) => {
        if (response.error || !response.access_token) {
          toast.error(response.error_description || 'Google sign-in was cancelled')
          setLoading(false)
          return
        }
        void finishSignIn(response.access_token)
      },
      error_callback: (error) => {
        if (error.type === 'popup_closed') {
          setLoading(false)
          return
        }
        toast.error(error.message || 'Google sign-in failed')
        setLoading(false)
      },
    })
  }, [googleReady, finishSignIn])

  const handleClick = () => {
    if (!CLIENT_ID) {
      toast.error('Google sign-in is not configured')
      return
    }
    if (!tokenClientRef.current) {
      toast.error('Google sign-in is unavailable right now')
      return
    }
    setLoading(true)
    tokenClientRef.current.requestAccessToken({ prompt: 'select_account' })
  }

  if (!CLIENT_ID) return null

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || !googleReady}
        className="flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-[#DCD8E8] bg-white text-sm font-medium text-[#0F0F0F] transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleLogo />
        {loading ? 'Signing in…' : 'Continue with Google'}
      </button>
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#DCD8E8]" />
        <span className="text-xs uppercase tracking-wide text-[#6B6879]">
          or continue with email
        </span>
        <div className="h-px flex-1 bg-[#DCD8E8]" />
      </div>
    </>
  )
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  )
}
