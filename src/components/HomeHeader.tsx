'use client'

import { useState } from 'react'
import Image from 'next/image'
import MapPinIcon from '@/components/icons/MapPinIcon'
import ChevronDownIcon from '@/components/icons/ChevronDownIcon'
import SearchIcon from '@/components/icons/SearchIcon'
import UserIcon from '@/components/icons/UserIcon'
import AccountPanel from '@/components/AccountPanel'
import SearchOverlay from '@/components/SearchOverlay'
import type { MosqueWithTimes } from '@/lib/db/queries'

interface HomeHeaderProps {
  userId: string | null
  userName: string | null
  userImage: string | null
  mosques: MosqueWithTimes[]
  locationLabel: string | null
  isManualLocation: boolean
  onLocationPillPress: () => void
}

export default function HomeHeader({
  userId,
  userName,
  userImage,
  mosques,
  locationLabel,
  isManualLocation,
  onLocationPillPress,
}: HomeHeaderProps) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between px-4 pb-[14px] pt-10">
        {/* Left — location pill */}
        <button
          onClick={onLocationPillPress}
          className="flex cursor-pointer items-center gap-[6px]"
        >
          <MapPinIcon className={`h-[13px] w-[13px] shrink-0 ${isManualLocation ? 'text-text-primary' : 'text-text-secondary'}`} />
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-text-primary">
            {locationLabel ?? 'Near you'}
          </span>
          <ChevronDownIcon className="h-[11px] w-[11px] text-text-tertiary" />
        </button>

        {/* Right — action buttons */}
        <div className="flex items-center gap-[9px]">
          <button
            aria-label="Search"
            className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-card-border bg-white"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon className="h-[16px] w-[16px] text-text-primary" />
          </button>
          <button
            aria-label="Account"
            className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-card-border bg-white overflow-hidden"
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

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        mosques={mosques}
      />
    </>
  )
}
