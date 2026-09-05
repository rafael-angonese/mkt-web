import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from '@tanstack/react-query'

import { categoriesApi } from '@/lib/categories'
import { chatApi } from '@/lib/chat'
import { locationsApi } from '@/lib/locations'
import { type SearchProvidersParams, providersApi } from '@/lib/providers'
import { type SearchServicesParams, servicesApi } from '@/lib/services'

export const SERVICES_PAGE_SIZE = 24

export const PROVIDERS_PAGE_SIZE = 24

export const CONVERSATIONS_PAGE_SIZE = 40

export const chatKeys = {
  conversationsRoot: ['chat', 'conversations'] as const,
  conversations: (search?: string) =>
    ['chat', 'conversations', search ?? ''] as const,
  conversation: (id: number) => ['chat', 'conversation', id] as const,
  messages: (id: number) => ['chat', 'messages', id] as const,
  unread: ['chat', 'unread'] as const,
}

export function conversationsQueryOptions(token: string, search?: string) {
  return queryOptions({
    queryKey: chatKeys.conversations(search),
    queryFn: ({ signal }) =>
      chatApi.conversations(
        token,
        { q: search || undefined, perPage: CONVERSATIONS_PAGE_SIZE },
        signal,
      ),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  })
}

export function conversationQueryOptions(token: string, conversationId: number) {
  return queryOptions({
    queryKey: chatKeys.conversation(conversationId),
    queryFn: ({ signal }) => chatApi.conversation(token, conversationId, signal),
    staleTime: 15_000,
  })
}

export function messagesQueryOptions(token: string, conversationId: number) {
  return infiniteQueryOptions({
    queryKey: chatKeys.messages(conversationId),
    queryFn: ({ pageParam, signal }) =>
      chatApi.messages(
        token,
        conversationId,
        { before: pageParam ? Number(pageParam) : undefined },
        signal,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 15_000,
  })
}

export function unreadMessagesQueryOptions(token: string) {
  return queryOptions({
    queryKey: chatKeys.unread,
    queryFn: ({ signal }) => chatApi.unread(token, signal),
    staleTime: 15_000,
  })
}

export const categoriesQueryOptions = queryOptions({
  queryKey: ['categories'],
  queryFn: ({ signal }) => categoriesApi.list(signal),
  staleTime: 10 * 60_000,
})

export function cityQueryOptions(cityId: number) {
  return queryOptions({
    queryKey: ['city', cityId],
    queryFn: ({ signal }) => locationsApi.city(cityId, signal),
    staleTime: 10 * 60_000,
  })
}

export function serviceListQueryOptions(params: SearchServicesParams) {
  return infiniteQueryOptions({
    queryKey: ['services', params],
    queryFn: ({ pageParam, signal }) =>
      servicesApi.search(
        {
          ...params,
          cursor: pageParam ?? undefined,
          perPage: SERVICES_PAGE_SIZE,
        },
        { signal },
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  })
}

export function providerListQueryOptions(params: SearchProvidersParams) {
  return infiniteQueryOptions({
    queryKey: ['providers', params],
    queryFn: ({ pageParam, signal }) =>
      providersApi.search(
        {
          ...params,
          cursor: pageParam ?? undefined,
          perPage: PROVIDERS_PAGE_SIZE,
        },
        { signal },
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  })
}
