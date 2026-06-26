'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import Map, { Layer, Marker, Popup, Source } from 'react-map-gl/mapbox'
import CrosshairIcon from '@/components/icons/CrosshairIcon'
import MapPinIcon from '@/components/icons/MapPinIcon'
import type { MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { MosqueWithTimes } from '@/lib/db/queries'

type Props = {
  mosques: MosqueWithTimes[]
  userLat: number
  userLng: number
  isManualLocation?: boolean
}

export default function MosqueMap({ mosques, userLat, userLng, isManualLocation = false }: Props) {
  const mapRef = useRef<MapRef>(null)
  const [selected, setSelected] = useState<MosqueWithTimes | null>(null)

  useEffect(() => {
    mapRef.current?.flyTo({ center: [userLng, userLat], zoom: 13, duration: 800 })
  }, [userLat, userLng])

  const recenter = useCallback(() => {
    mapRef.current?.flyTo({ center: [userLng, userLat], zoom: 13, duration: 800 })
  }, [userLat, userLng])

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-xl">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{ latitude: userLat, longitude: userLng, zoom: 13 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onClick={() => setSelected(null)}
      >
        {/* User / manual location marker */}
        <Marker latitude={userLat} longitude={userLng} anchor={isManualLocation ? 'bottom' : 'center'}>
          {isManualLocation ? (
            <MapPinIcon className="h-7 w-7 text-text-primary drop-shadow" />
          ) : (
            <div className="relative flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white" />
            </div>
          )}
        </Marker>

        {/* Mosque pins */}
        {mosques.map((m) => (
          <Marker
            key={m.id}
            latitude={m.lat}
            longitude={m.lng}
            anchor="center"
            onClick={(e) => { e.originalEvent.stopPropagation(); setSelected(m) }}
          >
            <div
              className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full ring-2 ring-white shadow-md transition hover:scale-110 ${selected?.id === m.id ? 'bg-amber-400 scale-110' : 'bg-amber-500 hover:bg-amber-400'}`}
            />
          </Marker>
        ))}

        {/* Popup */}
        {selected && (
          <Popup
            latitude={selected.lat}
            longitude={selected.lng}
            anchor="bottom"
            offset={16}
            closeButton={false}
            onClose={() => setSelected(null)}
          >
            <div className="min-w-[160px] px-1 py-0.5">
              <p className="font-semibold text-gray-900 text-sm leading-snug">{selected.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {selected.addressLine1}, {selected.postcode}
              </p>
              <Link
                href={`/mosque/${selected.slug}`}
                className="mt-2 inline-block text-xs font-medium text-amber-600 hover:underline"
              >
                View →
              </Link>
            </div>
          </Popup>
        )}
      </Map>

      {/* Recenter button */}
      <button
        onClick={recenter}
        className="absolute top-2 left-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-[#1D1B18] shadow-md hover:bg-gray-50 dark:hover:bg-[#26231F]"
        aria-label="Recenter map"
      >
        <CrosshairIcon className="h-5 w-5 text-gray-700" />
      </button>
    </div>
  )
}
