'use client'

import { useEffect, useState } from 'react'
import Map, { Marker } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

type Props = {
  lat: number
  lng: number
  name: string
}

export default function MosqueDetailMap({ lat, lng, name }: Props) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    )
  }, [])

  return (
    <a
      href={`https://maps.google.com/?q=${lat},${lng}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${name} in Maps`}
      className="relative block h-[180px] w-full overflow-hidden rounded-2xl border border-card-border"
    >
      {/* Map — non-interactive so taps pass through to the anchor */}
      <div className="pointer-events-none absolute inset-0">
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{ latitude: lat, longitude: lng, zoom: 15 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          interactive={false}
        >
          {/* Mosque pin */}
          <Marker latitude={lat} longitude={lng} anchor="center">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 ring-2 ring-white shadow-md" />
          </Marker>

          {/* User location */}
          {userLocation && (
            <Marker latitude={userLocation.lat} longitude={userLocation.lng} anchor="center">
              <div className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white" />
              </div>
            </Marker>
          )}
        </Map>
      </div>

      {/* "Open in Maps" pill */}
      <div className="absolute bottom-[10px] right-[10px] rounded-full bg-white/90 px-[12px] py-[6px] text-[12px] font-semibold text-text-primary shadow-sm backdrop-blur-sm">
        Open in Maps ↗
      </div>
    </a>
  )
}
