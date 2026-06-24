'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import MapPinIcon from '@/components/icons/MapPinIcon'
import ChevronDownIcon from '@/components/icons/ChevronDownIcon'
import SearchIcon from '@/components/icons/SearchIcon'
import UserIcon from '@/components/icons/UserIcon'
import AccountPanel from '@/components/AccountPanel'

interface HomeHeaderProps {
  userId: string | null
  userName: string | null
  userImage: string | null
}

export default function HomeHeader({ userId, userName, userImage }: HomeHeaderProps) {
  const [locationLabel, setLocationLabel] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=neighborhood,locality&limit=1`
          )
          const data = await res.json()
          const label = data.features?.[0]?.text
          if (label) setLocationLabel(label)
        } catch {
          // silently fail
        }
      },
      () => {
        // silently fail
      }
    )
  }, [])

  return (
    <>
      <div className="flex items-center justify-between px-4 pb-[14px] pt-10">
        {/* Left — location pill */}
        <button className="flex items-center gap-[6px]">
          <MapPinIcon className="h-[13px] w-[13px] text-text-secondary shrink-0" />
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-text-primary">
            {locationLabel ?? 'Near you'}
          </span>
          <ChevronDownIcon className="h-[11px] w-[11px] text-text-tertiary" />
        </button>

        {/* Right — action buttons */}
        <div className="flex items-center gap-[9px]">
          <button
            aria-label="Search"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-card-border bg-white"
          >
            <SearchIcon className="h-[16px] w-[16px] text-text-primary" />
          </button>
          <button
            aria-label="Account"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-card-border bg-white overflow-hidden"
            onClick={() => setPanelOpen(true)}
          >
            {userImage ? (
              <Image
                src={userImage}
                alt={userName ?? 'Account'}
                width={38}
                height={38}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="h-[16px] w-[16px] text-text-primary" />
            )}
          </button>
        </div>
      </div>

      <AccountPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        isSignedIn={!!userId}
        userName={userName}
        userImage={userImage}
      />
    </>
  )
}
