import type { MosqueDetail } from '@/lib/db/queries'

export function buildMosqueJsonLd(mosque: MosqueDetail, date: string) {
  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressCountry: 'GB',
  }
  if (mosque.addressLine1) address.streetAddress = mosque.addressLine2
    ? `${mosque.addressLine1}, ${mosque.addressLine2}`
    : mosque.addressLine1
  if (mosque.town) address.addressLocality = mosque.town
  if (mosque.postcode) address.postalCode = mosque.postcode

  const prayers: Array<{ key: string; label: string }> = [
    { key: 'fajrJamaat', label: 'Fajr' },
    { key: 'zuhrJamaat', label: 'Zuhr' },
    { key: 'asrJamaat', label: 'Asr' },
    { key: 'maghribJamaat', label: 'Maghrib' },
    { key: 'ishaJamaat', label: 'Isha' },
  ]

  const openingHoursSpecification = prayers
    .filter(({ key }) => mosque[key as keyof MosqueDetail] != null)
    .map(({ key, label }) => ({
      '@type': 'OpeningHoursSpecification',
      name: `${label} Jamaat`,
      dayOfWeek: [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
      ],
      opens: mosque[key as keyof MosqueDetail] as string,
      closes: mosque[key as keyof MosqueDetail] as string,
      validFrom: date,
      validThrough: date,
    }))

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MosqueOrChurch',
    name: mosque.name,
    url: `https://firstrow.uk/mosque/${mosque.slug}`,
    address,
  }

  if (mosque.lat != null && mosque.lng != null) {
    jsonLd.geo = {
      '@type': 'GeoCoordinates',
      latitude: mosque.lat,
      longitude: mosque.lng,
    }
  }
  if (mosque.phone) jsonLd.telephone = mosque.phone
  if (mosque.website) jsonLd.sameAs = mosque.website
  if (openingHoursSpecification.length > 0) {
    jsonLd.openingHoursSpecification = openingHoursSpecification
  }

  return jsonLd
}
