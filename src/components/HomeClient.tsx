'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { haversineDistance } from '@/lib/utils/distance'
import { getNextJamaat, parseTime, toUKMinutes } from '@/lib/utils/getNextJamaat'
import type { Prayer, NextJamaatResult } from '@/lib/utils/getNextJamaat'
import type { MosqueWithTimes } from '@/lib/db/queries'
import MosqueCard from './MosqueCard'
import StarIcon from './icons/StarIcon'
import MapPinIcon from './icons/MapPinIcon'

const MosqueMap = dynamic(() => import('./MosqueMap'), { ssr: false })

const PRAYER_PILLS: { key: Prayer; label: string }[] = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'zuhr', label: 'Zuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
]

function getSpecificPrayerJamaat(
  mosque: MosqueWithTimes,
  prayer: Prayer,
  now: Date
): NextJamaatResult | null {
  const jamaat = mosque[`${prayer}Jamaat` as keyof MosqueWithTimes] as string | null
  if (!jamaat) return null
  const currentMinutes = toUKMinutes(now)
  const jamaatMinutes = parseTime(jamaat)
  if (jamaatMinutes >= currentMinutes) {
    return { prayer, time: jamaat, isNextDay: false, minutesUntil: jamaatMinutes - currentMinutes }
  }
  if (currentMinutes - jamaatMinutes <= 10) {
    return { prayer, time: jamaat, isNextDay: false, minutesUntil: 0, justStarted: true }
  }
  return null
}

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
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null)
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

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const enriched = mosques
    .map((m) => ({
      ...m,
      distance: location.status === 'granted'
        ? haversineDistance(location.lat, location.lng, m.lat, m.lng)
        : null,
      nextJamaat: selectedPrayer
        ? getSpecificPrayerJamaat(m, selectedPrayer, now)
        : getNextJamaat(m, now, m.tomorrowFajrJamaat),
    }))
    .filter((m) => !selectedPrayer || m.nextJamaat !== null)
    .sort((a, b) => {
      if (selectedPrayer) {
        return (a.nextJamaat?.minutesUntil ?? 0) - (b.nextJamaat?.minutesUntil ?? 0)
      }
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance
      return 0
    })

  const favourites = enriched.filter((m) => favSet.has(m.id))
  const nearby = enriched.filter((m) => !favSet.has(m.id))

  return (
    <div className="flex flex-col">
      {/* Map / location states */}
      {location.status === 'pending' && (
        <div className="mx-4 mb-4 flex h-48 items-center justify-center rounded-2xl bg-card-divider">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-card-border-fav border-t-text-tertiary" />
        </div>
      )}
      {location.status === 'granted' && (
        <div className="mb-4 px-4">
          <MosqueMap mosques={mosques} userLat={location.lat} userLng={location.lng} />
        </div>
      )}
      {(location.status === 'denied' || location.status === 'unavailable') && (
        <div className="mx-4 mb-4 rounded-2xl border border-card-border bg-white px-4 py-3">
          <p className="text-[13px] font-semibold text-text-primary">Location access needed</p>
          <p className="mt-0.5 text-[13px] font-medium text-text-secondary">
            Allow location access to sort by proximity.
          </p>
        </div>
      )}

      {/* Prayer filter pills */}
      <div className="flex gap-[7px] overflow-x-auto px-4 pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setSelectedPrayer(null)}
          className={`shrink-0 rounded-full px-[14px] py-[7px] text-[13px] font-semibold transition-colors ${
            selectedPrayer === null
              ? 'bg-text-primary text-white'
              : 'border border-card-border bg-white text-text-secondary'
          }`}
        >
          Next
        </button>
        {PRAYER_PILLS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedPrayer(selectedPrayer === key ? null : key)}
            className={`shrink-0 rounded-full px-[14px] py-[7px] text-[13px] font-semibold transition-colors ${
              selectedPrayer === key
                ? 'bg-text-primary text-white'
                : 'border border-card-border bg-white text-text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-[22px] px-4 pb-7 pt-1">

        {/* Favourites section — only shown when signed in and has favourites */}
        {userId && favourites.length > 0 && (
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-center gap-[7px] px-0.5">
              <StarIcon filled className="h-[13px] w-[13px] text-text-tertiary" />
              <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-text-tertiary">
                Favourites
              </span>
            </div>
            {favourites.map((m) => (
              <MosqueCard
                key={m.id}
                name={m.name}
                slug={m.slug}
                lat={m.lat}
                lng={m.lng}
                distance={m.distance}
                nextJamaat={m.nextJamaat}
                isFavourited={true}
              />
            ))}
          </div>
        )}

        {/* Nearby section */}
        {nearby.length > 0 ? (
          <div className="flex flex-col gap-[10px]">
            {userId && favourites.length > 0 && (
              <div className="flex items-center gap-[7px] px-0.5">
                <MapPinIcon className="h-[13px] w-[13px] text-text-tertiary" />
                <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-text-tertiary">
                  Nearby
                </span>
              </div>
            )}
            {nearby.map((m) => (
              <MosqueCard
                key={m.id}
                name={m.name}
                slug={m.slug}
                lat={m.lat}
                lng={m.lng}
                distance={m.distance}
                nextJamaat={m.nextJamaat}
                isFavourited={false}
              />
            ))}
          </div>
        ) : selectedPrayer && favourites.length === 0 && (
          <p className="px-0.5 text-[13px] font-medium text-text-tertiary">
            No mosques with upcoming {PRAYER_PILLS.find(p => p.key === selectedPrayer)?.label} nearby.
          </p>
        )}

      </div>
    </div>
  )
}
