'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import Map, { Layer, Marker, Popup, Source } from 'react-map-gl/mapbox'
import type { MapRef, MapMouseEvent } from 'react-map-gl/mapbox'
import mapboxgl from 'mapbox-gl'
import CrosshairIcon from '@/components/icons/CrosshairIcon'
import MapPinIcon from '@/components/icons/MapPinIcon'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { MosqueWithTimes } from '@/lib/db/queries'

type Props = {
  mosques: MosqueWithTimes[]
  userLat: number
  userLng: number
  isManualLocation?: boolean
  onLocate?: () => void
}

type PopupInfo = {
  lat: number
  lng: number
  slug: string
  name: string
  address: string
}

type ClusterSource = {
  getClusterExpansionZoom: (clusterId: number) => Promise<number>
}

export default function MosqueMap({ mosques, userLat, userLng, isManualLocation = false, onLocate }: Props) {
  const mapRef = useRef<MapRef>(null)
  const [popup, setPopup] = useState<PopupInfo | null>(null)
  const [cursor, setCursor] = useState<string>('auto')

  const geojson = {
    type: 'FeatureCollection' as const,
    features: mosques
      .filter((m) => m.lat != null && m.lng != null)
      .map((m) => ({
        type: 'Feature' as const,
        properties: {
          slug: m.slug,
          name: m.name,
          address: [m.addressLine1, m.postcode].filter(Boolean).join(', '),
        },
        geometry: { type: 'Point' as const, coordinates: [m.lng, m.lat] },
      })),
  }

  useEffect(() => {
    mapRef.current?.flyTo({ center: [userLng, userLat], zoom: 13, duration: 800 })
  }, [userLat, userLng])

  const recenter = useCallback(() => {
    mapRef.current?.flyTo({ center: [userLng, userLat], zoom: 13, duration: 800 })
  }, [userLat, userLng])

  const handleClick = useCallback((e: MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
    const features = e.features ?? []
    if (!features.length) { setPopup(null); return }

    const f = features[0]

    if (f.layer?.id === 'clusters') {
      const clusterId = f.properties?.cluster_id as number | undefined
      const map = mapRef.current?.getMap()
      if (!map || clusterId == null) return
      const source = map.getSource('mosques') as unknown as ClusterSource
      source.getClusterExpansionZoom(clusterId).then((zoom) => {
        mapRef.current?.flyTo({ center: [e.lngLat.lng, e.lngLat.lat], zoom, duration: 600 })
      }).catch(() => {})
      return
    }

    if (f.layer?.id === 'unclustered-point') {
      const props = f.properties
      if (!props) return
      const coords = (f.geometry as GeoJSON.Point).coordinates
      setPopup({ lat: coords[1], lng: coords[0], slug: props.slug, name: props.name, address: props.address })
      return
    }

    setPopup(null)
  }, [])

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-xl">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{ latitude: userLat, longitude: userLng, zoom: 13 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        interactiveLayerIds={['clusters', 'unclustered-point']}
        cursor={cursor}
        onClick={handleClick}
        onMouseEnter={() => setCursor('pointer')}
        onMouseLeave={() => setCursor('auto')}
      >
        <Source
          id="mosques"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={13}
          clusterRadius={60}
        >
          {/* Cluster glow ring */}
          <Layer
            id="cluster-halo"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-radius': [
                'step', ['get', 'point_count'],
                24, 10,
                30, 30,
                36,
              ],
              'circle-color': 'rgba(242,137,11,0.28)',
            }}
          />

          {/* Cluster fill */}
          <Layer
            id="clusters"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-radius': [
                'step', ['get', 'point_count'],
                17, 10,
                22, 30,
                27,
              ],
              'circle-color': [
                'step', ['get', 'point_count'],
                '#F4A52A', 10,
                '#EE8A12', 30,
                '#E2700A',
              ],
            }}
          />

          {/* Cluster count */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': ['get', 'point_count_abbreviated'],
              'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
              'text-size': ['step', ['get', 'point_count'], 12, 10, 14, 30, 16],
              'text-allow-overlap': true,
            }}
            paint={{ 'text-color': '#ffffff' }}
          />

          {/* Individual mosque pin */}
          <Layer
            id="unclustered-point"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-radius': 13,
              'circle-color': '#F2890B',
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
            }}
          />
        </Source>

        {/* User / manual location marker */}
        <Marker latitude={userLat} longitude={userLng} anchor={isManualLocation ? 'bottom' : 'center'}>
          {isManualLocation ? (
            <MapPinIcon className="h-7 w-7 text-text-primary drop-shadow" />
          ) : (
            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[rgba(47,123,246,0.20)]">
              <div
                className="h-[18px] w-[18px] rounded-full bg-[#2F7BF6] ring-[3px] ring-white"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
              />
            </div>
          )}
        </Marker>

        {/* Popup on pin tap */}
        {popup && (
          <Popup
            latitude={popup.lat}
            longitude={popup.lng}
            anchor="bottom"
            offset={20}
            closeButton={false}
            onClose={() => setPopup(null)}
          >
            <div className="min-w-[160px] px-1 py-0.5">
              <p className="text-sm font-semibold leading-snug text-gray-900">{popup.name}</p>
              {popup.address && (
                <p className="mt-0.5 text-xs text-gray-500">{popup.address}</p>
              )}
              <Link
                href={`/mosque/${popup.slug}`}
                className="mt-2 inline-block text-xs font-medium text-amber-600 hover:underline"
              >
                View →
              </Link>
            </div>
          </Popup>
        )}
      </Map>

      {/* Locate / recenter button */}
      <button
        onClick={() => { onLocate?.(); recenter() }}
        className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-[#1D1B18] shadow-md hover:bg-gray-50 dark:hover:bg-[#26231F]"
        aria-label="Snap to current location"
      >
        <CrosshairIcon className={`h-5 w-5 ${isManualLocation ? 'text-text-primary' : 'text-gray-700 dark:text-text-secondary'}`} />
      </button>
    </div>
  )
}
