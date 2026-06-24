'use client'

import Link from 'next/link'
import { formatDistance } from '@/lib/utils/distance'
import { estimateTravelMinutes } from '@/lib/utils/feasibility'
import type { NextJamaatResult } from '@/lib/utils/getNextJamaat'
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
}

const PRAYER_LABELS: Record<string, string> = {
  fajr: 'Fajr',
  zuhr: 'Zuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
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
}: Props) {
  return (
    <div className="relative rounded-2xl border border-card-border bg-white shadow-card transition active:scale-[0.99]">
      {/* Full-card tap target */}
      <Link href={`/mosque/${slug}`} className="absolute inset-0 z-0 rounded-2xl" aria-label={name} />

      <div className="pointer-events-none flex flex-col gap-[13px] px-4 py-[15px]">

        {/* TOP: prayer label left + jamaat time left + countdown right */}
        {nextJamaat ? (() => {
          const { display, ampm } = formatTime(nextJamaat.time)

          let timeColour: string
          let label: string

          if (nextJamaat.isNextDay) {
            timeColour = 'text-text-tertiary'
            label = `${PRAYER_LABELS[nextJamaat.prayer]} Jamaat`
          } else if (nextJamaat.justStarted) {
            timeColour = 'text-urgent-go'
            label = `${PRAYER_LABELS[nextJamaat.prayer]} Jamaat`
          } else if (nextJamaat.minutesUntil >= 18) {
            timeColour = 'text-urgent-go'
            label = `${PRAYER_LABELS[nextJamaat.prayer]} Jamaat`
          } else if (nextJamaat.minutesUntil >= 5) {
            timeColour = 'text-urgent-tight'
            label = `${PRAYER_LABELS[nextJamaat.prayer]} Jamaat`
          } else {
            timeColour = 'text-urgent-late'
            label = `${PRAYER_LABELS[nextJamaat.prayer]} Jamaat`
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
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-text-primary text-white"
            >
              <NavigateIcon className="h-[18px] w-[18px]" />
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
