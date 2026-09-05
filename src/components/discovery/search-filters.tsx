import { SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'

import { LocationPicker } from '@/components/location/location-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { PRICE_TYPE_LABEL, SERVICE_MODE_LABEL } from '@/lib/format'
import type { City } from '@/lib/locations'
import type { PriceType, ServiceMode } from '@/lib/services'

export type SearchFiltersScope = 'services' | 'providers'

export type SearchFiltersValue = {
  cityId?: number
  minPriceCents?: number
  maxPriceCents?: number
  minRating?: number
  mode?: ServiceMode
  priceType?: PriceType
  radiusKm?: number
}

const RATINGS = [
  { value: '', label: 'Qualquer nota' },
  { value: '3', label: '3 estrelas ou mais' },
  { value: '4', label: '4 estrelas ou mais' },
  { value: '5', label: 'Somente 5 estrelas' },
]

const RADIUS = [
  { value: '', label: 'Sem limite' },
  { value: '10', label: 'Até 10 km' },
  { value: '25', label: 'Até 25 km' },
  { value: '50', label: 'Até 50 km' },
  { value: '100', label: 'Até 100 km' },
]

function toReais(cents?: number) {
  return cents === undefined ? '' : String(cents / 100)
}

function toCents(value: string) {
  const parsed = Number(value.replace(',', '.'))

  return Number.isFinite(parsed) && parsed > 0
    ? Math.round(parsed * 100)
    : undefined
}

function countActive(value: SearchFiltersValue) {
  return Object.values(value).filter((entry) => entry !== undefined).length
}

export function SearchFilters({
  value,
  city,
  onApply,
  hasCoordinates,
  scope = 'services',
}: {
  value: SearchFiltersValue
  city?: City | null
  onApply: (next: SearchFiltersValue) => void
  hasCoordinates: boolean
  scope?: SearchFiltersScope
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const [draftCity, setDraftCity] = useState<City | null>(city ?? null)

  useEffect(() => {
    if (open) {
      setDraft(value)
      setDraftCity(city ?? null)
    }
  }, [open, value, city])

  const activeCount = countActive(value)

  function apply() {
    onApply(draft)
    setOpen(false)
  }

  function clear() {
    setDraft({})
    setDraftCity(null)
    onApply({})
    setOpen(false)
  }

  function onCitySelect(next: City | null) {
    setDraftCity(next)
    setDraft((current) => ({ ...current, cityId: next?.id }))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-10 gap-2 rounded-full">
          <SlidersHorizontal aria-hidden="true" />
          Filtros
          {activeCount > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-foreground text-[11px] font-bold text-background">
              {activeCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>
            {scope === 'providers'
              ? 'Refine os profissionais por localização e avaliação.'
              : 'Refine os resultados por localização, preço, avaliação e forma de atendimento.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 py-6">
          <fieldset className="grid gap-3">
            <legend className="mb-1 text-sm font-bold">Onde</legend>
            <LocationPicker
              displayCity={draftCity}
              onSelect={onCitySelect}
              triggerClassName="rounded-lg border border-input bg-transparent"
            />
          </fieldset>

          {scope === 'services' ? (
            <>
              <Separator />

              <fieldset className="grid gap-3">
                <legend className="mb-1 text-sm font-bold">
                  Faixa de preço
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="filter-price-min">Mínimo (R$)</Label>
                    <Input
                      id="filter-price-min"
                      inputMode="decimal"
                      placeholder="0"
                      defaultValue={toReais(draft.minPriceCents)}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          minPriceCents: toCents(event.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="filter-price-max">Máximo (R$)</Label>
                    <Input
                      id="filter-price-max"
                      inputMode="decimal"
                      placeholder="Sem limite"
                      defaultValue={toReais(draft.maxPriceCents)}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          maxPriceCents: toCents(event.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
              </fieldset>
            </>
          ) : null}

          <Separator />

          <fieldset className="grid gap-3">
            <legend className="mb-1 text-sm font-bold">Avaliação</legend>
            <RadioGroup
              value={draft.minRating ? String(draft.minRating) : ''}
              onValueChange={(next) =>
                setDraft((current) => ({
                  ...current,
                  minRating: next ? Number(next) : undefined,
                }))
              }
            >
              {RATINGS.map((option) => (
                <div key={option.label} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`rating-${option.value || 'any'}`}
                  />
                  <Label htmlFor={`rating-${option.value || 'any'}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>

          {scope === 'services' ? (
            <>
              <Separator />

              <fieldset className="grid gap-3">
                <legend className="mb-1 text-sm font-bold">Atendimento</legend>
                <RadioGroup
                  value={draft.mode ?? ''}
                  onValueChange={(next) =>
                    setDraft((current) => ({
                      ...current,
                      mode: next ? (next as ServiceMode) : undefined,
                    }))
                  }
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="" id="mode-any" />
                    <Label htmlFor="mode-any">Qualquer forma</Label>
                  </div>
                  {(Object.keys(SERVICE_MODE_LABEL) as ServiceMode[]).map(
                    (mode) => (
                      <div key={mode} className="flex items-center gap-2">
                        <RadioGroupItem value={mode} id={`mode-${mode}`} />
                        <Label htmlFor={`mode-${mode}`}>
                          {SERVICE_MODE_LABEL[mode]}
                        </Label>
                      </div>
                    ),
                  )}
                </RadioGroup>
              </fieldset>

              <Separator />

              <fieldset className="grid gap-3">
                <legend className="mb-1 text-sm font-bold">
                  Tipo de cobrança
                </legend>
                <RadioGroup
                  value={draft.priceType ?? ''}
                  onValueChange={(next) =>
                    setDraft((current) => ({
                      ...current,
                      priceType: next ? (next as PriceType) : undefined,
                    }))
                  }
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="" id="price-type-any" />
                    <Label htmlFor="price-type-any">Qualquer tipo</Label>
                  </div>
                  {(Object.keys(PRICE_TYPE_LABEL) as PriceType[]).map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <RadioGroupItem value={type} id={`price-type-${type}`} />
                      <Label htmlFor={`price-type-${type}`}>
                        {PRICE_TYPE_LABEL[type]}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </fieldset>
            </>
          ) : null}

          {hasCoordinates ? (
            <>
              <Separator />
              <fieldset className="grid gap-3">
                <legend className="mb-1 text-sm font-bold">Distância</legend>
                <RadioGroup
                  value={draft.radiusKm ? String(draft.radiusKm) : ''}
                  onValueChange={(next) =>
                    setDraft((current) => ({
                      ...current,
                      radiusKm: next ? Number(next) : undefined,
                    }))
                  }
                >
                  {RADIUS.map((option) => (
                    <div key={option.label} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`radius-${option.value || 'any'}`}
                      />
                      <Label htmlFor={`radius-${option.value || 'any'}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </fieldset>
            </>
          ) : null}
        </div>

        <SheetFooter className="flex-row justify-between gap-3">
          <Button type="button" variant="ghost" onClick={clear}>
            Limpar tudo
          </Button>
          <Button type="button" onClick={apply}>
            Ver resultados
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
