import { and, eq } from 'drizzle-orm'
import { db } from './index'
import { location, mosque, prayerTimes } from './schema'

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
