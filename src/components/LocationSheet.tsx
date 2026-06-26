'use client'

import { useEffect, useRef, useState } from 'react'
import CrosshairIcon from '@/components/icons/CrosshairIcon'
import MapPinIcon from '@/components/icons/MapPinIcon'

type Suggestion = {
  id: string
  label: string
  sublabel: string
  lat: number
  lng: number
}

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (loc: { lat: number; lng: number; label: string }) => void
  onUseGPS: () => void
  isManual: boolean
}

export default function LocationSheet({ open, onClose, onSelect, onUseGPS, isManual }: Props) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSuggestions([])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = query.trim()
    if (!trimmed) {
      setSuggestions([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (!token) { setLoading(false); return }
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?access_token=${token}&country=GB&types=postcode,place,neighborhood,locality&limit=5&autocomplete=true`
        )
        const data = await res.json()
        const features: { id: string; text: string; place_name: string; center: [number, number] }[] = data.features ?? []
        setSuggestions(features.map((f) => {
          const [lng, lat] = f.center
          const commaIdx = f.place_name.indexOf(',')
          const sublabel = commaIdx !== -1 ? f.place_name.slice(commaIdx + 2) : ''
          return { id: f.id, label: f.text, sublabel, lat, lng }
        }))
      } catch {
        // silently fail
      }
      setLoading(false)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-[#FAFAF8]">
      <div className="flex w-full max-w-lg flex-col flex-1 min-h-0">

        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 pb-3 pt-[54px]">
          <div className="flex flex-1 items-center gap-[9px] rounded-[13px] border-[1.5px] border-text-primary bg-white px-[13px] py-[11px]">
            <MapPinIcon className="h-[15px] w-[15px] shrink-0 text-text-tertiary" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Postcode or neighbourhood"
              className="flex-1 bg-transparent text-[15px] font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); inputRef.current?.focus() }}
                aria-label="Clear"
                className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#E2E2DE]"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-[15px] font-semibold text-text-primary"
          >
            Cancel
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pt-[6px]">

          {/* Use my location row */}
          <button
            onClick={onUseGPS}
            className="flex w-full items-center gap-[13px] border-b border-[#F3F3F0] px-0.5 py-[14px]"
          >
            <CrosshairIcon className={`h-[18px] w-[18px] shrink-0 ${isManual ? 'text-text-secondary' : 'text-urgent-go'}`} />
            <span className={`flex-1 text-left text-[15px] ${isManual ? 'font-medium text-text-primary' : 'font-semibold text-urgent-go'}`}>
              Use my location
            </span>
            {!isManual && (
              <span className="text-[12px] font-semibold text-urgent-go">Active</span>
            )}
          </button>

          {/* Spinner */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-card-border border-t-text-tertiary" />
            </div>
          )}

          {/* No results */}
          {!loading && query.trim() !== '' && suggestions.length === 0 && (
            <p className="pt-8 text-center text-[13px] font-medium text-text-tertiary">
              No results for &ldquo;{query.trim()}&rdquo;
            </p>
          )}

          {/* Suggestions */}
          {!loading && suggestions.length > 0 && (
            <div className="flex flex-col">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelect({ lat: s.lat, lng: s.lng, label: s.label })}
                  className="flex w-full items-center gap-[13px] border-b border-[#F3F3F0] px-0.5 py-[14px] last:border-0 text-left"
                >
                  <MapPinIcon className="h-[18px] w-[18px] shrink-0 text-text-tertiary" />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-[15px] font-medium text-text-primary">{s.label}</span>
                    {s.sublabel && (
                      <span className="truncate text-[13px] font-medium text-text-tertiary">{s.sublabel}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
