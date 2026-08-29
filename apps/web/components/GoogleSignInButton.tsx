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
  const [scriptReady, setScriptReady] = useState(false)

  useEffect(() => {
    if (!CLIENT_ID || !scriptReady || !buttonRef.current || !window.google) return

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

    window.google.accounts.id.renderButton(
      buttonRef.current,
      variant === 'navbar'
        ? { theme: 'outline', size: 'medium', text: 'signin_with', shape: 'pill' }
        : { theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', width: 320 }
    )
  }, [scriptReady, variant])

  if (!CLIENT_ID) return null

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      {variant === 'card' && (
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-[#D9D4CE]" />
          <span className="text-xs uppercase tracking-wide text-[#6B6560]">or</span>
          <div className="h-px flex-1 bg-[#D9D4CE]" />
        </div>
      )}
      <div ref={buttonRef} className={variant === 'navbar' ? '' : 'flex justify-center'} />
    </>
  )
}
