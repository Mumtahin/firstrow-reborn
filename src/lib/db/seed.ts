/**
 * Seed script — idempotent upsert on slug.
 * Safe to re-run: existing mosque IDs are preserved, user data is never touched.
 *
 * Run with: npm run db:seed
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { eq } from 'drizzle-orm'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import {
  amenities,
  contactInfo,
  dataSource,
  location,
  mosque,
  prayerTimes,
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
      lat: 51.5176162,
      lng: -0.0655304,
    },
    contact: {
      website: 'https://www.eastlondonmosque.org.uk',
      phone: '020 7650 3000',
      email: 'info@eastlondonmosque.org.uk',
    },
    amenities: { hasWomensSpace: true, hasCarPark: false, hasDisabilityAccess: true },
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
      lat: 51.5291248,
      lng: -0.1650222,
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
    mosque: { name: 'Baitul Aman Mosque & Cultural Centre', slug: 'baitul-aman-mosque', status: 'active' as const },
    location: {
      addressLine1: '101 Braintree Street',
      addressLine2: null,
      town: 'London',
      postcode: 'E2 0FT',
      lat: 51.5249628,
      lng: -0.0529009,
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
    mosque: { name: 'Dorset Community Association', slug: 'dorset-community-association', status: 'active' as const },
    location: {
      addressLine1: 'Diss St',
      addressLine2: 'Bethnal Green',
      town: 'London',
      postcode: 'E2 7QX',
      lat: 51.5301163,
      lng: -0.0724039,
    },
    contact: { website: 'https://dorsetca.org', phone: '02077399371', email: 'info@dorsetca.org' },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: true },
    source: null,
  },
  {
    mosque: { name: 'Shahporan Masjid & Islamic Centre Trust', slug: 'shahporan-masjid', status: 'active' as const },
    location: {
      addressLine1: '444 Hackney Rd',
      addressLine2: null,
      town: 'London',
      postcode: 'E2 6QL',
      lat: 51.5320385,
      lng: -0.0603459,
    },
    contact: { website: 'http://shahporanmasjid.uk', phone: '02070331843', email: null },
    amenities: { hasWomensSpace: true, hasCarPark: false, hasDisabilityAccess: true },
    source: null,
  },
  {
    mosque: { name: 'Globe Town (Bethnal Green) Mosque', slug: 'globe-town-bethnal-green-mosque', status: 'active' as const },
    location: {
      addressLine1: '100 Roman Rd',
      addressLine2: 'Bethnal Green',
      town: 'London',
      postcode: 'E2 0RN',
      lat: 51.5287901,
      lng: -0.0482831,
    },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: true },
    contact: { website: null, phone: '07956 402599', email: null },
    source: null,
  },
  {
    mosque: { name: 'Esha Atul Islam Mosque', slug: 'esha-atul-islam-mosque', status: 'active' as const },
    location: {
      addressLine1: '16 Ford Square',
      addressLine2: null,
      town: 'London',
      postcode: 'E1 2HS',
      lat: 51.5160916,
      lng: -0.0564789,
    },
    contact: { website: 'http://www.fordsquaremasjid.org', phone: '020 7790 0693', email: 'info@fordsquaremasjid.org' },
    amenities: { hasWomensSpace: true, hasCarPark: false, hasDisabilityAccess: true },
    source: null,
  },
  {
    mosque: { name: 'Darul Ummah', slug: 'darul-ummah', status: 'active' as const },
    location: {
      addressLine1: '56 Bigland Street',
      addressLine2: null,
      town: 'London',
      postcode: 'E1 2ND',
      lat: 51.5126261,
      lng: -0.0582466,
    },
    contact: { website: 'http://www.darulummah.org.uk', phone: '0207 790 5166', email: 'info@darulummah.org.uk' },
    amenities: { hasWomensSpace: true, hasCarPark: true, hasDisabilityAccess: true },
    source: null,
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
  {
    mosque: { name: 'Brick Lane Jamme Masjid', slug: 'brick-lane-jamme-masjid', status: 'active' as const },
    location: {
      addressLine1: '59 Brick Ln',
      addressLine2: null,
      town: 'London',
      postcode: 'E1 6QL',
      lat: 51.5197111,
      lng: -0.0719494,
    },
    contact: { website: 'http://bricklanejammemasjid.org.uk', phone: '02072476052', email: 'info@bricklanejammemasjid.org.uk' },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: false },
    source: null,
  },
  {
    mosque: { name: 'East London Markazi Masjid', slug: 'east-london-markazi-masjid', status: 'active' as const },
    location: {
      addressLine1: '9-11 Christian St',
      addressLine2: null,
      town: 'London',
      postcode: 'E1 1SE',
      lat: 51.5118100,
      lng: -0.0643784,
    },
    contact: { website: null, phone: '02074811294', email: null },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: false },
    source: null,
  },
  {
    mosque: { name: 'Shadwell Jamme Masjid', slug: 'shadwell-jamme-masjid', status: 'active' as const },
    location: {
      addressLine1: '143-145 Martha St',
      addressLine2: null,
      town: 'London',
      postcode: 'E1 2PG',
      lat: 51.5120941,
      lng: -0.0556899,
    },
    contact: { website: 'http://www.shadwelljamemasjid.org.uk', phone: '02032173048', email: 'shadwelljamemasjid@gmail.com' },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: false },
    source: null,
  },
  {
    mosque: { name: 'Stepney Shahjalal Mosque & Cultural Centre', slug: 'stepney-shahjalal-mosque-cultural-centre', status: 'active' as const },
    location: {
      addressLine1: '81-83 Duckett St',
      addressLine2: null,
      town: 'London',
      postcode: 'E1 4TD',
      lat: 51.5201982,
      lng: -0.0409488,
    },
    contact: { website: 'http://stepneyshahjalalmosque.org.uk', phone: '02072658603', email: 'info@stepneyshahjalalmosque.org.uk' },
    amenities: { hasWomensSpace: true, hasCarPark: false, hasDisabilityAccess: false },
    source: null,
  },
  {
    mosque: { name: 'Limehouse Masjid', slug: 'limehouse-masjid', status: 'active' as const },
    location: {
      addressLine1: '304-306 Stocks Pl',
      addressLine2: null,
      town: 'London',
      postcode: 'E14 8AE',
      lat: 51.5102389,
      lng: -0.02831650,
    },
    contact: { website: null, phone: '07873915987', email: null },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: false },
    source: null,
  },
  {
    mosque: { name: 'Al Aqsa Masjid, Cubitt Town', slug: 'al-aqsa-masjid-cubitt-town', status: 'active' as const },
    location: {
      addressLine1: 'Launch St',
      addressLine2: null,
      town: 'London',
      postcode: 'E14 3LU',
      lat: 51.4965031,
      lng: -0.0124045,
    },
    contact: { website: null, phone: '07896127001', email: null },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: false },
    source: null,
  },
  {
    mosque: { name: 'Al-Huda Cultural Centre & Mosque', slug: 'al-huda-cultural-centre-mosque', status: 'active' as const },
    location: {
      addressLine1: '91 Mile End Rd',
      addressLine2: null,
      town: 'London',
      postcode: 'E1 4UJ',
      lat: 51.5211577,
      lng: -0.0512689,
    },
    contact: { website: 'http://alhudamosque.com', phone: '02077809495', email: 'info@alhudamosque.com' },
    amenities: { hasWomensSpace: true, hasCarPark: false, hasDisabilityAccess: true },
    source: null,
  },
  {
    mosque: { name: 'Bow Muslim Cultural Centre', slug: 'bow-muslim-cultural-centre', status: 'active' as const },
    location: {
      addressLine1: '246 Bow Rd',
      addressLine2: null,
      town: 'London',
      postcode: 'E3 3AP',
      lat: 51.5295831,
      lng: -0.01477067,
    },
    contact: { website: 'http://www.bowcentralmosque.co.uk', phone: '02073778090', email: 'info@bowcentralmosque.co.uk' },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: false },
    source: null,
  },
  {
    mosque: { name: 'Poplar Central Mosque', slug: 'poplar-central-mosque', status: 'active' as const },
    location: {
      addressLine1: '253 E India Dock Rd',
      addressLine2: null,
      town: 'London',
      postcode: 'E14 0EG',
      lat: 51.5116501,
      lng: -0.0098497,
    },
    contact: { website: null, phone: '02075360726', email: null },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: false },
    source: null,
  },
  {
    mosque: { name: 'Madina Jamme Masjid (Docklands)', slug: 'madina-jamme-masjid-docklands', status: 'active' as const },
    location: {
      addressLine1: '248-250 Westferry Rd',
      addressLine2: null,
      town: 'London',
      postcode: 'E14 3TR',
      lat: 51.4886787,
      lng: -0.0194823,
    },
    contact: { website: 'http://madinamasjiddocklands.org.uk', phone: '02075372906', email: 'info@madinamasjiddocklands.org.uk' },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: false },
    source: null,
  },
  {
    mosque: { name: 'Wapping Noorani Masjid & Cultural Centre', slug: 'wapping-noorani-masjid-cultural-centre', status: 'active' as const },
    location: {
      addressLine1: '19 Prusom St',
      addressLine2: null,
      town: 'London',
      postcode: 'E1W 3NW',
      lat: 51.5063349,
      lng: -0.0563597,
    },
    contact: { website: null, phone: '02074819835', email: null },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: false },
    source: null,
  },
  {
    mosque: { name: 'Shoreditch Mosque', slug: 'shoreditch-mosque', status: 'active' as const },
    location: {
      addressLine1: '53-55 Redchurch St',
      addressLine2: null,
      town: 'London',
      postcode: 'E2 7DJ',
      lat: 51.5246930,
      lng: -0.0746816,
    },
    contact: { website: 'http://shoreditchmosque.com', phone: null, email: null },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: true },
    source: null,
  },
  {
    mosque: { name: 'Bromley-by-Bow Masjid', slug: 'bromley-by-bow-masjid', status: 'active' as const },
    location: {
      addressLine1: 'Powis Rd',
      addressLine2: null,
      town: 'London',
      postcode: 'E3 3HJ',
      lat: 51.5262243,
      lng: -0.0142724,
    },
    contact: { website: null, phone: null, email: null },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: false },
    source: null,
  },
  {
    mosque: { name: 'Burhanuddin Masjid', slug: 'burhanuddin-masjid', status: 'active' as const },
    location: {
      addressLine1: '8 Buckfast St',
      addressLine2: 'Turin St',
      town: 'London',
      postcode: 'E2 6EY',
      lat: 51.5261459,
      lng: -0.0661333,
    },
    contact: { website: null, phone: null, email: null },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: true },
    source: null,
  },
  {
    mosque: { name: 'Mazahirul uloom masjid', slug: 'mazahirul-uloom-masjid', status: 'active' as const },
    location: {
      addressLine1: 'Mile End Rd',
      addressLine2: null,
      town: 'London',
      postcode: 'E1 4QU',
      lat: 51.5225946,
      lng: -0.0444241,
    },
    contact: { website: null, phone: null, email: null },
    amenities: { hasWomensSpace: false, hasCarPark: false, hasDisabilityAccess: true },
    source: null,
  },
]

// Seed

async function seed() {
  const dates = nextDays(9)

  console.log('Seeding mosques (upsert — IDs preserved)...\n')

  for (const m of mosques) {
    // Upsert mosque on slug — preserves the existing ID if the row already exists
    const [inserted] = await db
      .insert(mosque)
      .values(m.mosque)
      .onConflictDoUpdate({
        target: mosque.slug,
        set: { name: m.mosque.name, status: m.mosque.status, updatedAt: new Date() },
      })
      .returning({ id: mosque.id })

    // Upsert 1-1 child tables (mosqueId is PK on each)
    await db
      .insert(location)
      .values({ mosqueId: inserted.id, ...m.location })
      .onConflictDoUpdate({ target: location.mosqueId, set: m.location })

    await db
      .insert(contactInfo)
      .values({ mosqueId: inserted.id, ...m.contact })
      .onConflictDoUpdate({ target: contactInfo.mosqueId, set: m.contact })

    await db
      .insert(amenities)
      .values({ mosqueId: inserted.id, ...m.amenities })
      .onConflictDoUpdate({ target: amenities.mosqueId, set: m.amenities })

    // Prayer times — skip dates already present (pipeline owns updates)
    if (m.prayers) {
      for (const date of dates) {
        await db
          .insert(prayerTimes)
          .values({
            mosqueId: inserted.id,
            date,
            ...m.prayers,
            source: m.source,
            sourceType: 'manual',
            lastVerifiedAt: new Date(),
            confidence: 'manual',
          })
          .onConflictDoNothing()
      }
    }

    // Data source — replace for this mosque (pipeline config, no user data)
    if (m.source) {
      await db.delete(dataSource).where(eq(dataSource.mosqueId, inserted.id))
      await db.insert(dataSource).values({ mosqueId: inserted.id, url: m.source, type: 'website' })
    }

    console.log(`  ✓ ${m.mosque.name} (id: ${inserted.id})`)
  }

  console.log(`\nDone — ${mosques.length} mosques seeded for ${dates[0]} → ${dates.at(-1)}.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
