import { type CursorPage, apiCursorPage, toQueryString } from '@/lib/api'
import type { ServiceCategory } from '@/lib/categories'
import type { City } from '@/lib/locations'

export const MAX_PROVIDER_CATEGORIES = 10

export type ProviderSort = 'relevance' | 'distance' | 'rating' | 'recent'

export type Provider = {
  id: number
  name: string | null
  avatarUrl: string | null
  initials: string
  headline: string | null
  bio: string | null
  ratingAverage: number
  reviewsCount: number
  servicesCount: number
  distanceKm: number | null
  city?: City
  categories?: ServiceCategory[]
  providerSince: string | null
  createdAt: string
}

export type SearchProvidersParams = {
  q?: string
  category?: string
  cityId?: number
  state?: string
  latitude?: number
  longitude?: number
  radiusKm?: number
  minRating?: number
  sort?: ProviderSort
  cursor?: string
  perPage?: number
}

export const providersApi = {
  search(
    params: SearchProvidersParams,
    options: { token?: string | null; signal?: AbortSignal } = {},
  ): Promise<CursorPage<Provider>> {
    return apiCursorPage<Provider>(`/providers${toQueryString(params)}`, options)
  },
}
