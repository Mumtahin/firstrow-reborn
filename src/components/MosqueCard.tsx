import Link from 'next/link'
import { formatDistance } from '@/lib/utils/distance'
import { estimateTravelMinutes } from '@/lib/utils/feasibility'
import type { NextJamaatResult } from '@/lib/utils/getNextJamaat'
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

function countdownDisplay(minutes: number): { value: string; unit: string } {
  if (minutes < 60) return { value: String(minutes), unit: 'min' }
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return { value: String(h), unit: 'h' }
  return { value: `${h}h ${m}`, unit: 'm' }
}

function urgencyColour(minutes: number, isNextDay: boolean): string {
  if (isNextDay) return 'text-text-tertiary'
  if (minutes >= 18) return 'text-urgent-go'
  if (minutes >= 5) return 'text-urgent-tight'
  return 'text-urgent-late'
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

        {/* TOP: countdown + prayer name/time */}
        {nextJamaat ? (() => {
          const { value, unit } = countdownDisplay(nextJamaat.minutesUntil)
          const colour = urgencyColour(nextJamaat.minutesUntil, nextJamaat.isNextDay)
          return (
            <div className="flex items-end justify-between">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-text-tertiary">
                  {nextJamaat.isNextDay ? 'Tomorrow' : 'Starts in'}
                </p>
                <div className="flex items-baseline">
                  <span className={`font-mono text-[42px] font-bold leading-[0.9] tracking-[-0.03em] ${colour}`}>
                    {value}
                  </span>
                  <span className={`ml-[7px] text-[17px] font-semibold ${colour}`}>
                    {unit}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold text-text-primary">
                  {PRAYER_LABELS[nextJamaat.prayer]}
                </p>
                <p className="font-mono text-[13px] font-medium text-text-tertiary">
                  {nextJamaat.time}
                </p>
              </div>
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
              <h2 className="whitespace-nowrap text-[18px] font-semibold leading-tight tracking-[-0.01em] text-text-primary">
                {name}
              </h2>
              {isFavourited && (
                <svg width="13" height="13" viewBox="0 0 15 15" fill="currentColor" className="shrink-0 text-text-tertiary">
                  <path d="M7.5 12.5L2.5 7.5C1.5 6.5 1.5 4.5 3 3.5C4.5 2.5 6 3 7.5 5C9 3 10.5 2.5 12 3.5C13.5 4.5 13.5 6.5 12.5 7.5L7.5 12.5Z" />
                </svg>
              )}
            </div>
            {distance !== null && (
              <p className="mt-1 text-[13px] font-medium text-text-secondary">
                {travelLine(distance)}
              </p>
            )}
          </div>

          {/* Directions button */}
          <div className="pointer-events-auto shrink-0">
            <a
              href={`https://maps.google.com/?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-[6px] rounded-[12px] bg-text-primary px-[14px] py-[8px] text-[14px] font-semibold text-white"
            >
              Directions
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7.5H12M12 7.5L8.5 4M12 7.5L8.5 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
