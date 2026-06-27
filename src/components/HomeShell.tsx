'use client'

import { useEffect, useState } from 'react'
import HomeHeader from './HomeHeader'
import HomeClient from './HomeClient'
import LocationSheet from './LocationSheet'
import type { MosqueWithTimes } from '@/lib/db/queries'

type ManualLocation = { lat: number; lng: number; label: string }

export type ClientLocation =
  | { status: 'pending' }
  | { status: 'ready'; lat: number; lng: number; isManual: boolean }
  | { status: 'denied' }

const STORAGE_KEY = 'firstrow_manual_location'

type Props = {
  mosques: MosqueWithTimes[]
  favouriteIds: number[]
  userId: string | null
  userName: string | null
  userImage: string | null
}

export default function HomeShell({ mosques, favouriteIds, userId, userName, userImage }: Props) {
  const [gpsState, setGpsState] = useState<ClientLocation>({ status: 'pending' })
  const [gpsLabel, setGpsLabel] = useState<string | null>(null)
  const [manualLocation, setManualLocation] = useState<ManualLocation | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Load persisted manual location from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setManualLocation(JSON.parse(stored))
    } catch {
      // ignore malformed data
    }
  }, [])

  // GPS detection + reverse geocode for label
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsState({ status: 'denied' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setGpsState({ status: 'ready', lat, lng, isManual: false })
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        if (!token) return
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=neighborhood,locality&limit=1`
          )
          const data = await res.json()
          const label = data.features?.[0]?.text
          if (label) setGpsLabel(label)
        } catch {
          // silently fail
        }
      },
      () => setGpsState({ status: 'denied' })
    )
  }, [])

  function handleSelect(loc: ManualLocation) {
    setManualLocation(loc)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)) } catch {}
    setSheetOpen(false)
  }

  function handleUseGPS() {
    setManualLocation(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    setSheetOpen(false)
  }

  const isManual = manualLocation !== null
  const locationLabel = isManual ? manualLocation.label : gpsLabel
  const effectiveLocation: ClientLocation = isManual
    ? { status: 'ready', lat: manualLocation.lat, lng: manualLocation.lng, isManual: true }
    : gpsState

  return (
    <>
      <HomeHeader
        userId={userId}
        userName={userName}
        userImage={userImage}
        mosques={mosques}
        locationLabel={locationLabel}
        isManualLocation={isManual}
        onLocationPillPress={() => setSheetOpen(true)}
      />
      <HomeClient
        mosques={mosques}
        favouriteIds={favouriteIds}
        userId={userId}
        location={effectiveLocation}
        onLocate={handleUseGPS}
      />
      <LocationSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelect={handleSelect}
        onUseGPS={handleUseGPS}
        isManual={isManual}
      />
    </>
  )
}
