'use client'

import { useEffect } from 'react'

export type AmenityFilters = {
  womensSpace: boolean
  parking: boolean
  stepFree: boolean
}

type Props = {
  open: boolean
  filters: AmenityFilters
  matchCount: number
  onChange: (filters: AmenityFilters) => void
  onClose: () => void
}

type FilterRowProps = {
  label: string
  description: string
  checked: boolean
  onToggle: () => void
}

function FilterRow({ label, description, checked, onToggle }: FilterRowProps) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-4 py-[14px] text-left"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[15px] font-semibold text-text-primary">{label}</span>
        <span className="text-[13px] font-medium text-text-tertiary">{description}</span>
      </div>
      {/* Toggle */}
      <div
        className={`relative h-[28px] w-[48px] shrink-0 rounded-full transition-colors duration-200 ${
          checked ? 'bg-text-primary' : 'bg-[#E2E2DE] dark:bg-[#3A3834]'
        }`}
      >
        <div
          className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-[23px]' : 'translate-x-[3px]'
          }`}
        />
      </div>
    </button>
  )
}

export default function FilterSheet({ open, filters, matchCount, onChange, onClose }: Props) {
  const activeCount = [filters.womensSpace, filters.parking, filters.stepFree].filter(Boolean).length

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  function reset() {
    onChange({ womensSpace: false, parking: false, stepFree: false })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-[220ms] ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg flex flex-col rounded-t-[24px] bg-white dark:bg-[#1D1B18] transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85dvh' }}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-5 mt-0 h-1 w-10 rounded-full bg-[#E2E2DE] dark:bg-[#3A3630]" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-[6px]">
          <span className="text-[19px] font-bold tracking-[-0.01em] text-text-primary">Filters</span>
          {activeCount > 0 && (
            <button
              onClick={reset}
              className="text-[14px] font-semibold text-text-tertiary"
            >
              Reset
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4">

          {/* Facilities */}
          <div className="mb-1 mt-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-text-tertiary">
              Facilities
            </span>
            <div className="divide-y divide-[#F0F0EC] dark:divide-[#2C2A27]">
              <FilterRow
                label="Women's prayer space"
                description="Dedicated room with own entrance"
                checked={filters.womensSpace}
                onToggle={() => onChange({ ...filters, womensSpace: !filters.womensSpace })}
              />
              <FilterRow
                label="Parking"
                description="On-site or dedicated spaces"
                checked={filters.parking}
                onToggle={() => onChange({ ...filters, parking: !filters.parking })}
              />
            </div>
          </div>

          {/* Accessibility */}
          <div className="mt-4 mb-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-text-tertiary">
              Accessibility
            </span>
            <div className="divide-y divide-[#F0F0EC] dark:divide-[#2C2A27]">
              <FilterRow
                label="Step-free access"
                description="Level or ramped entrance · accessible WC"
                checked={filters.stepFree}
                onToggle={() => onChange({ ...filters, stepFree: !filters.stepFree })}
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 pb-8 pt-3">
          <button
            onClick={onClose}
            className="w-full rounded-[14px] bg-text-primary py-[14px] text-[15px] font-semibold text-[#FAFAF8] dark:text-[#16130F] transition-opacity active:opacity-70"
          >
            {activeCount === 0 ? 'Apply filters' : `Show ${matchCount} mosque${matchCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </>
  )
}
