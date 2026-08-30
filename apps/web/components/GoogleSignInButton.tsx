'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { toast } from 'sonner'
import { api } from '@/lib/api'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

interface GoogleSignInButtonProps {
  variant?: 'card' | 'navbar'
}

export default function GoogleSignInButton({ variant = 'card' }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [googleReady, setGoogleReady] = useState(
    () => typeof window !== 'undefined' && Boolean(window.google?.accounts?.id)
  )

  // next/script onLoad may not fire again on client-side nav, so detect
  // the Google library directly instead.
  useEffect(() => {
    if (googleReady) return
    const interval = window.setInterval(() => {
      if (window.google?.accounts?.id) {
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

  useEffect(() => {
    if (!CLIENT_ID || !googleReady || !buttonRef.current || !window.google) return

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (response) => {
        try {
          await api.post('/api/v1/auth/google', { credential: response.credential })
          toast.success('Signed in with Google 🎉')
          window.location.assign('/listings')
        } catch (err) {
          toast.error(
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
              'Google sign-in failed'
          )
        }
      },
    })

    buttonRef.current.innerHTML = ''
    window.google.accounts.id.renderButton(
      buttonRef.current,
      variant === 'navbar'
        ? { theme: 'outline', size: 'medium', text: 'signin_with', shape: 'pill' }
        : {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            width: Math.min(400, Math.max(buttonRef.current.offsetWidth, 200)),
          }
    )
  }, [googleReady, variant])

  if (!CLIENT_ID) return null

  if (variant === 'navbar') {
    return (
      <>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <div ref={buttonRef} />
      </>
    )
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <div
        className="group relative cursor-pointer"
        onClick={() => {
          if (!window.google?.accounts?.id) {
            toast.error('Google sign-in is unavailable right now')
          }
        }}
      >
        <div
          aria-hidden="true"
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-[#DCD8E8] bg-white text-sm font-medium text-[#0F0F0F] transition-colors group-hover:bg-[#FAFAFA]"
        >
          <GoogleLogo />
          Continue with Google
        </div>
        {/* Invisible real Google button on top handles the click */}
        <div ref={buttonRef} className="google-btn-overlay absolute inset-0 opacity-0" />
      </div>
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#DCD8E8]" />
        <span className="text-xs uppercase tracking-wide text-[#6B6879]">or continue with email</span>
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
