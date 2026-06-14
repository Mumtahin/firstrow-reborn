/**
 * Seed script — 5 real UK mosques with realistic prayer times.
 * Destructive: clears all tables before re-seeding.
 *
 * Run with: npm run db:seed
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import {
  amenities,
  contactInfo,
  dataSource,
  favourite,
  location,
  mosque,
  prayerTimes,
  user,
} from './schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

// Helpers

/** Returns an array of YYYY-MM-DD strings: today + the next `count` days. */
function nextDays(count: number): string[] {
  return Array.from({ length: count + 1 }, (_, i) => {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() + i)
    return d.toISOString().split('T')[0]
  })
}

// Mosque data
const mosques = [
  {
    mosque: { name: 'East London Mosque', slug: 'east-london-mosque', status: 'active' as const },
    location: {
      addressLine1: '82-92 Whitechapel Road',
      addressLine2: null,
      town: 'London',
      postcode: 'E1 1JX',
      lat: 51.5188,
      lng: -0.062,
    },
    contact: {
      website: 'https://www.eastlondonmosque.org.uk',
      phone: '020 7650 3000',
      email: 'info@eastlondonmosque.org.uk',
    },
    amenities: { hasWomensSpace: true, hasCarPark: false, hasDisabilityAccess: true },
    prayers: {
      fajrStart: '02:51',
      fajrJamaat: '04:15',
      zuhrStart: '13:04',
      zuhrJamaat: '13:30',
      asrStart: '17:18',
      asrAltStart: '18:45',
      asrJamaat: '18:45',
      maghribStart: '21:19',
      maghribJamaat: '21:19',
      ishaStart: '23:01',
      ishaJamaat: '22:30',
    },
    source: 'https://www.eastlondonmosque.org.uk/prayer-times',
  },
  {
    mosque: {
      name: 'London Central Mosque',
      slug: 'london-central-mosque',
      status: 'active' as const,
    },
    location: {
      addressLine1: '146 Park Road',
      addressLine2: null,
      town: 'London',
      postcode: 'NW8 7RG',
      lat: 51.5283,
      lng: -0.1624,
    },
    contact: {
      website: 'https://www.icentre.org.uk',
      phone: '020 7724 3363',
      email: null,
    },
    amenities: { hasWomensSpace: true, hasCarPark: true, hasDisabilityAccess: true },
    prayers: {
      fajrStart: '02:50',
      fajrJamaat: '04:30',
      zuhrStart: '13:04',
      zuhrJamaat: '13:45',
      asrStart: '17:18',
      asrAltStart: null,
      asrJamaat: '18:30',
      maghribStart: '21:19',
      maghribJamaat: '21:19',
      ishaStart: '23:01',
      ishaJamaat: '22:45',
    },
    source: 'https://www.icentre.org.uk/prayer-times',
  },
  {
    mosque: {
      name: 'Birmingham Central Mosque',
      slug: 'birmingham-central-mosque',
      status: 'active' as const,
    },
    location: {
      addressLine1: '180 Belgrave Middleway',
      addressLine2: null,
      town: 'Birmingham',
      postcode: 'B12 0XS',
      lat: 52.4706,
      lng: -1.8878,
    },
    contact: {
      website: 'https://www.centralmosque.org.uk',
      phone: '0121 440 5355',
      email: 'info@centralmosque.org.uk',
    },
    amenities: { hasWomensSpace: true, hasCarPark: true, hasDisabilityAccess: true },
    prayers: {
      fajrStart: '02:44',
      fajrJamaat: '04:30',
      zuhrStart: '13:09',
      zuhrJamaat: '13:30',
      asrStart: '17:25',
      asrAltStart: '19:00',
      asrJamaat: '19:00',
      maghribStart: '21:27',
      maghribJamaat: '21:27',
      ishaStart: '23:10',
      ishaJamaat: '22:30',
    },
    source: 'https://www.centralmosque.org.uk/prayer-times',
  },
  {
    mosque: {
      name: 'Manchester Central Mosque',
      slug: 'manchester-central-mosque',
      status: 'active' as const,
    },
    location: {
      addressLine1: '20 Victoria Park',
      addressLine2: null,
      town: 'Manchester',
      postcode: 'M14 5RQ',
      lat: 53.4543,
      lng: -2.2169,
    },
    contact: {
      website: 'https://www.manchestercentralmosque.org',
      phone: '0161 257 2126',
      email: null,
    },
    amenities: { hasWomensSpace: true, hasCarPark: false, hasDisabilityAccess: false },
    prayers: {
      fajrStart: '02:38',
      fajrJamaat: '04:30',
      zuhrStart: '13:14',
      zuhrJamaat: '13:30',
      asrStart: '17:31',
      asrAltStart: null,
      asrJamaat: '18:45',
      maghribStart: '21:35',
      maghribJamaat: '21:35',
      ishaStart: '23:19',
      ishaJamaat: '22:30',
    },
    source: 'https://www.manchestercentralmosque.org/prayer-times',
  },
  {
    mosque: {
      name: 'Baitul Aman Mosque & Cultural Centre',
      slug: 'baitul-aman-mosque',
      status: 'active' as const,
    },
    location: {
      addressLine1: '101 Braintree Street',
      addressLine2: null,
      town: 'London',
      postcode: 'E2 0FT',
      lat: 51.5265,
      lng: -0.0624,
    },
    contact: {
      website: 'https://baitulaman.org',
      phone: null,
      email: null,
    },
    amenities: { hasWomensSpace: true, hasCarPark: false, hasDisabilityAccess: false },
    prayers: {
      fajrStart: '02:51',
      fajrJamaat: '04:30',
      zuhrStart: '13:04',
      zuhrJamaat: '13:30',
      asrStart: '17:18',
      asrAltStart: '18:45',
      asrJamaat: '18:45',
      maghribStart: '21:19',
      maghribJamaat: '21:19',
      ishaStart: '23:01',
      ishaJamaat: '22:30',
    },
    source: 'https://baitulaman.org',
  },
  {
    mosque: { name: 'Leeds Grand Mosque', slug: 'leeds-grand-mosque', status: 'active' as const },
    location: {
      addressLine1: '9 Woodsley Road',
      addressLine2: null,
      town: 'Leeds',
      postcode: 'LS3 1DL',
      lat: 53.8052,
      lng: -1.5589,
    },
    contact: {
      website: 'https://www.leedsgrandmosque.com',
      phone: '0113 243 4141',
      email: null,
    },
    amenities: { hasWomensSpace: true, hasCarPark: false, hasDisabilityAccess: true },
    prayers: {
      fajrStart: '02:36',
      fajrJamaat: '04:15',
      zuhrStart: '13:15',
      zuhrJamaat: '13:30',
      asrStart: '17:33',
      asrAltStart: null,
      asrJamaat: '18:30',
      maghribStart: '21:38',
      maghribJamaat: '21:38',
      ishaStart: '23:22',
      ishaJamaat: '22:30',
    },
    source: 'https://www.leedsgrandmosque.com/prayer-times',
  },
]

// Seed

async function seed() {
  console.log('Clearing tables...')

  // Delete in FK-safe order
  await db.delete(favourite)
  await db.delete(prayerTimes)
  await db.delete(dataSource)
  await db.delete(amenities)
  await db.delete(contactInfo)
  await db.delete(location)
  await db.delete(user)
  await db.delete(mosque)

  console.log('Seeding mosques...')

  const dates = nextDays(9)

  for (const m of mosques) {
    const [inserted] = await db.insert(mosque).values(m.mosque).returning({ id: mosque.id })

    await db.insert(location).values({ mosqueId: inserted.id, ...m.location })
    await db.insert(contactInfo).values({ mosqueId: inserted.id, ...m.contact })
    await db.insert(amenities).values({ mosqueId: inserted.id, ...m.amenities })

    for (const date of dates) {
      await db.insert(prayerTimes).values({
        mosqueId: inserted.id,
        date,
        ...m.prayers,
        source: m.source,
        sourceType: 'manual',
        lastVerifiedAt: new Date(),
        confidence: 'manual',
      }).onConflictDoNothing()
    }

    await db.insert(dataSource).values({
      mosqueId: inserted.id,
      url: m.source,
      type: 'website',
    })

    console.log(`  ✓ ${m.mosque.name} (${dates.length} days)`)
  }

  console.log(`\nDone — ${mosques.length} mosques seeded for ${dates[0]} → ${dates.at(-1)}.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
