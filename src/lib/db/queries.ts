import { and, eq } from 'drizzle-orm'
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
}

/** Fetches all active mosques with their location and prayer times for a given date. */
export async function getMosquesWithPrayerTimes(date: string): Promise<MosqueWithTimes[]> {
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
    })
    .from(mosque)
    .innerJoin(location, eq(location.mosqueId, mosque.id))
    .leftJoin(
      prayerTimes,
      and(eq(prayerTimes.mosqueId, mosque.id), eq(prayerTimes.date, date))
    )
    .where(eq(mosque.status, 'active'))

  return rows as MosqueWithTimes[]
}

export type MosqueDetail = {
  id: number
  name: string
  slug: string
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

/** Fetches a user's favourited mosques with location and prayer times for a given date. */
export async function getFavouritedMosques(
  userId: string,
  date: string
): Promise<MosqueWithTimes[]> {
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
    })
    .from(favourite)
    .innerJoin(mosque, and(eq(mosque.id, favourite.mosqueId), eq(mosque.status, 'active')))
    .innerJoin(location, eq(location.mosqueId, mosque.id))
    .leftJoin(
      prayerTimes,
      and(eq(prayerTimes.mosqueId, mosque.id), eq(prayerTimes.date, date))
    )
    .where(eq(favourite.userId, userId))

  return rows as MosqueWithTimes[]
}

/** Fetches a single active mosque with full detail and prayer times for a given date. */
export async function getMosqueBySlug(
  slug: string,
  date: string
): Promise<MosqueDetail | null> {
  const rows = await db
    .select({
      id: mosque.id,
      name: mosque.name,
      slug: mosque.slug,
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
}
