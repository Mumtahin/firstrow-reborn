import { and, eq, like, or } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { unstable_cache } from 'next/cache'
import { db } from './index'
import { amenities, contactInfo, favourite, location, mosque, prayerTimes } from './schema'

export type MosqueWithTimes = {
  id: number
  name: string
  slug: string
  lat: number
  lng: number
  addressLine1: string
  town: string
  postcode: string
  fajrJamaat: string | null
  zuhrJamaat: string | null
  asrJamaat: string | null
  maghribJamaat: string | null
  ishaJamaat: string | null
  tomorrowFajrJamaat: string | null
}

/** Fetches all active mosques with their location and prayer times for a given date,
 *  plus tomorrow's Fajr jamaat so the "next jamaat" countdown can roll over midnight. */
export const getMosquesWithPrayerTimes = unstable_cache(
  async (date: string, tomorrowDate: string): Promise<MosqueWithTimes[]> => {
    const tomorrowTimes = alias(prayerTimes, 'tomorrow_times')

    const rows = await db
      .select({
        id: mosque.id,
        name: mosque.name,
        slug: mosque.slug,
        lat: location.lat,
        lng: location.lng,
        addressLine1: location.addressLine1,
        town: location.town,
        postcode: location.postcode,
        fajrJamaat: prayerTimes.fajrJamaat,
        zuhrJamaat: prayerTimes.zuhrJamaat,
        asrJamaat: prayerTimes.asrJamaat,
        maghribJamaat: prayerTimes.maghribJamaat,
        ishaJamaat: prayerTimes.ishaJamaat,
        tomorrowFajrJamaat: tomorrowTimes.fajrJamaat,
      })
      .from(mosque)
      .innerJoin(location, eq(location.mosqueId, mosque.id))
      .leftJoin(
        prayerTimes,
        and(eq(prayerTimes.mosqueId, mosque.id), eq(prayerTimes.date, date))
      )
      .leftJoin(
        tomorrowTimes,
        and(eq(tomorrowTimes.mosqueId, mosque.id), eq(tomorrowTimes.date, tomorrowDate))
      )
      .where(eq(mosque.status, 'active'))

    return rows as MosqueWithTimes[]
  },
  ['mosques-with-prayer-times'],
  { tags: ['mosques'], revalidate: 3600 }
)

export type MosqueDetail = {
  id: number
  name: string
  slug: string
  lat: number | null
  lng: number | null
  addressLine1: string | null
  addressLine2: string | null
  town: string | null
  postcode: string | null
  website: string | null
  phone: string | null
  email: string | null
  hasWomensSpace: boolean | null
  hasCarPark: boolean | null
  hasDisabilityAccess: boolean | null
  fajrStart: string | null
  fajrJamaat: string | null
  zuhrStart: string | null
  zuhrJamaat: string | null
  asrStart: string | null
  asrAltStart: string | null
  asrJamaat: string | null
  maghribStart: string | null
  maghribJamaat: string | null
  ishaStart: string | null
  ishaJamaat: string | null
}

/** Returns the set of mosque IDs that a user has favourited. */
export async function getFavouriteIds(userId: string): Promise<Set<number>> {
  const rows = await db
    .select({ mosqueId: favourite.mosqueId })
    .from(favourite)
    .where(eq(favourite.userId, userId))

  return new Set(rows.map((r) => r.mosqueId))
}

/** Fetches a user's favourited mosques with location and prayer times for a given date,
 *  plus tomorrow's Fajr jamaat for midnight rollover. */
export async function getFavouritedMosques(
  userId: string,
  date: string,
  tomorrowDate: string
): Promise<MosqueWithTimes[]> {
  const tomorrowTimes = alias(prayerTimes, 'tomorrow_times')

  const rows = await db
    .select({
      id: mosque.id,
      name: mosque.name,
      slug: mosque.slug,
      lat: location.lat,
      lng: location.lng,
      addressLine1: location.addressLine1,
      town: location.town,
      postcode: location.postcode,
      fajrJamaat: prayerTimes.fajrJamaat,
      zuhrJamaat: prayerTimes.zuhrJamaat,
      asrJamaat: prayerTimes.asrJamaat,
      maghribJamaat: prayerTimes.maghribJamaat,
      ishaJamaat: prayerTimes.ishaJamaat,
      tomorrowFajrJamaat: tomorrowTimes.fajrJamaat,
    })
    .from(favourite)
    .innerJoin(mosque, and(eq(mosque.id, favourite.mosqueId), eq(mosque.status, 'active')))
    .innerJoin(location, eq(location.mosqueId, mosque.id))
    .leftJoin(
      prayerTimes,
      and(eq(prayerTimes.mosqueId, mosque.id), eq(prayerTimes.date, date))
    )
    .leftJoin(
      tomorrowTimes,
      and(eq(tomorrowTimes.mosqueId, mosque.id), eq(tomorrowTimes.date, tomorrowDate))
    )
    .where(eq(favourite.userId, userId))

  return rows as MosqueWithTimes[]
}

export type MosqueListing = {
  id: number
  name: string
  slug: string
  addressLine1: string
  town: string
  postcode: string
}

/** Fetches name, slug, and address for all active mosques in the given postcode districts.
 *  Does not include prayer times — use on listing/area pages to avoid exposing raw data. */
export const getMosquesByDistricts = unstable_cache(
  async (districts: string[]): Promise<MosqueListing[]> => {
    const districtConditions = districts.map((d) => like(location.postcode, `${d} %`))

    const rows = await db
      .select({
        id: mosque.id,
        name: mosque.name,
        slug: mosque.slug,
        addressLine1: location.addressLine1,
        town: location.town,
        postcode: location.postcode,
      })
      .from(mosque)
      .innerJoin(location, eq(location.mosqueId, mosque.id))
      .where(and(eq(mosque.status, 'active'), or(...districtConditions)))

    return rows as MosqueListing[]
  },
  ['mosques-by-districts'],
  { tags: ['mosques'], revalidate: 3600 }
)

/** Fetches a single active mosque with full detail and prayer times for a given date. */
export const getMosqueBySlug = unstable_cache(
  async (slug: string, date: string): Promise<MosqueDetail | null> => {
    const rows = await db
      .select({
        id: mosque.id,
        name: mosque.name,
        slug: mosque.slug,
        lat: location.lat,
        lng: location.lng,
        addressLine1: location.addressLine1,
        addressLine2: location.addressLine2,
        town: location.town,
        postcode: location.postcode,
        website: contactInfo.website,
        phone: contactInfo.phone,
        email: contactInfo.email,
        hasWomensSpace: amenities.hasWomensSpace,
        hasCarPark: amenities.hasCarPark,
        hasDisabilityAccess: amenities.hasDisabilityAccess,
        fajrStart: prayerTimes.fajrStart,
        fajrJamaat: prayerTimes.fajrJamaat,
        zuhrStart: prayerTimes.zuhrStart,
        zuhrJamaat: prayerTimes.zuhrJamaat,
        asrStart: prayerTimes.asrStart,
        asrAltStart: prayerTimes.asrAltStart,
        asrJamaat: prayerTimes.asrJamaat,
        maghribStart: prayerTimes.maghribStart,
        maghribJamaat: prayerTimes.maghribJamaat,
        ishaStart: prayerTimes.ishaStart,
        ishaJamaat: prayerTimes.ishaJamaat,
      })
      .from(mosque)
      .leftJoin(location, eq(location.mosqueId, mosque.id))
      .leftJoin(contactInfo, eq(contactInfo.mosqueId, mosque.id))
      .leftJoin(amenities, eq(amenities.mosqueId, mosque.id))
      .leftJoin(
        prayerTimes,
        and(eq(prayerTimes.mosqueId, mosque.id), eq(prayerTimes.date, date))
      )
      .where(and(eq(mosque.slug, slug), eq(mosque.status, 'active')))
      .limit(1)

    return (rows[0] as MosqueDetail) ?? null
  },
  ['mosque-by-slug'],
  { tags: ['mosques'], revalidate: 3600 }
)
