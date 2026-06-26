'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getNextJamaat } from '@/lib/utils/getNextJamaat'
import type { MosqueWithTimes } from '@/lib/db/queries'

type Props = {
  open: boolean
  onClose: () => void
  mosques: MosqueWithTimes[]
}

function MosqueIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 11l9-8 9 8M5 10v10h14V10" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function countdownRight(minutesUntil: number, justStarted?: boolean): { value: string; unit: string } {
  if (justStarted) return { value: 'Now', unit: '' }
  if (minutesUntil < 60) return { value: String(minutesUntil), unit: 'min' }
  const h = Math.floor(minutesUntil / 60)
  const m = minutesUntil % 60
  return m === 0 ? { value: `${h}h`, unit: '' } : { value: `${h}h`, unit: `${m}m` }
}

export default function SearchOverlay({ open, onClose, mosques }: Props) {
  const [query, setQuery] = useState('')
  const [now, setNow] = useState(() => new Date())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setNow(new Date())
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const results = query.trim()
    ? mosques.filter((m) => m.name.toLowerCase().includes(query.toLowerCase().trim()))
    : []

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center bg-[#FAFAF8] dark:bg-[#131210] transition-[opacity,transform] ease-out ${
        open
          ? 'opacity-100 translate-y-0 duration-[220ms] pointer-events-auto'
          : 'opacity-0 translate-y-[8px] duration-[180ms] pointer-events-none'
      }`}
    >
      <div className="flex w-full max-w-lg flex-col flex-1 min-h-0">

        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 pb-3 pt-[54px]">
          <div className="flex flex-1 items-center gap-[9px] rounded-[13px] border-[1.5px] border-text-primary bg-white dark:bg-[#1D1B18] px-[13px] py-[11px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <circle cx="11" cy="11" r="7" stroke="#888" strokeWidth="2" />
              <path d="M21 21l-4-4" stroke="#888" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mosques"
              className="flex-1 bg-transparent text-[15px] font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); inputRef.current?.focus() }}
                aria-label="Clear"
                className="flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#E2E2DE]"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          {/* Cancel fades in with the overlay */}
          <button
            onClick={onClose}
            className={`shrink-0 cursor-pointer text-[15px] font-semibold text-text-primary transition-opacity duration-[220ms] ${open ? 'opacity-100' : 'opacity-0'}`}
          >
            Cancel
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pt-[6px]">
          {query.trim() === '' ? (
            <p className="pt-8 text-center text-[13px] font-medium text-text-tertiary">
              Type a mosque name to search
            </p>
          ) : results.length === 0 ? (
            <p className="pt-8 text-center text-[13px] font-medium text-text-tertiary">
              No results for &ldquo;{query.trim()}&rdquo;
            </p>
          ) : (
            <>
              <p className="mb-1 mt-[6px] px-0.5 text-[11px] font-bold uppercase tracking-[0.07em] text-text-tertiary">
                Mosques
              </p>
              <div className="flex flex-col">
                {results.map((m, i) => {
                  const nextJamaat = getNextJamaat(m, now, m.tomorrowFajrJamaat)
                  const cd = nextJamaat && !nextJamaat.isNextDay
                    ? countdownRight(nextJamaat.minutesUntil, nextJamaat.justStarted)
                    : null

                  return (
                    <Link
                      key={m.slug}
                      href={`/mosque/${m.slug}`}
                      onClick={onClose}
                      className="animate-fade-up flex cursor-pointer items-center gap-[13px] border-b border-[#F3F3F0] px-0.5 py-[12px] last:border-0"
                      style={{ animationDelay: `${i * 20}ms` }}
                    >
                      <MosqueIcon />
                      <span className="flex-1 text-[16px] font-medium text-text-primary">{m.name}</span>
                      {cd && (
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-[16px] font-bold leading-none text-urgent-go">
                            {cd.value}
                          </span>
                          {cd.unit && (
                            <span className="text-[11px] font-semibold text-text-tertiary">{cd.unit}</span>
                          )}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
