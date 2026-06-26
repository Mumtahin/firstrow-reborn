import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { getMosqueBySlug, getFavouriteIds } from '@/lib/db/queries'
import { getNextJamaat } from '@/lib/utils/getNextJamaat'
import FavouriteButton from '@/components/FavouriteButton'
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon'
import NavigateIcon from '@/components/icons/NavigateIcon'
import PhoneIcon from '@/components/icons/PhoneIcon'
import GlobeIcon from '@/components/icons/GlobeIcon'
import MailIcon from '@/components/icons/MailIcon'
import ChevronRightIcon from '@/components/icons/ChevronRightIcon'
import MosqueDetailMapClient from '@/components/MosqueDetailMapClient'

const PRAYERS = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'zuhr', label: 'Zuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
] as const

type PrayerKey = (typeof PRAYERS)[number]['key']

const PRAYER_LABELS: Record<string, string> = {
  fajr: 'Fajr', zuhr: 'Zuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
}

function getPrayerLabel(key: string, friday: boolean): string {
  if (key === 'zuhr' && friday) return "Jummah"
  return PRAYER_LABELS[key] ?? key
}

function to12h(time: string | null | undefined): string {
  if (!time) return '—'
  const [h, m] = time.split(':').map(Number)
  const period = h < 12 ? 'am' : 'pm'
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour}:${m.toString().padStart(2, '0')}${period}`
}

function formatDateBadge(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, mo - 1, d))
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
}

function shiftDate(dateStr: string, days: number): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, mo - 1, d + days))
  return date.toISOString().split('T')[0]
}

function isFriday(dateStr: string): boolean {
  const [y, mo, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, mo - 1, d)).getUTCDay() === 5
}

function todayUK(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' })
}

function formatTime(time: string): { display: string; ampm: string } {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return { display: `${h12}:${String(m).padStart(2, '0')}`, ampm }
}

function countdownText(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function countdownBadge(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
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

  const [mosque, session] = await Promise.all([getMosqueBySlug(slug, date), auth()])
  if (!mosque) notFound()

  const userId = session?.user?.id ?? null
  const favouriteIds = userId ? await getFavouriteIds(userId) : new Set<number>()
  const isFavourited = favouriteIds.has(mosque.id)

  const now = new Date()
  const nextJamaat = isToday ? getNextJamaat(mosque, now) : null
  const allPassed = isToday && (nextJamaat === null || nextJamaat.isNextDay)
  const nextPrayer = nextJamaat && !nextJamaat.isNextDay ? nextJamaat.prayer : null
  const showHero = isToday && nextJamaat && !nextJamaat.isNextDay

  const friday = isFriday(date)
  const prevDate = shiftDate(date, -1)
  const nextDate = shiftDate(date, 1)

  const hasAmenities = mosque.hasWomensSpace || mosque.hasCarPark || mosque.hasDisabilityAccess
  const hasContact = mosque.website || mosque.phone || mosque.email

  return (
    <main className="mx-auto w-full max-w-lg">

      {/* Nav bar */}
      <div className="flex items-center justify-between px-4 pb-[14px] pt-10">
        <Link
          href="/"
          aria-label="Back"
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-card-border bg-white dark:bg-[#1D1B18] transition-transform duration-[200ms] ease-out active:scale-[0.92]"
        >
          <ChevronLeftIcon className="h-[15px] w-[15px] text-text-primary" />
        </Link>
        <FavouriteButton
          mosqueId={mosque.id}
          isFavourited={isFavourited}
          userId={userId}
          className="h-[38px] w-[38px] rounded-full border border-card-border bg-white dark:bg-[#1D1B18]"
        />
      </div>

      <div className="flex flex-col gap-[18px] px-4 pb-7">

        {/* Identity */}
        <div>
          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-text-primary">
            {mosque.name}
          </h1>
          {mosque.addressLine1 && (
            <p className="mt-[6px] text-[14px] font-medium text-text-secondary">
              {mosque.addressLine1}{mosque.addressLine2 ? `, ${mosque.addressLine2}` : ''},{' '}
              {mosque.town}, {mosque.postcode}
            </p>
          )}
        </div>

        {/* Hero card */}
        {showHero && (() => {
          const { display, ampm } = formatTime(nextJamaat.time)
          const colour = nextJamaat.justStarted ? 'text-urgent-go'
            : nextJamaat.minutesUntil >= 18 ? 'text-urgent-go'
            : nextJamaat.minutesUntil >= 5 ? 'text-urgent-tight'
            : 'text-urgent-late'
          const label = `${getPrayerLabel(nextJamaat.prayer, friday)} Jamaat`
          const showCountdown = !nextJamaat.justStarted
          return (
            <div className="rounded-2xl border border-card-border bg-white dark:bg-[#1D1B18] shadow-card">
              <div className="flex flex-col gap-[13px] px-4 py-[15px]">
                {/* Prayer label + time + countdown */}
                <div className="flex items-end justify-between">
                  <div className="flex flex-col gap-[3px]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
                      {label}
                    </p>
                    <div className="flex items-baseline">
                      {nextJamaat.justStarted ? (
                        <span className={`font-mono text-[34px] font-bold leading-[0.9] tracking-[-0.03em] ${colour}`}>
                          Now
                        </span>
                      ) : (
                        <>
                          <span className={`font-mono text-[34px] font-bold leading-[0.9] tracking-[-0.03em] ${colour}`}>
                            {display}
                          </span>
                          <span className="ml-[6px] text-[15px] font-semibold tracking-normal text-text-tertiary">
                            {ampm}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {showCountdown && (
                    <span className="self-end font-mono text-[15px] font-semibold text-text-secondary">
                      {countdownText(nextJamaat.minutesUntil)}
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-card-divider" />

                {/* Directions */}
                {mosque.lat && mosque.lng && (
                  <a
                    href={`https://maps.google.com/?q=${mosque.lat},${mosque.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-text-primary py-[15px] text-[16px] font-semibold text-[#FAFAF8] dark:text-[#16130F] transition-transform duration-[200ms] ease-out active:scale-[0.99]"
                  >
                    Directions
                    <NavigateIcon className="h-[17px] w-[17px]" />
                  </a>
                )}
              </div>
            </div>
          )
        })()}

        {/* All done for today banner */}
        {isToday && allPassed && (
          <div className="rounded-[18px] border border-card-border bg-white dark:bg-[#1D1B18] p-[18px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
              All done for today
            </p>
            {nextJamaat?.isNextDay ? (
              <p className="mt-1 text-[15px] font-medium text-text-secondary">
                Next up: <span className="font-semibold text-text-primary">Fajr</span> tomorrow at{' '}
                <span className="font-mono font-semibold text-text-primary">{to12h(nextJamaat.time)}</span>
              </p>
            ) : (
              <p className="mt-1 text-[14px] font-medium text-text-secondary">
                No times available for tomorrow yet.
              </p>
            )}
          </div>
        )}

        {/* Timetable */}
        <div>
          <div className="mb-[10px] flex items-center justify-between px-0.5">
            <span className="text-[12px] font-bold uppercase tracking-[0.07em] text-text-tertiary">
              {isToday ? "Today's jamaats" : 'Jamaats'}
            </span>
            <div className="flex items-center gap-3">
              <Link
                href={`/mosque/${slug}?date=${prevDate}`}
                aria-label="Previous day"
                className="text-[16px] leading-none text-text-tertiary transition-colors duration-[200ms] ease-out hover:text-text-secondary active:text-text-primary"
              >
                ‹
              </Link>
              <span className="text-[12px] font-medium text-[#A0A09A]">
                {formatDateBadge(date)}
              </span>
              <Link
                href={`/mosque/${slug}?date=${nextDate}`}
                aria-label="Next day"
                className="text-[16px] leading-none text-text-tertiary transition-colors duration-[200ms] ease-out hover:text-text-secondary active:text-text-primary"
              >
                ›
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-card-border bg-white dark:bg-[#1D1B18] divide-y divide-[#F3F3F0] dark:divide-[#2A2722]">
            {PRAYERS.map(({ key }) => {
              const label = getPrayerLabel(key, friday)
              const jamaatTime = mosque[`${key}Jamaat` as keyof typeof mosque] as string | null
              const startTime = mosque[`${key}Start` as keyof typeof mosque] as string | null
              if (!jamaatTime && !startTime && !isToday) return null

              const state = isToday ? getPrayerRowState(key, nextPrayer, allPassed) : 'upcoming'

              const rowBg = state === 'current' ? 'bg-[rgba(22,163,74,0.06)]' : ''
              const nameClass =
                state === 'past' ? 'text-[15px] font-medium text-text-secondary'
                : state === 'current' ? 'text-[16px] font-bold text-urgent-go'
                : 'text-[15px] font-medium text-text-primary'
              const timeClass =
                state === 'past' ? 'text-[15px] font-medium text-text-secondary'
                : state === 'current' ? 'text-[16px] font-bold text-urgent-go'
                : 'text-[15px] font-medium text-text-primary'

              return (
                <div key={key} className={`flex items-center justify-between px-4 py-[13px] ${rowBg}`}>
                  <div className="flex items-center gap-2.5">
                    <span className={nameClass}>{label}</span>
                    {state === 'current' && nextJamaat && (
                      <span className="rounded-full bg-[rgba(22,163,74,0.12)] px-[7px] py-[2px] text-[11px] font-semibold uppercase tracking-[0.05em] text-urgent-go">
                        In {countdownBadge(nextJamaat.minutesUntil)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-mono ${timeClass}`}>
                      {to12h(jamaatTime)}
                    </p>
                    {startTime && (
                      <p className="font-mono text-[12px] text-text-tertiary">
                        starts {to12h(startTime)}
                        {key === 'asr' && mosque.asrAltStart && (
                          <> / {to12h(mosque.asrAltStart)}</>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}

            {!mosque.fajrJamaat && !mosque.zuhrJamaat && !mosque.asrJamaat && !mosque.maghribJamaat && !mosque.ishaJamaat && (
              <p className="px-4 py-6 text-center text-[13px] text-text-tertiary">
                No prayer times available for this date.
              </p>
            )}
          </div>
        </div>

        {/* Facilities */}
        {hasAmenities && (
          <div>
            <p className="mb-[10px] px-0.5 text-[12px] font-bold uppercase tracking-[0.07em] text-text-tertiary">
              Facilities
            </p>
            <div className="grid grid-cols-2 gap-[10px]">
              {mosque.hasWomensSpace && (
                <div className="flex items-center gap-[11px] rounded-[13px] border border-card-border bg-white dark:bg-[#1D1B18] px-[14px] py-[13px]">
                  <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[#F1F4F2] dark:bg-[#26231F]">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                      <circle cx="9" cy="7" r="3" stroke="#15803D" strokeWidth="1.9" />
                      <path d="M3 21v-1a5 5 0 015-5h2a5 5 0 015 5v1" stroke="#15803D" strokeWidth="1.9" strokeLinecap="round" />
                      <path d="M16 11a3 3 0 100-6" stroke="#15803D" strokeWidth="1.9" strokeLinecap="round" />
                      <path d="M21 21v-1a5 5 0 00-4-4.9" stroke="#15803D" strokeWidth="1.9" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="text-[14px] font-semibold leading-tight tracking-[-0.01em] text-text-primary">Women&apos;s section</span>
                </div>
              )}
              {mosque.hasDisabilityAccess && (
                <div className="flex items-center gap-[11px] rounded-[13px] border border-card-border bg-white dark:bg-[#1D1B18] px-[14px] py-[13px]">
                  <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[#F1F4F2] dark:bg-[#26231F]">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="4" r="1.8" stroke="#15803D" strokeWidth="1.9" />
                      <path d="M9 8h4v5h3l2 6" stroke="#15803D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M13 13a6 6 0 11-5 9" stroke="#15803D" strokeWidth="1.9" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="text-[14px] font-semibold leading-tight tracking-[-0.01em] text-text-primary">Step-free access</span>
                </div>
              )}
              {mosque.hasCarPark && (
                <div className="flex items-center gap-[11px] rounded-[13px] border border-card-border bg-white dark:bg-[#1D1B18] px-[14px] py-[13px]">
                  <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[#F1F4F2] dark:bg-[#26231F]">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="4" width="16" height="16" rx="4" stroke="#15803D" strokeWidth="1.9" />
                      <path d="M9.5 16V8h3a2.4 2.4 0 010 4.8H9.5" stroke="#15803D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-[14px] font-semibold leading-tight tracking-[-0.01em] text-text-primary">Parking</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map */}
        {mosque.lat !== null && mosque.lng !== null && (
          <MosqueDetailMapClient lat={mosque.lat} lng={mosque.lng} name={mosque.name} />
        )}

        {/* Contact */}
        {hasContact && (
          <div>
            <p className="mb-[10px] px-0.5 text-[12px] font-bold uppercase tracking-[0.07em] text-text-tertiary">
              Contact
            </p>
            <div className="overflow-hidden rounded-2xl border border-card-border bg-white dark:bg-[#1D1B18] divide-y divide-[#F3F3F0] dark:divide-[#2A2722]">
              {mosque.phone && (
                <a href={`tel:${mosque.phone}`} className="flex items-center gap-3 px-4 py-[13px] transition-opacity duration-[200ms] ease-out active:opacity-60">
                  <PhoneIcon className="h-[17px] w-[17px] text-text-secondary" />
                  <span className="flex-1 text-[15px] font-medium text-text-primary">{mosque.phone}</span>
                  <ChevronRightIcon className="h-[13px] w-[8px] text-[#C8C8C2]" />
                </a>
              )}
              {mosque.website && (
                <a href={mosque.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-[13px] transition-opacity duration-[200ms] ease-out active:opacity-60">
                  <GlobeIcon className="h-[17px] w-[17px] text-text-secondary" />
                  <span className="flex-1 text-[15px] font-medium text-text-primary">{mosque.website.replace(/^https?:\/\//, '')}</span>
                  <ChevronRightIcon className="h-[13px] w-[8px] text-[#C8C8C2]" />
                </a>
              )}
              {mosque.email && (
                <a href={`mailto:${mosque.email}`} className="flex items-center gap-3 px-4 py-[13px] transition-opacity duration-[200ms] ease-out active:opacity-60">
                  <MailIcon className="h-[17px] w-[17px] text-text-secondary" />
                  <span className="flex-1 text-[15px] font-medium text-text-primary">{mosque.email}</span>
                  <ChevronRightIcon className="h-[13px] w-[8px] text-[#C8C8C2]" />
                </a>
              )}
            </div>
          </div>
        )}


      </div>
    </main>
  )
}
