import Link from 'next/link'
import { distanceColour, formatDistance } from '@/lib/utils/distance'
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
    <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md active:scale-[0.99]">
      {/* Tap target covering the whole card */}
      <Link href={`/mosque/${slug}`} className="absolute inset-0 z-0 rounded-xl" aria-label={name} />

      {/* Card content — pointer-events-none so clicks fall through to the Link */}
      <div className="pointer-events-none p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-gray-900">{name}</h2>
            <p className="mt-0.5 truncate text-sm text-gray-500">
              {addressLine1}, {town}, {postcode}
            </p>
          </div>
          {distance !== null && (
            <span className={`shrink-0 text-sm font-medium ${distanceColour(distance)}`}>
              {formatDistance(distance)}
            </span>
          )}
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3">
          {nextJamaat ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {nextJamaat.isNextDay ? 'Tomorrow' : 'Next'} jamaat
              </span>
              <span className="font-semibold text-gray-900">
                {PRAYER_LABELS[nextJamaat.prayer]} · {nextJamaat.time}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No prayer times available</p>
          )}
        </div>
      </div>

      {/* Favourite button sits above the Link overlay */}
      <div className="absolute bottom-3 right-3 z-10">
        <FavouriteButton mosqueId={id} isFavourited={isFavourited} userId={userId} />
      </div>
    </div>
  )
}
