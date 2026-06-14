import Image from 'next/image'
import Link from 'next/link'
import { auth, signOut } from '@/auth'

export default async function AuthButton() {
  const session = await auth()

  if (!session?.user) {
    return (
      <Link
        href="/sign-in"
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Sign in
      </Link>
    )
  }

  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo: '/' })
      }}
    >
      <button type="submit" className="flex items-center gap-2 rounded-lg border border-gray-200 py-1 pl-1 pr-3 hover:bg-gray-50">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? 'User'}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
            {session.user.name?.[0] ?? '?'}
          </span>
        )}
        <span className="text-sm text-gray-700">Sign out</span>
      </button>
    </form>
  )
}
