'use client'

import { useEffect, useState } from 'react'
import { track } from '@vercel/analytics'

const DISMISSED_KEY = 'firstrow_install_dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'android' | 'ios' | null

export default function InstallBanner() {
  const [platform, setPlatform] = useState<Platform>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (localStorage.getItem(DISMISSED_KEY)) return

    const ua = navigator.userAgent
    const isIOS = /iphone|ipad|ipod/i.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream
    const isAndroid = /android/i.test(ua)

    if (isIOS) {
      setPlatform('ios')
      setVisible(true)
      return
    }

    if (isAndroid) {
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setPlatform('android')
        setVisible(true)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      track('pwa_installed')
      setVisible(false)
    }
    setDeferredPrompt(null)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-3 pb-[34px]">
      <div
        className="w-full max-w-lg rounded-[18px] border border-[#DEDEDA] bg-white p-[14px]"
        style={{ boxShadow: '0 12px 32px rgba(17,17,17,0.2)' }}
      >
        {/* Top row: icon + text + dismiss */}
        <div className="mb-[13px] flex items-center gap-3">
          {/* F icon with green dot */}
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#111]">
            <span className="font-sans text-[22px] font-bold leading-none text-white">F</span>
            <span className="absolute right-[9px] top-[9px] h-[7px] w-[7px] rounded-full bg-[#22C55E] shadow-[0_0_0_2px_#111]" />
          </div>

          {/* Text */}
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <span className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[#111]">
              Add FirstRow to home screen
            </span>
            <span className="text-[13px] font-medium text-[#888]">
              Opens instantly · works offline
            </span>
          </div>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="flex h-[26px] w-[26px] shrink-0 cursor-pointer items-center justify-center"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="#B0B0AA" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Bottom: Android button or iOS instructions */}
        {platform === 'android' ? (
          <button
            onClick={install}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] bg-[#111] py-[14px] text-[15px] font-semibold text-white transition-transform duration-[200ms] ease-out active:scale-[0.98]"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v12M7 11l5 5 5-5M5 21h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add to Home Screen
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-[12px] border border-[#E7EAF2] bg-[#F6F7FB] px-[13px] py-[11px]">
            <span className="text-[14px] font-medium leading-snug text-[#444]">
              Tap{' '}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="inline-block align-[-2px] mx-[1px]">
                <path d="M12 15V4M8 8l4-4 4 4" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 12v6a2 2 0 002 2h8a2 2 0 002-2v-6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {' '}in Safari, then{' '}
              <strong className="font-bold text-[#111]">Add to Home Screen</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
