import { apiRequest } from '@/lib/api'
import type { ServiceCategory } from '@/lib/categories'
import type { City } from '@/lib/locations'

export type UpdateProfileInput = {
  name?: string | null
  headline?: string | null
  bio?: string | null
  whatsapp?: string | null
  instagram?: string | null
  website?: string | null
  cityId?: number | null
}

export type ProviderProfileInput = {
  isProvider: boolean
  categoryIds?: number[]
}

export type User = {
  id: number
  name: string | null
  email: string
  avatarUrl: string | null
  initials: string
  headline: string | null
  bio: string | null
  whatsapp: string | null
  instagram: string | null
  website: string | null
  cityId: number | null
  city?: City
  isProvider: boolean
  providerSince: string | null
  providerCategories?: ServiceCategory[]
  createdAt: string
  updatedAt: string | null
}

export type AuthSession = {
  user: User
  token: string
}

export type MagicLinkInput = {
  email: string
  name?: string | null
}

export type MagicLinkResult = {
  message: string
  expiresInMinutes: number
  devUrl?: string
}

export const authApi = {
  requestMagicLink(input: MagicLinkInput, signal?: AbortSignal) {
    return apiRequest<MagicLinkResult>('/auth/magic-link', {
      method: 'POST',
      body: input,
      signal,
    })
  },

  verifyMagicLink(token: string, signal?: AbortSignal) {
    return apiRequest<AuthSession>('/auth/verify', {
      method: 'POST',
      body: { token },
      signal,
    })
  },

  signOut(token: string) {
    return apiRequest<{ message: string }>('/account/logout', {
      method: 'POST',
      token,
    })
  },

  profile(token: string, signal?: AbortSignal) {
    return apiRequest<User>('/account/profile', { token, signal })
  },

  updateProfile(token: string, input: UpdateProfileInput) {
    return apiRequest<User>('/account/profile', {
      method: 'PUT',
      body: input,
      token,
    })
  },

  updateProvider(token: string, input: ProviderProfileInput) {
    return apiRequest<User>('/account/provider', {
      method: 'PUT',
      body: input,
      token,
    })
  },

  updateAvatar(token: string, file: File) {
    const body = new FormData()
    body.append('avatar', file)

    return apiRequest<User>('/account/profile/avatar', {
      method: 'POST',
      body,
      token,
    })
  },

  removeAvatar(token: string) {
    return apiRequest<User>('/account/profile/avatar', {
      method: 'DELETE',
      token,
    })
  },
}
