import type { ProviderSort } from '@/lib/providers'
import type { ServiceSort } from '@/lib/services'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const SERVICE_SORT_OPTIONS: { value: ServiceSort; label: string }[] = [
  { value: 'relevance', label: 'Mais relevantes' },
  { value: 'distance', label: 'Mais perto' },
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'recent', label: 'Mais recentes' },
]

export const PROVIDER_SORT_OPTIONS: { value: ProviderSort; label: string }[] = [
  { value: 'relevance', label: 'Mais relevantes' },
  { value: 'distance', label: 'Mais perto' },
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'recent', label: 'Novos por aqui' },
]

export function SortSelect<Option extends string>({
  value,
  onChange,
  options,
}: {
  value: Option
  onChange: (value: Option) => void
  options: { value: Option; label: string }[]
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as Option)}>
      <SelectTrigger className="h-10 w-full rounded-full sm:w-52">
        <SelectValue placeholder="Ordenar" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
