import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon'

export const metadata: Metadata = {
  title: 'About',
}

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-lg">

      {/* Nav bar */}
      <div className="flex items-center px-4 pb-[14px] pt-10">
        <Link
          href="/"
          aria-label="Back"
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-card-border bg-white transition-transform duration-[200ms] ease-out active:scale-[0.92]"
        >
          <ChevronLeftIcon className="h-[15px] w-[15px] text-[#333]" />
        </Link>
      </div>

      <div className="flex flex-col gap-[22px] px-4 pb-10">

        {/* Logo + title */}
        <div className="flex flex-col items-center gap-4 pb-2 text-center">
          <Image
            src="/apple-touch-icon.png"
            alt="FirstRow"
            width={72}
            height={72}
            className="rounded-[18px]"
          />
          <div>
            <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-text-primary pb-2">
              FirstRow
            </h1>
            <p
              dir="rtl"
              lang="ar"
              className="mt-1 text-[15px] font-medium text-text-secondary"
            >
              بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ
            </p>
          </div>
        </div>

        {/* Origin */}
        <div className="overflow-hidden rounded-2xl border border-card-border bg-white">
          <div className="px-4 py-5">
            <p className="text-[15px] font-medium leading-relaxed text-text-secondary">
              FirstRow is a simple app for finding nearby mosques and their jamaat times.
              It&apos;s built for moments when you&apos;re out and about and need to know
              quickly: which mosque is closest, and when&apos;s the next jamaat.
            </p>
          </div>
        </div>

        {/* The idea */}
        <div>
          <p className="mb-[10px] px-0.5 text-[11px] font-bold uppercase tracking-[0.07em] text-text-tertiary">
            The idea
          </p>
          <div className="overflow-hidden rounded-2xl border border-card-border bg-white">
            <div className="px-4 py-5">
              <p className="text-[15px] font-medium leading-relaxed text-text-secondary">
                Instead of checking multiple mosque websites or calling ahead, FirstRow
                shows the essentials in one place: nearby mosques, the next jamaat time,
                and how long it&apos;ll take to get there.
              </p>
            </div>
          </div>
        </div>

        {/* What it does */}
        <div>
          <p className="mb-[10px] px-0.5 text-[11px] font-bold uppercase tracking-[0.07em] text-text-tertiary">
            What it does
          </p>
          <div className="overflow-hidden rounded-2xl border border-card-border bg-white divide-y divide-[#F3F3F0]">
            <div className="px-4 py-[14px]">
              <p className="text-[15px] font-semibold text-text-primary">Next jamaat at a glance</p>
              <p className="mt-[3px] text-[13px] font-medium leading-relaxed text-text-secondary">
                Colour-coded so it&apos;s clear whether to leave now or whether there&apos;s
                time to spare.
              </p>
            </div>
            <div className="px-4 py-[14px]">
              <p className="text-[15px] font-semibold text-text-primary">Sorted by proximity</p>
              <p className="mt-[3px] text-[13px] font-medium leading-relaxed text-text-secondary">
                With location access, mosques are ranked by walking or driving time, so
                the most reachable option appears first.
              </p>
            </div>
            <div className="px-4 py-[14px]">
              <p className="text-[15px] font-semibold text-text-primary">Full daily timetable</p>
              <p className="mt-[3px] text-[13px] font-medium leading-relaxed text-text-secondary">
                Tap a mosque to see adhan and jamaat times for every prayer, with past
                prayers dimmed and the current one highlighted.
              </p>
            </div>
            <div className="px-4 py-[14px]">
              <p className="text-[15px] font-semibold text-text-primary">Manual location</p>
              <p className="mt-[3px] text-[13px] font-medium leading-relaxed text-text-secondary">
                No GPS? Set a location manually — useful for planning ahead or checking
                times for a different area.
              </p>
            </div>
            <div className="px-4 py-[14px]">
              <p className="text-[15px] font-semibold text-text-primary">Favourites</p>
              <p className="mt-[3px] text-[13px] font-medium leading-relaxed text-text-secondary">
                Sign in to save regular mosques. They&apos;ll appear at the top of the
                list for quick access.
              </p>
            </div>
          </div>
        </div>

        {/* Coverage */}
        <div>
          <p className="mb-[10px] px-0.5 text-[11px] font-bold uppercase tracking-[0.07em] text-text-tertiary">
            Coverage
          </p>
          <div className="overflow-hidden rounded-2xl border border-card-border bg-white">
            <div className="px-4 py-5">
              <p className="text-[15px] font-medium leading-relaxed text-text-secondary">
                FirstRow currently covers mosques in Tower Hamlets, where the data is most
                reliable. Coverage will expand to other areas over time, if Allah wills.
              </p>
            </div>
          </div>
        </div>

        {/* How we source times */}
        <div>
          <p className="mb-[10px] px-0.5 text-[11px] font-bold uppercase tracking-[0.07em] text-text-tertiary">
            How times are sourced
          </p>
          <div className="overflow-hidden rounded-2xl border border-card-border bg-white divide-y divide-[#F3F3F0]">
            <div className="px-4 py-[14px]">
              <p className="text-[15px] font-semibold text-text-primary">Direct from mosques</p>
              <p className="mt-[3px] text-[13px] font-medium leading-relaxed text-text-secondary">
                Where possible, times are pulled from each mosque&apos;s own website and
                re-fetched regularly so the schedule stays current.
              </p>
            </div>
            <div className="px-4 py-[14px]">
              <p className="text-[15px] font-semibold text-text-primary">Verified networks</p>
              <p className="mt-[3px] text-[13px] font-medium leading-relaxed text-text-secondary">
                For mosques on shared platforms, jamaat times come from the network&apos;s live data feed, maintained by the
                mosques themselves.
              </p>
            </div>
          </div>
          <p className="mt-[10px] px-1 text-[12px] font-medium leading-relaxed text-text-tertiary">
            If you spot a mistake or outdated times,{' '}
            <a
              href="mailto:showcase.unstaffed520@passmail.net?subject=FirstRow%20feedback"
              className="text-text-secondary underline underline-offset-2"
            >
              send feedback
            </a>
            {' '}— it helps keep the data accurate.
          </p>
        </div>

        {/* Version */}
        <p className="px-0.5 text-[12px] font-medium text-text-tertiary">
          FirstRow v1.1
        </p>

      </div>
    </main>
  )
}


