import { getMosquesWithPrayerTimes } from '@/lib/db/queries'
import HomeClient from '@/components/HomeClient'
import AuthButton from '@/components/AuthButton'

export default async function HomePage() {
  const today = new Date().toISOString().split('T')[0]
  const mosques = await getMosquesWithPrayerTimes(today)

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FirstRow</h1>
          <p className="text-sm text-gray-500">Find your next jamaat nearby</p>
        </div>
        <AuthButton />
      </div>
      <HomeClient mosques={mosques} />
    </main>
  )
}
