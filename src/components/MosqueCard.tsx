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
              <h2 className="truncate text-[18px] font-semibold leading-tight tracking-[-0.01em] text-text-primary">
                {name}
              </h2>
              {isFavourited && (
                <StarIcon filled className="h-[13px] w-[13px] shrink-0 text-text-tertiary" />
              )}
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
              className="flex h-9 w-9 items-center justify-center rounded-full bg-text-primary text-white"
            >
              <NavigateIcon className="h-[17px] w-[17px]" />
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
