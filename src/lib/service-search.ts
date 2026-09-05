import type { ProviderSort, SearchProvidersParams } from '@/lib/providers'
import type {
  PriceType,
  SearchServicesParams,
  ServiceMode,
  ServiceSort,
  ServiceType,
} from '@/lib/services'

const VIEWS: SearchView[] = ['services', 'providers']

const PROVIDER_SORTS: ProviderSort[] = [
  'relevance',
  'distance',
  'rating',
  'recent',
]

const SORTS: ServiceSort[] = [
  'relevance',
  'distance',
  'rating',
  'price_asc',
  'price_desc',
  'recent',
]

const MODES: ServiceMode[] = ['at_client', 'at_provider', 'remote']

const TYPES: ServiceType[] = ['offer', 'request']

const PRICE_TYPES: PriceType[] = ['hourly', 'daily', 'fixed', 'quote']

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const MAX_CATEGORY_FILTERS = 10

export type SearchView = 'services' | 'providers'

export type ServiceSearch = {
  view?: SearchView
  type?: ServiceType
  q?: string
  category?: string
  cityId?: number
  state?: string
  latitude?: number
  longitude?: number
  radiusKm?: number
  minPriceCents?: number
  maxPriceCents?: number
  minRating?: number
  mode?: ServiceMode
  priceType?: PriceType
  sort?: ServiceSort
}

function text(value: unknown) {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()

  return trimmed ? trimmed : undefined
}

function positive(value: unknown) {
  const parsed = Number(value)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function coordinate(value: unknown, limit: number) {
  const parsed = Number(value)

  return Number.isFinite(parsed) && Math.abs(parsed) <= limit
    ? parsed
    : undefined
}

function oneOf<T extends string>(value: unknown, options: T[]) {
  return typeof value === 'string' && options.includes(value as T)
    ? (value as T)
    : undefined
}

function parseCategories(value: unknown) {
  const entries = typeof value === 'string' ? value.split(',') : []
  const slugs: string[] = []

  for (const entry of entries) {
    const slug = entry.trim()

    if (SLUG_PATTERN.test(slug) && !slugs.includes(slug)) {
      slugs.push(slug)
    }
  }

  return slugs.slice(0, MAX_CATEGORY_FILTERS)
}

export function selectedCategories(search: ServiceSearch) {
  return parseCategories(search.category)
}

export function toggleCategory(current: string | undefined, slug: string) {
  const slugs = parseCategories(current)
  const next = slugs.includes(slug)
    ? slugs.filter((entry) => entry !== slug)
    : [...slugs, slug]

  return next.length > 0 ? next.slice(0, MAX_CATEGORY_FILTERS).join(',') : undefined
}

export function validateServiceSearch(
  search: Record<string, unknown>,
): ServiceSearch {
  const categories = parseCategories(search.category)
  const state = text(search.state)?.toUpperCase()
  const minRating = positive(search.minRating)

  return {
    view: oneOf(search.view, VIEWS),
    type: oneOf(search.type, TYPES),
    q: text(search.q),
    category: categories.length > 0 ? categories.join(',') : undefined,
    cityId: positive(search.cityId),
    state: state && /^[A-Z]{2}$/.test(state) ? state : undefined,
    latitude: coordinate(search.latitude, 90),
    longitude: coordinate(search.longitude, 180),
    radiusKm: positive(search.radiusKm),
    minPriceCents: positive(search.minPriceCents),
    maxPriceCents: positive(search.maxPriceCents),
    minRating: minRating && minRating <= 5 ? minRating : undefined,
    mode: oneOf(search.mode, MODES),
    priceType: oneOf(search.priceType, PRICE_TYPES),
    sort: oneOf(search.sort, SORTS),
  }
}

export function hasActiveFilters(search: ServiceSearch) {
  return Object.entries(search).some(
    ([key, value]) => key !== 'sort' && key !== 'view' && value !== undefined,
  )
}

export function isProvidersView(search: ServiceSearch) {
  return search.view === 'providers'
}

export function toServiceSearch(search: ServiceSearch): SearchServicesParams {
  return {
    type: search.type,
    q: search.q,
    category: search.category,
    cityId: search.cityId,
    state: search.state,
    latitude: search.latitude,
    longitude: search.longitude,
    radiusKm: search.radiusKm,
    minPriceCents: search.minPriceCents,
    maxPriceCents: search.maxPriceCents,
    minRating: search.minRating,
    mode: search.mode,
    priceType: search.priceType,
    sort: search.sort,
  }
}

export function toProviderSearch(search: ServiceSearch): SearchProvidersParams {
  return {
    q: search.q,
    category: search.category,
    cityId: search.cityId,
    state: search.state,
    latitude: search.latitude,
    longitude: search.longitude,
    radiusKm: search.radiusKm,
    minRating: search.minRating,
    sort: oneOf(search.sort, PROVIDER_SORTS),
  }
}
