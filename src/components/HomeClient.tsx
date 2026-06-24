'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { haversineDistance } from '@/lib/utils/distance'
import { getNextJamaat } from '@/lib/utils/getNextJamaat'
import type { MosqueWithTimes } from '@/lib/db/queries'
import MosqueCard from './MosqueCard'
import StarIcon from './icons/StarIcon'
import MapPinIcon from './icons/MapPinIcon'

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

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const enriched =
    location.status === 'granted'
      ? mosques
          .map((m) => ({
            ...m,
            distance: haversineDistance(location.lat, location.lng, m.lat, m.lng),
            nextJamaat: getNextJamaat(m, now, m.tomorrowFajrJamaat),
          }))
          .sort((a, b) => a.distance - b.distance)
      : mosques.map((m) => ({ ...m, distance: null, nextJamaat: getNextJamaat(m, now, m.tomorrowFajrJamaat) }))

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

      {/* Helper text */}
      <p className="px-4 pb-3 text-[13px] font-medium text-text-tertiary">
        {location.status === 'granted' ? 'Nearest jamaats first' : 'All mosques'}
      </p>

      {/* Sections */}
      <div className="flex flex-col gap-[22px] px-4 pb-7 pt-1">

        {/* Favourites section — only shown when signed in */}
        {userId && (
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-center gap-[7px] px-0.5">
              <StarIcon filled className="h-[13px] w-[13px] text-text-tertiary" />
              <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-text-tertiary">
                Favourites
              </span>
            </div>
            {favourites.length > 0 ? (
              favourites.map((m) => (
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
              ))
            ) : (
              <p className="px-0.5 text-[13px] font-medium text-text-tertiary">
                Tap ☆ on a mosque to save it here.
              </p>
            )}
          </div>
        )}

        {/* Nearby section */}
        <div className="flex flex-col gap-[10px]">
          {userId && nearby.length > 0 && (
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

      </div>
    </div>
  )
}
