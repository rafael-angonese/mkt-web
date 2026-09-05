import {
  ApiError,
  type CursorPage,
  type Paginated,
  apiCursorPage,
  apiPaginated,
  apiRequest,
  toQueryString,
} from '@/lib/api'
import type { ServiceCategory } from '@/lib/categories'
import type { City } from '@/lib/locations'

export type ServiceType = 'offer' | 'request'

export type PriceType = 'hourly' | 'daily' | 'fixed' | 'quote'

export type ServiceMode = 'at_client' | 'at_provider' | 'remote'

export type ServiceStatus =
  | 'draft'
  | 'pending'
  | 'published'
  | 'rejected'
  | 'archived'

export type ServiceOwnerStatus = 'draft' | 'published' | 'archived'

export const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  draft: 'Rascunho',
  pending: 'Em análise',
  published: 'Publicado',
  rejected: 'Recusado',
  archived: 'Arquivado',
}

export const SERVICE_STATUS_BADGE: Record<
  ServiceStatus,
  'success' | 'warning' | 'danger' | 'secondary'
> = {
  draft: 'secondary',
  pending: 'warning',
  published: 'success',
  rejected: 'danger',
  archived: 'secondary',
}

export type ServiceSort =
  | 'relevance'
  | 'distance'
  | 'rating'
  | 'price_asc'
  | 'price_desc'
  | 'recent'

export type ServiceMediaKind = 'image' | 'video'

export const SERVICE_MEDIA_MAX_COUNT = 10

export const SERVICE_PHOTO_MAX_BYTES = 8 * 1024 * 1024

export const SERVICE_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

export const SERVICE_IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

// Upload de vídeo desabilitado temporariamente. Reabilitar junto com o backend:
// export const SERVICE_VIDEO_MAX_BYTES = 60 * 1024 * 1024
// export const SERVICE_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v']
// export const SERVICE_VIDEO_CONTENT_TYPES = [
//   'video/mp4',
//   'video/webm',
//   'video/quicktime',
//   'video/x-m4v',
// ]

export type ServicePhoto = {
  id: number
  kind: ServiceMediaKind
  url: string | null
  position: number
}

export type ServicePhotoUpload = {
  key: string
  uploadUrl: string
  headers: Record<string, string>
}

export type UserSummary = {
  id: number
  name: string | null
  avatarUrl: string | null
  initials: string
  headline: string | null
  ratingAverage: number
  reviewsCount: number
  createdAt: string
}

export type Service = {
  id: number
  type: ServiceType
  title: string
  description: string
  priceType: PriceType
  priceCents: number | null
  serviceMode: ServiceMode
  coverageRadiusKm: number | null
  neighborhood: string | null
  status: ServiceStatus
  favoritesCount: number
  distanceKm: number | null
  isFavorited: boolean
  categoryId: number
  cityId: number
  userId: number
  category?: ServiceCategory
  city?: City
  photos?: ServicePhoto[]
  provider?: UserSummary
  rejectionReason: string | null
  moderatedAt: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string | null
}

export type PublicProfile = {
  id: number
  name: string | null
  avatarUrl: string | null
  initials: string
  headline: string | null
  bio: string | null
  whatsapp: string | null
  instagram: string | null
  website: string | null
  ratingAverage: number
  reviewsCount: number
  city?: City
  isProvider: boolean
  providerSince: string | null
  providerCategories?: ServiceCategory[]
  services?: Service[]
  createdAt: string
}

export function serviceCover(service: Service) {
  return service.photos?.find((photo) => photo.kind === 'image') ?? null
}

export type SearchServicesParams = {
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
  cursor?: string
  perPage?: number
}

export type ServiceInput = {
  type: ServiceType
  title: string
  description: string
  categoryId: number
  cityId: number
  priceType: PriceType
  priceCents: number | null
  serviceMode: ServiceMode
  coverageRadiusKm: number | null
  neighborhood: string | null
}

export const servicesApi = {
  search(
    params: SearchServicesParams,
    options: { token?: string | null; signal?: AbortSignal } = {},
  ): Promise<CursorPage<Service>> {
    return apiCursorPage<Service>(`/services${toQueryString(params)}`, options)
  },

  show(
    id: number,
    options: { token?: string | null; signal?: AbortSignal } = {},
  ) {
    return apiRequest<Service>(`/services/${id}`, options)
  },

  profile(id: number, signal?: AbortSignal) {
    return apiRequest<PublicProfile>(`/profiles/${id}`, { signal })
  },

  create(
    token: string,
    input: ServiceInput & { publish?: boolean; photoKeys?: string[] },
  ) {
    return apiRequest<Service>('/services', {
      method: 'POST',
      body: input,
      token,
    })
  },

  update(
    token: string,
    id: number,
    input: Partial<ServiceInput> & { status?: ServiceOwnerStatus },
  ) {
    return apiRequest<Service>(`/services/${id}`, {
      method: 'PUT',
      body: input,
      token,
    })
  },

  destroy(token: string, id: number) {
    return apiRequest<void>(`/services/${id}`, { method: 'DELETE', token })
  },

  createPhotoUploadUrl(
    token: string,
    input: { contentType: string; size: number },
  ) {
    return apiRequest<ServicePhotoUpload>('/services/photos/upload-url', {
      method: 'POST',
      body: input,
      token,
    })
  },

  addPhoto(token: string, id: number, key: string) {
    return apiRequest<ServicePhoto>(`/services/${id}/photos`, {
      method: 'POST',
      body: { key },
      token,
    })
  },

  reorderPhotos(token: string, id: number, photoIds: number[]) {
    return apiRequest<ServicePhoto[]>(`/services/${id}/photos`, {
      method: 'PUT',
      body: { photoIds },
      token,
    })
  },

  removePhoto(token: string, id: number, photoId: number) {
    return apiRequest<void>(`/services/${id}/photos/${photoId}`, {
      method: 'DELETE',
      token,
    })
  },

  favorite(token: string, id: number) {
    return apiRequest<Service>(`/services/${id}/favorite`, {
      method: 'POST',
      token,
    })
  },

  unfavorite(token: string, id: number) {
    return apiRequest<Service>(`/services/${id}/favorite`, {
      method: 'DELETE',
      token,
    })
  },

  mine(
    token: string,
    params: {
      type?: ServiceType
      status?: ServiceStatus
      page?: number
      perPage?: number
    } = {},
    signal?: AbortSignal,
  ): Promise<Paginated<Service>> {
    return apiPaginated<Service>(`/account/services${toQueryString(params)}`, {
      token,
      signal,
    })
  },

  favorites(
    token: string,
    params: { page?: number; perPage?: number } = {},
    signal?: AbortSignal,
  ): Promise<Paginated<Service>> {
    return apiPaginated<Service>(`/account/favorites${toQueryString(params)}`, {
      token,
      signal,
    })
  },

  favoriteIds(token: string, signal?: AbortSignal) {
    return apiRequest<number[]>('/account/favorites/ids', { token, signal })
  },
}

const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export function serviceImageContentType(file: File) {
  const type = file.type === 'image/jpg' ? 'image/jpeg' : file.type

  if (SERVICE_IMAGE_CONTENT_TYPES.includes(type)) {
    return type
  }

  const extension = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0]

  return extension ? (EXTENSION_CONTENT_TYPES[extension] ?? null) : null
}

async function putToStorage(upload: ServicePhotoUpload, file: File) {
  let response: Response

  try {
    response = await fetch(upload.uploadUrl, {
      method: 'PUT',
      headers: upload.headers,
      body: file,
    })
  } catch {
    throw new ApiError(0, [
      { message: 'Não foi possível enviar o arquivo para o armazenamento.' },
    ])
  }

  if (!response.ok) {
    throw new ApiError(response.status, [
      { message: 'Não foi possível enviar o arquivo para o armazenamento.' },
    ])
  }
}

export async function uploadServicePhotoFile(token: string, file: File) {
  const contentType = serviceImageContentType(file)

  if (!contentType) {
    throw new ApiError(0, [
      { message: `${file.name} não é uma imagem JPG, PNG ou WEBP.` },
    ])
  }

  const upload = await servicesApi.createPhotoUploadUrl(token, {
    contentType,
    size: file.size,
  })

  await putToStorage(upload, file)

  return upload.key
}

export async function uploadServicePhoto(
  token: string,
  serviceId: number,
  file: File,
) {
  const key = await uploadServicePhotoFile(token, file)

  return servicesApi.addPhoto(token, serviceId, key)
}
