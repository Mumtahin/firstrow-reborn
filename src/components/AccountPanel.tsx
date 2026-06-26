'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { signIn, signOut } from 'next-auth/react'
import ChevronRightIcon from '@/components/icons/ChevronRightIcon'
import InfoIcon from '@/components/icons/InfoIcon'
import MessageSquareIcon from '@/components/icons/MessageSquareIcon'

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

interface AccountPanelProps {
  open: boolean
  onClose: () => void
  isSignedIn: boolean
  userName: string | null
  userImage: string | null
}

export default function AccountPanel({ open, onClose, isSignedIn, userName }: AccountPanelProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 cursor-pointer bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg rounded-t-[24px] bg-white dark:bg-[#1D1B18] px-4 pb-8 pt-5 transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#E2E2DE] dark:bg-[#3A3630]" />

        {/* Appearance */}
        <p className="mb-[9px] px-0.5 text-[11px] font-bold uppercase tracking-[0.07em] text-text-tertiary">
          Appearance
        </p>
        <div className="mb-[18px] flex gap-1 rounded-[13px] bg-[#F2F2EF] dark:bg-[#1D1B18] dark:border dark:border-[#2F2C27] p-1">
          {(['system', 'light', 'dark'] as const).map((t) => {
            const active = mounted && theme === t
            return (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-[9px] py-[10px] text-[14px] font-semibold transition-all duration-[200ms] ${
                  active
                    ? 'bg-white dark:bg-[#3A3630] text-text-primary shadow-[0_1px_2px_rgba(17,17,17,0.1)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)] border border-[#E7E7E2] dark:border-transparent'
                    : 'text-text-tertiary'
                }`}
              >
                {t === 'dark' && <MoonIcon className={active ? 'text-urgent-go' : 'text-text-tertiary'} />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            )
          })}
        </div>

        {/* Section label */}
        <p className="mb-[8px] px-1 text-[11px] font-bold uppercase tracking-[0.07em] text-text-tertiary">
          FirstRow
        </p>

        {/* Info card */}
        <div className="overflow-hidden rounded-2xl border border-card-border bg-white dark:bg-[#1D1B18] divide-y divide-[#F3F3F0] dark:divide-[#2A2722]">
          <Link
            href="/about"
            onClick={onClose}
            className="flex w-full cursor-pointer items-center gap-[13px] px-4 py-[14px] transition-opacity duration-[200ms] ease-out active:opacity-60"
          >
            <InfoIcon className="h-[18px] w-[18px] text-text-secondary shrink-0" />
            <span className="flex-1 text-[15px] font-medium text-text-primary">About FirstRow</span>
            <ChevronRightIcon className="h-[13px] w-[8px] text-[#C8C8C2]" />
          </Link>
          <a
            href="mailto:showcase.unstaffed520@passmail.net?subject=FirstRow%20feedback"
            className="flex w-full cursor-pointer items-center gap-[13px] px-4 py-[14px] transition-opacity duration-[200ms] ease-out active:opacity-60"
          >
            <MessageSquareIcon className="h-[18px] w-[18px] text-text-secondary shrink-0" />
            <span className="flex-1 text-[15px] font-medium text-text-primary">Send feedback</span>
            <ChevronRightIcon className="h-[13px] w-[8px] text-[#C8C8C2]" />
          </a>
        </div>

        {/* Auth section */}
        <div className="mt-[18px]">
          {isSignedIn ? (
            <>
              <p className="mb-3 px-1 text-[13px] font-medium text-text-secondary">
                Signed in as {userName}
              </p>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full cursor-pointer rounded-2xl border border-card-border bg-white dark:bg-[#1D1B18] py-[14px] text-[15px] font-semibold text-text-primary"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <p className="mb-3 px-1 text-[13px] font-medium text-text-secondary">
                Sign in to pin favourite mosques and get reminders.
              </p>
              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="w-full cursor-pointer rounded-2xl bg-text-primary py-[14px] text-[15px] font-semibold text-[#FAFAF8] dark:text-[#16130F]"
              >
                Continue with Google
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
