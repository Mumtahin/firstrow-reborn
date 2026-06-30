import type { MosqueDetail, MosqueListing } from '@/lib/db/queries'

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

export function buildAreaJsonLd(areaName: string, areaUrl: string, description: string, mosques: MosqueListing[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Mosques in ${areaName}`,
    description,
    url: areaUrl,
    numberOfItems: mosques.length,
    itemListElement: mosques.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'MosqueOrChurch',
        name: m.name,
        url: `https://firstrow.uk/mosque/${m.slug}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: m.addressLine1,
          addressLocality: m.town,
          postalCode: m.postcode,
          addressCountry: 'GB',
        },
      },
    })),
  }
}
