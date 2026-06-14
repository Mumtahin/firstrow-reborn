import { getMosquesWithPrayerTimes } from '@/lib/db/queries'
import HomeClient from '@/components/HomeClient'

export default async function HomePage() {
  const today = new Date().toISOString().split('T')[0]
  const mosques = await getMosquesWithPrayerTimes(today)

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">FirstRow</h1>
      <p className="mb-6 text-sm text-gray-500">Find your next jamaat nearby</p>
      <HomeClient mosques={mosques} />
    </main>
  )
}
