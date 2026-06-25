'use client'

import Link from 'next/link'
import { signIn, signOut } from 'next-auth/react'
import ChevronRightIcon from '@/components/icons/ChevronRightIcon'
import InfoIcon from '@/components/icons/InfoIcon'
import MessageSquareIcon from '@/components/icons/MessageSquareIcon'

interface AccountPanelProps {
  open: boolean
  onClose: () => void
  isSignedIn: boolean
  userName: string | null
  userImage: string | null
}

export default function AccountPanel({ open, onClose, isSignedIn, userName }: AccountPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg rounded-t-[24px] bg-white px-4 pb-8 pt-5 transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#E2E2DE]" />

        {/* Section label */}
        <p className="mb-[8px] px-1 text-[11px] font-bold uppercase tracking-[0.07em] text-text-tertiary">
          FirstRow
        </p>

        {/* Info card */}
        <div className="overflow-hidden rounded-2xl border border-card-border bg-white divide-y divide-[#F3F3F0]">
          <Link
            href="/about"
            onClick={onClose}
            className="flex w-full items-center gap-[13px] px-4 py-[14px] transition-opacity duration-[200ms] ease-out active:opacity-60"
          >
            <InfoIcon className="h-[18px] w-[18px] text-text-secondary shrink-0" />
            <span className="flex-1 text-[15px] font-medium text-text-primary">About FirstRow</span>
            <ChevronRightIcon className="h-[13px] w-[8px] text-[#C8C8C2]" />
          </Link>
          <a
            href="mailto:showcase.unstaffed520@passmail.net?subject=FirstRow%20feedback"
            className="flex w-full items-center gap-[13px] px-4 py-[14px] transition-opacity duration-[200ms] ease-out active:opacity-60"
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
                className="w-full rounded-2xl border border-card-border bg-white py-[14px] text-[15px] font-semibold text-text-primary"
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
                className="w-full rounded-2xl bg-text-primary py-[14px] text-[15px] font-semibold text-white"
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
