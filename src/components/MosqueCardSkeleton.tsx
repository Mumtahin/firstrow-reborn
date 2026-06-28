export default function MosqueCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-card-border bg-white dark:bg-[#1D1B18] shadow-card">
      <div className="flex flex-col gap-[13px] px-4 py-[15px]">

        {/* Prayer label + time + countdown */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-[6px]">
            <div className="h-[9px] w-[52px] rounded-full bg-card-divider" />
            <div className="h-[28px] w-[80px] rounded-md bg-card-divider" />
          </div>
          <div className="h-[13px] w-[38px] rounded-full bg-card-divider" />
        </div>

        <div className="h-px bg-card-divider" />

        {/* Mosque name + distance + directions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-[7px]">
            <div className="h-[15px] w-[148px] rounded-full bg-card-divider" />
            <div className="h-[11px] w-[104px] rounded-full bg-card-divider" />
          </div>
          <div className="h-11 w-11 shrink-0 rounded-xl bg-card-divider" />
        </div>

      </div>
    </div>
  )
}
