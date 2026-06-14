'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'
import Map, { Layer, Marker, Source } from 'react-map-gl/mapbox'
import CrosshairIcon from '@/components/icons/CrosshairIcon'
import type { MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { MosqueWithTimes } from '@/lib/db/queries'

type Props = {
  mosques: MosqueWithTimes[]
  userLat: number
  userLng: number
}

export default function MosqueMap({ mosques, userLat, userLng }: Props) {
  const router = useRouter()
  const mapRef = useRef<MapRef>(null)

  const recenter = useCallback(() => {
    mapRef.current?.flyTo({ center: [userLng, userLat], zoom: 13, duration: 800 })
  }, [userLat, userLng])

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{ latitude: userLat, longitude: userLng, zoom: 13 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {/* User location — blue pulsing dot */}
        <Marker latitude={userLat} longitude={userLng} anchor="center">
          <div className="relative flex h-5 w-5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white" />
          </div>
        </Marker>

        {/* Mosque pins */}
        {mosques.map((m) => (
          <Marker
            key={m.id}
            latitude={m.lat}
            longitude={m.lng}
            anchor="center"
            onClick={() => router.push(`/mosque/${m.slug}`)}
          >
            <div
              title={m.name}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-amber-500 ring-2 ring-white shadow-md transition hover:scale-110 hover:bg-amber-400"
            />
          </Marker>
        ))}
      </Map>

      {/* Recenter button */}
      <button
        onClick={recenter}
        className="absolute top-2 left-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-md hover:bg-gray-50"
        aria-label="Recenter map"
      >
        <CrosshairIcon className="h-5 w-5 text-gray-700" />
      </button>
    </div>
  )
}
