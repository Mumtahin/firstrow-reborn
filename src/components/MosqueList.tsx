'use client'

import { useEffect, useState } from 'react'
import { haversineDistance } from '@/lib/utils/distance'
import { getNextJamaat } from '@/lib/utils/getNextJamaat'
import type { MosqueWithTimes } from '@/lib/db/queries'
import MosqueCard from './MosqueCard'

type Props = {
  mosques: MosqueWithTimes[]
}

type LocationState =
  | { status: 'pending' }
  | { status: 'granted'; lat: number; lng: number }
  | { status: 'denied' }
  | { status: 'unavailable' }

export default function MosqueList({ mosques }: Props) {
  const [location, setLocation] = useState<LocationState>({ status: 'pending' })

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ status: 'unavailable' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ status: 'granted', lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ status: 'denied' })
    )
  }, [])

  if (location.status === 'pending') {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
        <p className="text-sm">Getting your location…</p>
      </div>
    )
  }

  if (location.status === 'denied' || location.status === 'unavailable') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium">Location access needed</p>
        <p className="mt-1 text-amber-700">
          Allow location access to see nearby mosques, or{' '}
          <button className="underline">search by postcode</button>.
        </p>
      </div>
    )
  }

  const now = new Date()
  const sorted = mosques
    .map((m) => ({
      ...m,
      distance: haversineDistance(location.lat, location.lng, m.lat, m.lng),
      nextJamaat: getNextJamaat(m, now),
    }))
    .sort((a, b) => a.distance - b.distance)

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((m) => (
        <MosqueCard
          key={m.id}
          name={m.name}
          slug={m.slug}
          addressLine1={m.addressLine1}
          town={m.town}
          postcode={m.postcode}
          distance={m.distance}
          nextJamaat={m.nextJamaat}
        />
      ))}
    </div>
  )
}
