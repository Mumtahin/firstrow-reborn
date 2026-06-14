'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { haversineDistance } from '@/lib/utils/distance'
import { getNextJamaat } from '@/lib/utils/getNextJamaat'
import type { MosqueWithTimes } from '@/lib/db/queries'
import MosqueCard from './MosqueCard'

const MosqueMap = dynamic(() => import('./MosqueMap'), { ssr: false })

type Props = {
  mosques: MosqueWithTimes[]
  favouriteIds: number[]
  userId: string | null
}

type LocationState =
  | { status: 'pending' }
  | { status: 'granted'; lat: number; lng: number }
  | { status: 'denied' }
  | { status: 'unavailable' }

export default function HomeClient({ mosques, favouriteIds, userId }: Props) {
  const [location, setLocation] = useState<LocationState>({ status: 'pending' })
  const [now, setNow] = useState(() => new Date())
  const favSet = new Set(favouriteIds)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ status: 'unavailable' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({ status: 'granted', lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ status: 'denied' })
    )
  }, [])

  // Update countdowns every minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const sortedMosques =
    location.status === 'granted'
      ? mosques
          .map((m) => ({
            ...m,
            distance: haversineDistance(location.lat, location.lng, m.lat, m.lng),
            nextJamaat: getNextJamaat(m, now, m.tomorrowFajrJamaat),
          }))
          .sort((a, b) => a.distance - b.distance)
      : mosques.map((m) => ({ ...m, distance: null, nextJamaat: getNextJamaat(m, now, m.tomorrowFajrJamaat) }))

  return (
    <div className="flex flex-col gap-4">
      {location.status === 'pending' && (
        <div className="flex h-64 w-full items-center justify-center rounded-xl bg-gray-100">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        </div>
      )}

      {location.status === 'granted' && (
        <MosqueMap mosques={mosques} userLat={location.lat} userLng={location.lng} />
      )}

      {(location.status === 'denied' || location.status === 'unavailable') && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Location access needed</p>
          <p className="mt-1 text-amber-700">
            Allow location access to see nearby mosques and the map.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm tracking-wide text-gray-400">
          {location.status === 'granted' ? 'Nearest mosques' : 'All mosques'}
        </h2>
        {sortedMosques.map((m) => (
          <MosqueCard
            key={m.id}
            id={m.id}
            name={m.name}
            slug={m.slug}
            addressLine1={m.addressLine1}
            town={m.town}
            postcode={m.postcode}
            distance={m.distance}
            nextJamaat={m.nextJamaat}
            isFavourited={favSet.has(m.id)}
            userId={userId}
          />
        ))}
      </div>
    </div>
  )
}
