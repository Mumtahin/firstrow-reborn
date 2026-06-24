import Link from 'next/link'
import { formatDistance } from '@/lib/utils/distance'
import type { NextJamaatResult } from '@/lib/utils/getNextJamaat'
import FavouriteButton from './FavouriteButton'

type Props = {
  id: number
  name: string
  slug: string
  addressLine1: string
  town: string
  postcode: string
  distance: number | null
  nextJamaat: NextJamaatResult | null
  isFavourited: boolean
  userId: string | null
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

export default function MosqueCard({
  id,
  name,
  slug,
  addressLine1,
  town,
  postcode,
  distance,
  nextJamaat,
  isFavourited,
  userId,
}: Props) {
  return (
    <div className="relative rounded-2xl border border-card-border bg-white shadow-card transition active:scale-[0.99]">
      {/* Tap target covering the whole card */}
      <Link href={`/mosque/${slug}`} className="absolute inset-0 z-0 rounded-2xl" aria-label={name} />

      {/* Card content — pointer-events-none so clicks fall through to the Link */}
      <div className="pointer-events-none p-4">
        {/* Top: mosque name + address */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-[18px] font-semibold leading-tight tracking-[-0.01em] text-text-primary">
              {name}
            </h2>
            <p className="mt-0.5 truncate text-[13px] font-medium text-text-secondary">
              {addressLine1}, {town}, {postcode}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {distance !== null && (
              <span className="text-[13px] font-medium text-text-secondary">
                {formatDistance(distance)}
              </span>
            )}
            {/* Spacer so the heart doesn't overlap */}
            <span className="h-8 w-8" />
          </div>
        </div>

        {/* Bottom: countdown */}
        <div className="mt-3 border-t border-card-divider pt-3">
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
        </div>
      </div>

      {/* Favourite button — z-10 so it sits above the Link overlay */}
      <div className="absolute right-3 top-3 z-10">
        <FavouriteButton mosqueId={id} isFavourited={isFavourited} userId={userId} />
      </div>
    </div>
  )
}
