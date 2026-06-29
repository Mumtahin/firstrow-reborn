'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { haversineDistance } from '@/lib/utils/distance'
import { getNextJamaat } from '@/lib/utils/getNextJamaat'
import type { MosqueWithTimes } from '@/lib/db/queries'
import {
  PRAYER_PILLS,
  getPillLabel,
  getSpecificPrayerJamaat,
} from '@/lib/utils/prayerPills'
import type { Prayer, EnrichedMosque } from '@/lib/utils/prayerPills'
import type { ClientLocation } from './HomeShell'
import MosqueCard from './MosqueCard'
import MosqueCardSkeleton from './MosqueCardSkeleton'
import FilterSheet from './FilterSheet'
import type { AmenityFilters } from './FilterSheet'
import StarIcon from './icons/StarIcon'
import MapPinIcon from './icons/MapPinIcon'

const MosqueMap = dynamic(() => import('./MosqueMap'), { ssr: false })

type Props = {
  mosques: MosqueWithTimes[]
  favouriteIds: number[]
  userId: string | null
  location: ClientLocation
  onLocate?: () => void
}

const PAGE_SIZE = 6

export default function HomeClient({ mosques, favouriteIds, userId, location, onLocate }: Props) {
  const [now, setNow] = useState(() => new Date())
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [amenityFilters, setAmenityFilters] = useState<AmenityFilters>({
    womensSpace: false,
    parking: false,
    stepFree: false,
  })

  // Prayers that still have at least one mosque offering an upcoming jamaat
  const availablePrayers = useMemo(
    () =>
      new Set(
        PRAYER_PILLS
          .filter(({ key }) => mosques.some((m) => getSpecificPrayerJamaat(m, key, now) !== null))
          .map(({ key }) => key)
      ),
    // Re-compute every minute (now) and whenever the mosque list changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mosques, now]
  )

  // If the selected prayer lapses while the user is on the page, clear the filter
  useEffect(() => {
    if (selectedPrayer && !availablePrayers.has(selectedPrayer)) {
      setSelectedPrayer(null)
    }
  }, [selectedPrayer, availablePrayers])

  // Paginated nearby list — fetched from API
  const [nearbyItems, setNearbyItems] = useState<MosqueWithTimes[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const offsetRef = useRef(0)

  const favSet = new Set(favouriteIds)

  // Minute clock for countdowns
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Re-fetch when location resolves or coordinates change
  const locationKey =
    location.status === 'ready'
      ? `${location.lat.toFixed(3)},${location.lng.toFixed(3)}`
      : location.status

  useEffect(() => {
    if (location.status === 'pending') return
    setNearbyItems([])
    setInitialLoading(true)
    setHasMore(false)
    offsetRef.current = 0
    fetchPage(0, location)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationKey])

  async function fetchPage(fetchOffset: number, loc: ClientLocation) {
    const params = new URLSearchParams({
      offset: String(fetchOffset),
      limit: String(PAGE_SIZE),
    })
    if (loc.status === 'ready') {
      params.set('lat', String(loc.lat))
      params.set('lng', String(loc.lng))
    }

    try {
      const res = await fetch(`/api/mosques/nearby?${params}`)
      const data: { items: MosqueWithTimes[]; hasMore: boolean } = await res.json()
      setNearbyItems((prev) => (fetchOffset === 0 ? data.items : [...prev, ...data.items]))
      setHasMore(data.hasMore)
      offsetRef.current = fetchOffset + PAGE_SIZE
    } catch {
      // silently fail — existing items remain visible
    } finally {
      setInitialLoading(false)
      setLoadingMore(false)
    }
  }

  function handleLoadMore() {
    setLoadingMore(true)
    fetchPage(offsetRef.current, location)
  }

  // Enrich a mosque with distance + nextJamaat at render time
  function enrich(m: MosqueWithTimes): EnrichedMosque {
    return {
      ...m,
      distance:
        location.status === 'ready'
          ? haversineDistance(location.lat, location.lng, m.lat, m.lng)
          : null,
      nextJamaat: selectedPrayer
        ? getSpecificPrayerJamaat(m, selectedPrayer, now)
        : getNextJamaat(m, now, m.tomorrowFajrJamaat),
    }
  }

  function applyAmenityFilters<T extends MosqueWithTimes>(list: T[]): T[] {
    return list
      .filter((m) => !amenityFilters.womensSpace || m.hasWomensSpace === true)
      .filter((m) => !amenityFilters.parking || m.hasCarPark === true)
      .filter((m) => !amenityFilters.stepFree || m.hasDisabilityAccess === true)
  }

  // Favourites always come from the full server-fetched prop so they're never missing
  const favourites = applyAmenityFilters(
    mosques
      .filter((m) => favSet.has(m.id))
      .map(enrich)
      .filter((m) => !selectedPrayer || m.nextJamaat !== null)
  )

  // Nearby: API-fetched, favourites excluded, prayer-filtered client-side
  const nearby = applyAmenityFilters(
    nearbyItems
      .filter((m) => !favSet.has(m.id))
      .map(enrich)
      .filter((m) => !selectedPrayer || m.nextJamaat !== null)
  )

  const activeFilterCount = [amenityFilters.womensSpace, amenityFilters.parking, amenityFilters.stepFree].filter(Boolean).length

  return (
    <div className="flex flex-col">

      {/* Prayer pills + Filters button */}
      <div className="flex items-center gap-[10px] px-4 pb-3">
        {/* Scrollable prayer pills */}
        <div className="flex min-w-0 flex-1 gap-[7px] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setSelectedPrayer(null)}
            className={`shrink-0 rounded-full px-[14px] py-[7px] text-[13px] font-semibold transition-colors ${
              selectedPrayer === null
                ? 'bg-text-primary text-[#FAFAF8] dark:text-[#16130F]'
                : 'border border-card-border bg-white dark:bg-[#1D1B18] text-text-secondary'
            }`}
          >
            Next
          </button>
          {PRAYER_PILLS.filter(({ key }) => availablePrayers.has(key)).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedPrayer(selectedPrayer === key ? null : key)}
              className={`shrink-0 rounded-full px-[14px] py-[7px] text-[13px] font-semibold transition-colors ${
                selectedPrayer === key
                  ? 'bg-text-primary text-[#FAFAF8] dark:text-[#16130F]'
                  : 'border border-card-border bg-white dark:bg-[#1D1B18] text-text-secondary'
              }`}
            >
              {getPillLabel(key, label)}
            </button>
          ))}
        </div>

        {/* Filters button */}
        <button
          onClick={() => setFiltersOpen(true)}
          className={`shrink-0 inline-flex items-center gap-[6px] rounded-full px-[13px] py-[7px] text-[13px] font-semibold transition-colors ${
            activeFilterCount > 0
              ? 'bg-text-primary text-[#FAFAF8] dark:text-[#16130F]'
              : 'border border-card-border bg-white dark:bg-[#1D1B18] text-text-secondary'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 8h11M19 8h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16.5" cy="8" r="2.5" stroke="currentColor" strokeWidth="2" />
            <path d="M3 16h4M10 16h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="8.5" cy="16" r="2.5" stroke="currentColor" strokeWidth="2" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#FAFAF8] dark:bg-[#16130F] px-[4px] text-[11px] font-bold text-text-primary dark:text-[#FAFAF8]">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <FilterSheet
        open={filtersOpen}
        filters={amenityFilters}
        matchCount={favourites.length + nearby.length}
        onChange={setAmenityFilters}
        onClose={() => setFiltersOpen(false)}
      />

      {/* Map */}
      {location.status === 'pending' && (
        <div className="mx-4 mb-4 flex h-48 items-center justify-center rounded-2xl bg-card-divider">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-card-border-fav border-t-text-tertiary" />
        </div>
      )}
      {location.status === 'ready' && (
        <div className="mb-4 px-4">
          <MosqueMap
            mosques={mosques}
            userLat={location.lat}
            userLng={location.lng}
            isManualLocation={location.isManual}
            onLocate={onLocate}
          />
        </div>
      )}
      {location.status === 'denied' && (
        <div className="mx-4 mb-4 rounded-2xl border border-card-border bg-white dark:bg-[#1D1B18] px-4 py-3">
          <p className="text-[13px] font-semibold text-text-primary">Location access needed</p>
          <p className="mt-0.5 text-[13px] font-medium text-text-secondary">
            Allow location access to sort by proximity.
          </p>
        </div>
      )}

      {/* Sections */}
      <div className="flex flex-col gap-[22px] px-4 pb-7 pt-1">

        {/* Favourites — always fully loaded from server props */}
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
                activeFilters={activeFilterCount > 0 ? amenityFilters : undefined}
              />
            ))}
          </div>
        )}

        {/* Nearby — API-paginated */}
        <div className="flex flex-col gap-[10px]">
          {userId && favourites.length > 0 && (
            <div className="flex items-center gap-[7px] px-0.5">
              <MapPinIcon className="h-[13px] w-[13px] text-text-tertiary" />
              <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-text-tertiary">
                Nearby
              </span>
            </div>
          )}

          {/* SSR fallback: server-fetched mosques while first API page loads.
              Crawlers see real content; users see cards immediately, then re-sort on location. */}
          {initialLoading && applyAmenityFilters(
            mosques
              .filter((m) => !favSet.has(m.id))
              .map(enrich)
              .filter((m) => !selectedPrayer || m.nextJamaat !== null)
          ).slice(0, PAGE_SIZE).map((m) => (
            <MosqueCard
              key={m.id}
              name={m.name}
              slug={m.slug}
              lat={m.lat}
              lng={m.lng}
              distance={m.distance}
              nextJamaat={m.nextJamaat}
              isFavourited={false}
              activeFilters={activeFilterCount > 0 ? amenityFilters : undefined}
            />
          ))}

          {/* Loaded cards */}
          {!initialLoading && nearby.map((m) => (
            <MosqueCard
              key={m.id}
              name={m.name}
              slug={m.slug}
              lat={m.lat}
              lng={m.lng}
              distance={m.distance}
              nextJamaat={m.nextJamaat}
              isFavourited={false}
              activeFilters={activeFilterCount > 0 ? amenityFilters : undefined}
            />
          ))}

          {/* Skeletons while next page loads */}
          {loadingMore && Array.from({ length: 3 }).map((_, i) => (
            <MosqueCardSkeleton key={`more-${i}`} />
          ))}

          {/* Load more */}
          {!initialLoading && !loadingMore && hasMore && (
            <button
              onClick={handleLoadMore}
              className="mt-1 w-full rounded-2xl border border-card-border bg-white dark:bg-[#1D1B18] py-[13px] text-[14px] font-semibold text-text-secondary transition-colors duration-[200ms] ease-out hover:text-text-primary active:opacity-70"
            >
              Load more
            </button>
          )}

          {/* Empty state when prayer filter matches nothing */}
          {!initialLoading && nearby.length === 0 && selectedPrayer && favourites.length === 0 && (
            <p className="px-0.5 text-[13px] font-medium text-text-tertiary">
              No mosques with upcoming{' '}
              {getPillLabel(selectedPrayer, PRAYER_PILLS.find((p) => p.key === selectedPrayer)?.label ?? '')}{' '}
              nearby.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
