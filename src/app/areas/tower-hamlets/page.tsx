import type { Metadata } from 'next'
import Link from 'next/link'
import { getMosquesByDistricts } from '@/lib/db/queries'
import type { MosqueListing } from '@/lib/db/queries'
import { buildAreaJsonLd } from '@/lib/utils/mosque-jsonld'

export const metadata: Metadata = {
  title: { absolute: 'Mosque Jamaat Times in Tower Hamlets | FirstRow' },
  description:
    'Live jamaat times for every mosque in Tower Hamlets — Whitechapel, Bethnal Green, Bow, Poplar, Limehouse and more. Updated daily.',
  openGraph: {
    title: 'Mosque Jamaat Times in Tower Hamlets | FirstRow',
    description:
      'Live jamaat times for every mosque in Tower Hamlets — Whitechapel, Bethnal Green, Bow, Poplar, Limehouse and more. Updated daily.',
  },
}

// Postcode districts that cover Tower Hamlets
const TOWER_HAMLETS_DISTRICTS = ['E1', 'E1W', 'E2', 'E3', 'E14']


function MosqueListCard({ mosque }: { mosque: MosqueListing }) {
  return (
    <Link
      href={`/mosque/${mosque.slug}`}
      className="flex items-center justify-between rounded-2xl border border-card-border bg-white dark:bg-[#1D1B18] px-4 py-[14px] shadow-card transition-transform duration-[200ms] ease-out active:scale-[0.99]"
    >
      <div className="min-w-0">
        <h2 className="text-[17px] font-semibold leading-tight tracking-[-0.01em] text-text-primary">
          {mosque.name}
        </h2>
        <p className="mt-[3px] text-[13px] font-medium text-text-secondary">
          {mosque.addressLine1}, {mosque.town}, {mosque.postcode}
        </p>
      </div>
      <span className="ml-3 shrink-0 text-[13px] font-semibold text-text-tertiary">›</span>
    </Link>
  )
}

export default async function TowerHamletsPage() {
  const mosques = (await getMosquesByDistricts(TOWER_HAMLETS_DISTRICTS)).sort(
    (a, b) => a.name.localeCompare(b.name)
  )

  // Group by town
  const byTown: Record<string, MosqueListing[]> = {}
  for (const m of mosques) {
    const town = m.town || 'Tower Hamlets'
    if (!byTown[town]) byTown[town] = []
    byTown[town].push(m)
  }
  const towns = Object.keys(byTown).sort()

  const jsonLd = buildAreaJsonLd(
    'Tower Hamlets',
    'https://firstrow.uk/areas/tower-hamlets',
    'Live jamaat times for every mosque in Tower Hamlets, East London.',
    mosques,
  )

  return (
    <main className="mx-auto w-full max-w-lg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col gap-6 px-4 pb-10 pt-10">

        {/* Nav */}
        <Link
          href="/"
          className="self-start text-[13px] font-medium text-text-tertiary transition-colors duration-[200ms] ease-out hover:text-text-secondary"
        >
          ← All mosques
        </Link>

        {/* Heading + intro */}
        <div>
          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-text-primary">
            Mosque Jamaat Times in Tower Hamlets
          </h1>
          <p className="mt-3 text-[15px] font-medium leading-relaxed text-text-secondary">
            Tower Hamlets has one of the UK&apos;s largest Muslim communities, with mosques
            across Whitechapel, Bethnal Green, Stepney, Bow, Poplar, Limehouse, and the
            Isle of Dogs. See today&apos;s live jamaat times for every mosque in Tower Hamlets
            — updated daily.
          </p>
        </div>

        {/* Mosque count */}
        {mosques.length > 0 && (
          <p className="text-[12px] font-bold uppercase tracking-[0.07em] text-text-tertiary">
            {mosques.length} mosque{mosques.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Grouped list */}
        {towns.map((town) => (
          <div key={town} className="flex flex-col gap-[10px]">
            {towns.length > 1 && (
              <p className="px-0.5 text-[12px] font-bold uppercase tracking-[0.07em] text-text-tertiary">
                {town}
              </p>
            )}
            {byTown[town].map((m) => (
              <MosqueListCard key={m.id} mosque={m} />
            ))}
          </div>
        ))}

        {mosques.length === 0 && (
          <p className="rounded-2xl border border-card-border bg-white dark:bg-[#1D1B18] px-4 py-6 text-center text-[14px] font-medium text-text-secondary">
            No mosques found for Tower Hamlets.
          </p>
        )}

      </div>
    </main>
  )
}
