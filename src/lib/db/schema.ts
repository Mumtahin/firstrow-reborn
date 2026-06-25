import type { AdapterAccountType } from 'next-auth/adapters'
import {
  boolean,
  date,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'

// Enums
export const mosqueStatusEnum = pgEnum('mosque_status', ['active', 'unverified', 'inactive'])
export const sourceTypeEnum = pgEnum('source_type', ['website', 'pdf', 'image', 'manual'])
export const confidenceEnum = pgEnum('confidence', ['high', 'low', 'manual'])
export const dataSourceTypeEnum = pgEnum('data_source_type', ['website', 'pdf', 'image'])

// Mosque
export const mosque = pgTable('mosque', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  status: mosqueStatusEnum('status').notNull().default('unverified'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Location (1-1 with mosque)
export const location = pgTable('location', {
  mosqueId: integer('mosque_id')
    .primaryKey()
    .references(() => mosque.id),
  addressLine1: text('address_line_1').notNull(),
  addressLine2: text('address_line_2'),
  town: text('town').notNull(),
  postcode: text('postcode').notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
})

// Contact Info (1-1 with mosque)
export const contactInfo = pgTable('contact_info', {
  mosqueId: integer('mosque_id')
    .primaryKey()
    .references(() => mosque.id),
  website: text('website'),
  phone: text('phone'),
  email: text('email'),
})

// Amenities (1-1 with mosque)
export const amenities = pgTable('amenities', {
  mosqueId: integer('mosque_id')
    .primaryKey()
    .references(() => mosque.id),
  hasWomensSpace: boolean('has_womens_space'),
  hasCarPark: boolean('has_car_park'),
  hasDisabilityAccess: boolean('has_disability_access'),
})

// Prayer Times — one row per mosque per date
//
// All times stored as 'HH:mm' strings — no timezone ambiguity, simple to
// compare, matches exactly what mosques publish.
//
// asrAltStart: some mosques publish two Asr start times (Shafi'i + Hanafi).
export const prayerTimes = pgTable(
  'prayer_times',
  {
    id: serial('id').primaryKey(),
    mosqueId: integer('mosque_id')
      .notNull()
      .references(() => mosque.id),
    date: date('date').notNull(),

    fajrStart: text('fajr_start'),
    fajrJamaat: text('fajr_jamaat'),

    zuhrStart: text('zuhr_start'),
    zuhrJamaat: text('zuhr_jamaat'),

    asrStart: text('asr_start'),
    asrAltStart: text('asr_alt_start'),
    asrJamaat: text('asr_jamaat'),

    maghribStart: text('maghrib_start'),
    maghribJamaat: text('maghrib_jamaat'),

    ishaStart: text('isha_start'),
    ishaJamaat: text('isha_jamaat'),

    source: text('source'),
    sourceType: sourceTypeEnum('source_type'),
    lastVerifiedAt: timestamp('last_verified_at'),
    confidence: confidenceEnum('confidence'),
  },
  (t) => [unique().on(t.mosqueId, t.date)]
)

// Data Source — where the pipeline looks to scrape each mosque
export const dataSource = pgTable('data_source', {
  id: serial('id').primaryKey(),
  mosqueId: integer('mosque_id')
    .notNull()
    .references(() => mosque.id),
  url: text('url').notNull(),
  type: dataSourceTypeEnum('type').notNull(),
  lastAttemptAt: timestamp('last_attempt_at'),
  lastSuccessAt: timestamp('last_success_at'),
  lastError: text('last_error'),
})

// Auth — NextAuth (Auth.js) compatible tables
export const user = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
})

export const account = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
)

export const session = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationToken = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
)

// Favourite
export const favourite = pgTable(
  'favourite',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    mosqueId: integer('mosque_id')
      .notNull()
      .references(() => mosque.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.mosqueId] })]
)
