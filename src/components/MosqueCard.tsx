'use client'

import Link from 'next/link'
import { formatDistance } from '@/lib/utils/distance'
import { estimateTravelMinutes } from '@/lib/utils/feasibility'
import type { NextJamaatResult } from '@/lib/utils/getNextJamaat'
import type { AmenityFilters } from '@/components/FilterSheet'
import StarIcon from '@/components/icons/StarIcon'
import NavigateIcon from '@/components/icons/NavigateIcon'

type Props = {
  name: string
  slug: string
  lat: number
  lng: number
  distance: number | null
  nextJamaat: NextJamaatResult | null
  isFavourited: boolean
  activeFilters?: AmenityFilters
}

type AmenityTagProps = {
  icon: React.ReactNode
  label: string
}

function AmenityTag({ icon, label }: AmenityTagProps) {
  return (
    <span className="inline-flex items-center gap-[5px] rounded-full border border-card-border px-[10px] py-[5px] text-[12px] font-medium text-text-secondary">
      {icon}
      {label}
    </span>
  )
}

function WomensSpaceIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="5" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="5" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20v-5a5 5 0 0 1 5-5h1a5 5 0 0 1 5 5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function StepFreeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 9h4l2 4h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 13v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ParkingIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const PRAYER_LABELS: Record<string, string> = {
  fajr: 'Fajr',
  zuhr: 'Zuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

function getPrayerCardLabel(key: string): string {
  if (key === 'zuhr' && new Date().getDay() === 5) return 'Jummah'
  return `${PRAYER_LABELS[key] ?? key} Jamaat`
}

function formatTime(time: string): { display: string; ampm: string } {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return { display: `${h12}:${String(m).padStart(2, '0')}`, ampm }
}

function countdownText(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function travelLine(distance: number | null): string {
  if (distance === null) return ''
  const mins = estimateTravelMinutes(distance)
  const mode = distance <= 0.5 ? 'walk' : 'drive'
  return `${mins} min ${mode} · ${formatDistance(distance)}`
}

export default function MosqueCard({
  name,
  slug,
  lat,
  lng,
  distance,
  nextJamaat,
  isFavourited,
  activeFilters,
}: Props) {
  const amenityTags = activeFilters ? [
    activeFilters.womensSpace && { key: 'womensSpace', label: "Women's space", icon: <WomensSpaceIcon /> },
    activeFilters.stepFree && { key: 'stepFree', label: 'Step-free', icon: <StepFreeIcon /> },
    activeFilters.parking && { key: 'parking', label: 'Parking', icon: <ParkingIcon /> },
  ].filter(Boolean) as { key: string; label: string; icon: React.ReactNode }[] : []
  return (
    <div className="relative rounded-2xl border border-card-border bg-white dark:bg-[#1D1B18] shadow-card transition-transform duration-[200ms] ease-out active:scale-[0.99]">
      {/* Full-card tap target */}
      <Link href={`/mosque/${slug}`} className="absolute inset-0 z-0 cursor-pointer rounded-2xl" aria-label={name} />

      <div className="pointer-events-none flex flex-col gap-[13px] px-4 py-[15px]">

        {/* TOP: prayer label left + jamaat time left + countdown right */}
        {nextJamaat ? (() => {
          const { display, ampm } = formatTime(nextJamaat.time)

          let timeColour: string
          let label: string

          if (nextJamaat.isNextDay) {
            timeColour = 'text-text-tertiary'
            label = getPrayerCardLabel(nextJamaat.prayer)
          } else if (nextJamaat.justStarted) {
            timeColour = 'text-urgent-go'
            label = getPrayerCardLabel(nextJamaat.prayer)
          } else if (nextJamaat.minutesUntil >= 18) {
            timeColour = 'text-urgent-go'
            label = getPrayerCardLabel(nextJamaat.prayer)
          } else if (nextJamaat.minutesUntil >= 5) {
            timeColour = 'text-urgent-tight'
            label = getPrayerCardLabel(nextJamaat.prayer)
          } else {
            timeColour = 'text-urgent-late'
            label = getPrayerCardLabel(nextJamaat.prayer)
          }

          const showCountdown = !nextJamaat.isNextDay && !nextJamaat.justStarted

          return (
            <div className="flex items-flex-end justify-between">
              <div className="flex flex-col gap-[3px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
                  {label}
                </p>
                <div className="flex items-baseline">
                  <span className={`font-mono text-[34px] font-bold leading-[0.9] tracking-[-0.03em] ${timeColour}`}>
                    {display}
                  </span>
                  <span className="ml-[6px] text-[15px] font-semibold tracking-normal text-text-tertiary">
                    {ampm}
                  </span>
                </div>
              </div>
              {showCountdown && (
                <span className="font-mono text-[15px] font-semibold text-text-secondary self-end">
                  {countdownText(nextJamaat.minutesUntil)}
                </span>
              )}
            </div>
          )
        })() : (
          <p className="text-[13px] text-text-tertiary">No prayer times available</p>
        )}

        {/* DIVIDER */}
        <div className="h-px bg-card-divider" />

        {/* BOTTOM: mosque name + distance + directions */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-[6px]">
              {isFavourited && (
                <StarIcon filled className="h-[14px] w-[14px] shrink-0 text-text-primary" />
              )}
              <h2 className="truncate text-[18px] font-semibold leading-tight tracking-[-0.01em] text-text-primary">
                {name}
              </h2>
            </div>
            {distance !== null && (
              <p className="mt-1 text-[13px] font-medium text-text-secondary">
                {travelLine(distance)}
              </p>
            )}
          </div>

          {/* Directions icon button */}
          <div className="pointer-events-auto shrink-0">
            <a
              href={`https://maps.google.com/?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Directions"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-text-primary text-[#FAFAF8] dark:text-[#16130F] transition-transform duration-[200ms] ease-out active:scale-[0.92]"
            >
              <NavigateIcon className="h-[18px] w-[18px]" />
            </a>
          </div>
        </div>

        {/* Amenity tags — shown when filters are active */}
        {amenityTags.length > 0 && (
          <div className="flex flex-wrap gap-[6px]">
            {amenityTags.map((tag) => (
              <AmenityTag key={tag.key} icon={tag.icon} label={tag.label} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
