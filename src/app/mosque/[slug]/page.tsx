import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { getMosqueBySlug, getFavouriteIds } from '@/lib/db/queries'
import { getNextJamaat } from '@/lib/utils/getNextJamaat'
import FavouriteButton from '@/components/FavouriteButton'

// Helpers
const PRAYERS = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'zuhr', label: 'Zuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
] as const

type PrayerKey = (typeof PRAYERS)[number]['key']

function to12h(time: string | null): string {
  if (!time) return '—'
  const [h, m] = time.split(':').map(Number)
  const period = h < 12 ? 'am' : 'pm'
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour}:${m.toString().padStart(2, '0')}${period}`
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

function formatDateHeading(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, mo - 1, d))
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })
  const month = date.toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' })
  return `${weekday} ${ordinal(d)} ${month}`
}

function shiftDate(dateStr: string, days: number): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, mo - 1, d + days))
  return date.toISOString().split('T')[0]
}

function todayUK(): string {
  return new Date()
    .toLocaleDateString('en-CA', { timeZone: 'Europe/London' }) // 'YYYY-MM-DD'
}

type RowState = 'past' | 'current' | 'upcoming'

function getPrayerRowState(
  prayer: PrayerKey,
  nextPrayer: PrayerKey | null,
  allPassed: boolean
): RowState {
  if (allPassed) return 'past'
  if (!nextPrayer) return 'upcoming'
  const order: PrayerKey[] = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha']
  const nextIdx = order.indexOf(nextPrayer)
  const thisIdx = order.indexOf(prayer)
  if (thisIdx < nextIdx) return 'past'
  if (thisIdx === nextIdx) return 'current'
  return 'upcoming'
}

const rowStyles: Record<RowState, string> = {
  past: 'text-gray-400',
  current: 'bg-amber-100 font-medium text-gray-900',
  upcoming: 'bg-stone-50 text-gray-700',
}

// Page
export default async function MosqueDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ date?: string }>
}) {
  const { slug } = await params
  const { date: dateParam } = await searchParams
  const today = todayUK()
  const date = dateParam ?? today
  const isToday = date === today

  const [mosque, session] = await Promise.all([
    getMosqueBySlug(slug, date),
    auth(),
  ])
  if (!mosque) notFound()

  const userId = session?.user?.id ?? null
  const favouriteIds = userId ? await getFavouriteIds(userId) : new Set<number>()
  const isFavourited = favouriteIds.has(mosque.id)

  const now = new Date()
  const nextJamaat = isToday ? getNextJamaat(mosque, now) : null
  const allPassed = isToday && (nextJamaat === null || nextJamaat.isNextDay)
  const nextPrayer = nextJamaat && !nextJamaat.isNextDay ? nextJamaat.prayer : null

  const prevDate = shiftDate(date, -1)
  const nextDate = shiftDate(date, 1)

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      {/* Back */}
      <Link href="/" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Heading */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{mosque.name}</h1>
        <FavouriteButton mosqueId={mosque.id} isFavourited={isFavourited} userId={userId} />
      </div>
      {mosque.addressLine1 && (
        <p className="mt-1 text-sm text-gray-500">
          {mosque.addressLine1}{mosque.addressLine2 ? `, ${mosque.addressLine2}` : ''},{' '}
          {mosque.town}, {mosque.postcode}
        </p>
      )}

      {/* Amenities */}
      {(mosque.hasWomensSpace || mosque.hasCarPark || mosque.hasDisabilityAccess) && (
        <div className="mt-4 flex gap-2">
          {mosque.hasWomensSpace && (
            <span title="Women's space" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg">🧕</span>
          )}
          {mosque.hasCarPark && (
            <span title="Car park" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg">🅿️</span>
          )}
          {mosque.hasDisabilityAccess && (
            <span title="Disability access" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg">♿</span>
          )}
        </div>
      )}

      {/* Date navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Link
          href={`/mosque/${slug}?date=${prevDate}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="Previous day"
        >
          ‹
        </Link>
        <span className="text-sm font-medium text-gray-700">
          {isToday ? 'Today' : formatDateHeading(date)}
        </span>
        <Link
          href={`/mosque/${slug}?date=${nextDate}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="Next day"
        >
          ›
        </Link>
      </div>

      {/* Prayer timetable */}
      <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-4 py-2 text-left">Prayer</th>
              <th className="px-4 py-2 text-right">Start</th>
              <th className="px-4 py-2 text-right">Jamaat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {PRAYERS.map(({ key, label }) => {
              const hasTimes = mosque[`${key}Start`] || mosque[`${key}Jamaat`]
              if (!hasTimes && !isToday) return null

              const state = isToday
                ? getPrayerRowState(key, nextPrayer, allPassed)
                : 'upcoming'

              return (
                <tr key={key} className={rowStyles[state]}>
                  <td className="px-4 py-3 font-medium">{label}</td>
                  <td className="px-4 py-3 text-right">
                    {to12h(mosque[`${key}Start`])}
                    {key === 'asr' && mosque.asrAltStart && (
                      <span className="ml-1 text-xs text-gray-400">
                        / {to12h(mosque.asrAltStart)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">{to12h(mosque[`${key}Jamaat`])}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {!mosque.fajrJamaat && !mosque.zuhrJamaat && !mosque.asrJamaat && !mosque.maghribJamaat && !mosque.ishaJamaat && (
          <p className="px-4 py-6 text-center text-sm text-gray-400">
            No prayer times available for this date.
          </p>
        )}
      </div>

      {/* Contact info */}
      {(mosque.website || mosque.phone || mosque.email) && (
        <div className="mt-6 flex flex-col gap-3">
          {mosque.website && (
            <a
              href={mosque.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">🌐</span>
              {mosque.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {mosque.phone && (
            <a
              href={`tel:${mosque.phone}`}
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">📞</span>
              {mosque.phone}
            </a>
          )}
          {mosque.email && (
            <a
              href={`mailto:${mosque.email}`}
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">✉️</span>
              {mosque.email}
            </a>
          )}
        </div>
      )}
    </main>
  )
}
