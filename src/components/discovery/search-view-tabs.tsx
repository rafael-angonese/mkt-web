import { Briefcase, UsersRound } from 'lucide-react'

import type { SearchView } from '@/lib/service-search'
import { cn } from '@/utils/cn'

const OPTIONS: {
  value: SearchView
  label: string
  icon: typeof Briefcase
}[] = [
  { value: 'services', label: 'Serviços', icon: Briefcase },
  { value: 'providers', label: 'Profissionais', icon: UsersRound },
]

export function SearchViewTabs({
  value,
  onChange,
  className,
}: {
  value: SearchView
  onChange: (value: SearchView) => void
  className?: string
}) {
  return (
    <fieldset
      className={cn(
        'inline-flex h-11 items-center rounded-full bg-white/15 p-1 backdrop-blur',
        className,
      )}
    >
      <legend className="sr-only">O que você quer buscar</legend>

      {OPTIONS.map((option) => {
        const isActive = option.value === value
        const Icon = option.icon

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-bold transition',
              'focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
              isActive
                ? 'bg-white text-dodo-blue-deep'
                : 'text-white/80 hover:text-white',
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
            {option.label}
          </button>
        )
      })}
    </fieldset>
  )
}
