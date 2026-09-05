import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { MapPin, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { LogoMark } from '@/components/brand/logo'
import { CategoryCarousel } from '@/components/discovery/category-carousel'
import {
  ProviderCard,
  ProviderCardSkeleton,
} from '@/components/discovery/provider-card'
import { SearchBar } from '@/components/discovery/search-bar'
import { SearchEmptyState } from '@/components/discovery/search-empty-state'
import {
  type SearchFiltersValue,
  SearchFilters,
} from '@/components/discovery/search-filters'
import { SearchViewTabs } from '@/components/discovery/search-view-tabs'
import {
  ServiceCard,
  ServiceCardSkeleton,
} from '@/components/discovery/service-card'
import { ServiceTypeTabs } from '@/components/discovery/service-type-tabs'
import {
  PROVIDER_SORT_OPTIONS,
  SERVICE_SORT_OPTIONS,
  SortSelect,
} from '@/components/discovery/sort-select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import type { ProviderSort } from '@/lib/providers'
import {
  categoriesQueryOptions,
  cityQueryOptions,
  providerListQueryOptions,
  serviceListQueryOptions,
} from '@/lib/queries'
import {
  type ServiceSearch,
  hasActiveFilters,
  isProvidersView,
  selectedCategories,
  toProviderSearch,
  toServiceSearch,
  toggleCategory,
  validateServiceSearch,
} from '@/lib/service-search'
import type { ServiceSort } from '@/lib/services'
import { cn } from '@/utils/cn'

const SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']

const RESULT_NOUN = {
  all: { titlePrefix: 'Anúncios', singular: 'anúncio', plural: 'anúncios' },
  offer: { titlePrefix: 'Serviços', singular: 'serviço', plural: 'serviços' },
  request: { titlePrefix: 'Pedidos', singular: 'pedido', plural: 'pedidos' },
}

const PROVIDER_NOUN = {
  titlePrefix: 'Profissionais',
  singular: 'profissional',
  plural: 'profissionais',
}

const STEPS = [
  {
    number: '1',
    title: 'Busque perto',
    description:
      'Escolha sua cidade ou use a localização do celular para ver quem atende na sua região.',
  },
  {
    number: '2',
    title: 'Compare',
    description:
      'Veja fotos, preços, avaliações e comentários de quem já contratou.',
  },
  {
    number: '3',
    title: 'Fale direto',
    description:
      'Chame o profissional no WhatsApp e combine o serviço sem intermediário.',
  },
]

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    meta: [
      { title: 'DodoPlace | Serviços perto de você' },
      {
        name: 'description',
        content:
          'Encontre quem faz perto de você. Descubra profissionais e serviços na sua região.',
      },
    ],
  }),
  validateSearch: validateServiceSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    if (typeof document !== 'undefined') {
      return
    }

    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQueryOptions),
      isProvidersView(deps)
        ? context.queryClient.ensureInfiniteQueryData(
            providerListQueryOptions(toProviderSearch(deps)),
          )
        : context.queryClient.ensureInfiniteQueryData(
            serviceListQueryOptions(toServiceSearch(deps)),
          ),
      deps.cityId
        ? context.queryClient
            .ensureQueryData(cityQueryOptions(deps.cityId))
            .catch(() => null)
        : null,
    ])
  },
})

function useFeedSentinel({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => unknown
}) {
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = sentinel.current

    if (!node || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '800px 0px' },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return sentinel
}

function Home() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const isProviders = isProvidersView(search)

  const { data: categories = [] } = useQuery(categoriesQueryOptions)
  const { data: city } = useQuery({
    ...cityQueryOptions(search.cityId ?? 0),
    enabled: search.cityId !== undefined,
  })

  const servicesQuery = useInfiniteQuery({
    ...serviceListQueryOptions(toServiceSearch(search)),
    enabled: !isProviders,
  })
  const providersQuery = useInfiniteQuery({
    ...providerListQueryOptions(toProviderSearch(search)),
    enabled: isProviders,
  })

  const feed = isProviders ? providersQuery : servicesQuery
  const sentinel = useFeedSentinel(feed)

  const services = servicesQuery.data?.pages.flatMap((page) => page.data) ?? []
  const providers = providersQuery.data?.pages.flatMap((page) => page.data) ?? []
  const total = isProviders ? providers.length : services.length

  const activeSlugs = selectedCategories(search)
  const activeCategories = categories.filter((entry) =>
    activeSlugs.includes(entry.slug),
  )
  const cityLabel = city?.label ?? null
  const hasCoordinates =
    search.latitude !== undefined && search.longitude !== undefined
  const isInitialLoading = feed.status === 'pending'
  const { hasNextPage } = feed

  const categoryLabel =
    activeCategories.length === 1
      ? activeCategories[0].name
      : activeCategories.length > 1
        ? `${activeCategories.length} categorias`
        : null

  const noun = isProviders ? PROVIDER_NOUN : RESULT_NOUN[search.type ?? 'all']

  const title = categoryLabel
    ? `${isProviders ? `${noun.titlePrefix} · ` : ''}${categoryLabel}${cityLabel ? ` em ${cityLabel}` : ''}`
    : cityLabel
      ? `${noun.titlePrefix} em ${cityLabel}`
      : `${noun.titlePrefix} perto de você`

  const sort = search.sort ?? (hasCoordinates ? 'distance' : 'relevance')

  function update(next: Partial<ServiceSearch>) {
    navigate({ to: '/', search: (current) => ({ ...current, ...next }) })
  }

  function onChangeView(view: 'services' | 'providers') {
    update({
      view: view === 'providers' ? 'providers' : undefined,
      type: undefined,
      minPriceCents: undefined,
      maxPriceCents: undefined,
      mode: undefined,
      priceType: undefined,
      sort: undefined,
    })
  }

  function onApplyFilters(filters: SearchFiltersValue) {
    update({
      cityId: filters.cityId,
      minPriceCents: filters.minPriceCents,
      maxPriceCents: filters.maxPriceCents,
      minRating: filters.minRating,
      mode: filters.mode,
      priceType: filters.priceType,
      radiusKm: filters.radiusKm,
    })
  }

  return (
    <>
      <section className="bg-dodo-blue text-white dark:bg-dodo-blue-deep">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-10 pb-12 md:flex-row md:items-center md:px-6 md:pt-14 md:pb-16">
          <div className="min-w-0 flex-1">
            <p className="mb-3 font-display text-sm font-bold tracking-[0.18em] text-dodo-orange uppercase">
              Marketplace de serviços
            </p>
            <Heading
              variant="h1"
              className="max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-6xl"
            >
              Encontre <span className="text-dodo-orange">quem faz</span> perto
              de você.
            </Heading>
            <p className="mt-5 max-w-2xl text-lg text-white/75">
              {isProviders
                ? 'Conheça os profissionais da sua região: veja as categorias que atendem, avaliações e fale direto com eles.'
                : 'Diaristas, eletricistas, encanadores, pintores e muito mais — com preço, foto e avaliação de quem já contratou.'}
            </p>

            <div className="mt-6">
              <SearchViewTabs
                value={isProviders ? 'providers' : 'services'}
                onChange={onChangeView}
              />
            </div>

            <div className="mt-4 max-w-3xl">
              <SearchBar
                defaultQuery={search.q ?? ''}
                category={search.category}
                placeholderKind={isProviders ? 'providers' : 'services'}
              />
            </div>
          </div>

          <LogoMark
            onDark
            className="hidden h-auto w-56 shrink-0 drop-shadow-2xl lg:block xl:w-64"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-b border-border px-4 md:px-6">
        <CategoryCarousel categories={categories} activeSlugs={activeSlugs} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Heading variant="h2" className="text-2xl font-extrabold md:text-3xl">
              {title}
            </Heading>
            <p className="mt-1 text-sm text-muted-foreground">
              {isInitialLoading
                ? `Carregando ${noun.plural}...`
                : total === 0
                  ? 'Nenhum resultado'
                  : `${total}${hasNextPage ? '+' : ''} ${total === 1 ? `${noun.singular} encontrado` : `${noun.plural} encontrados`}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isProviders ? null : (
              <ServiceTypeTabs
                value={search.type}
                onChange={(type) => update({ type })}
              />
            )}
            <SearchFilters
              city={city ?? null}
              scope={isProviders ? 'providers' : 'services'}
              value={
                isProviders
                  ? {
                      cityId: search.cityId,
                      minRating: search.minRating,
                      radiusKm: search.radiusKm,
                    }
                  : {
                      cityId: search.cityId,
                      minPriceCents: search.minPriceCents,
                      maxPriceCents: search.maxPriceCents,
                      minRating: search.minRating,
                      mode: search.mode,
                      priceType: search.priceType,
                      radiusKm: search.radiusKm,
                    }
              }
              onApply={onApplyFilters}
              hasCoordinates={hasCoordinates}
            />
            {isProviders ? (
              <SortSelect
                value={sort as ProviderSort}
                options={PROVIDER_SORT_OPTIONS}
                onChange={(next) => update({ sort: next })}
              />
            ) : (
              <SortSelect
                value={sort as ServiceSort}
                options={SERVICE_SORT_OPTIONS}
                onChange={(next) => update({ sort: next })}
              />
            )}
          </div>
        </div>

        {hasActiveFilters(search) ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {search.q ? (
              <Link to="/" search={(current) => ({ ...current, q: undefined })}>
                <Badge variant="secondary">“{search.q}” ✕</Badge>
              </Link>
            ) : null}
            {activeCategories.map((entry) => (
              <Link
                key={entry.id}
                to="/"
                search={(current) => ({
                  ...current,
                  category: toggleCategory(current.category, entry.slug),
                })}
              >
                <Badge variant="secondary">{entry.name} ✕</Badge>
              </Link>
            ))}
            {cityLabel ? (
              <Link
                to="/"
                search={(current) => ({ ...current, cityId: undefined })}
              >
                <Badge variant="secondary">
                  <MapPin aria-hidden="true" className="mr-1 size-3" />
                  {cityLabel} ✕
                </Badge>
              </Link>
            ) : null}

            <Link to="/" search={{ view: search.view }}>
              <Badge variant="outline" className="cursor-pointer gap-1">
                <X aria-hidden="true" className="size-3" />
                Limpar
              </Badge>
            </Link>
          </div>
        ) : null}

        {isInitialLoading ? (
          isProviders ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SKELETON_KEYS.slice(0, 6).map((key) => (
                <ProviderCardSkeleton key={key} />
              ))}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {SKELETON_KEYS.map((key) => (
                <ServiceCardSkeleton key={key} />
              ))}
            </div>
          )
        ) : total === 0 ? (
          <div className="mt-8">
            {hasActiveFilters(search) ? (
              <SearchEmptyState
                city={cityLabel}
                scope={isProviders ? 'providers' : 'services'}
              />
            ) : (
              <Card className="rounded-2xl p-8 text-center">
                <Heading variant="h4">
                  {isProviders
                    ? 'Ainda não há profissionais cadastrados por aqui.'
                    : `Ainda não há ${noun.plural} publicados por aqui.`}
                </Heading>
                <p className="mt-2 text-muted-foreground">
                  {isProviders
                    ? 'Cadastre-se como prestador de serviço e apareça nesta busca.'
                    : 'Seja o primeiro a anunciar na sua cidade.'}
                </p>
                <Button asChild className="mt-5">
                  <Link to={isProviders ? '/account' : '/publish'}>
                    {isProviders
                      ? 'Tornar-me prestador'
                      : 'Publicar meu serviço'}
                  </Link>
                </Button>
              </Card>
            )}
          </div>
        ) : isProviders ? (
          <div
            aria-busy={providersQuery.isFetching}
            className={cn(
              'mt-6 grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3',
              providersQuery.isPlaceholderData && 'opacity-60',
            )}
          >
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}

            {providersQuery.isFetchingNextPage
              ? SKELETON_KEYS.slice(0, 3).map((key) => (
                  <ProviderCardSkeleton key={key} />
                ))
              : null}
          </div>
        ) : (
          <div
            aria-busy={servicesQuery.isFetching}
            className={cn(
              'mt-6 grid grid-cols-2 gap-x-4 gap-y-8 transition-opacity sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
              servicesQuery.isPlaceholderData && 'opacity-60',
            )}
          >
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}

            {servicesQuery.isFetchingNextPage
              ? SKELETON_KEYS.slice(0, 5).map((key) => (
                  <ServiceCardSkeleton key={key} />
                ))
              : null}
          </div>
        )}

        <div ref={sentinel} aria-hidden="true" className="h-px" />

        {!hasNextPage && total > 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Você chegou ao fim da lista.
          </p>
        ) : null}
      </section>

      {!hasNextPage && !isInitialLoading ? (
        <>
          <section className="bg-surface-muted">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
              <p className="mb-3 font-display text-sm font-bold tracking-[0.18em] text-primary uppercase">
                Simples assim
              </p>
              <Heading variant="h2" className="font-extrabold">
                Resolver um serviço deve ser simples.
              </Heading>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {STEPS.map((step) => (
                  <Card key={step.number} className="rounded-2xl p-6">
                    <span className="grid size-9 place-items-center rounded-full bg-dodo-orange font-extrabold text-dodo-blue-deep">
                      {step.number}
                    </span>
                    <Heading variant="h4" className="mt-4">
                      {step.title}
                    </Heading>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl gap-4 px-4 py-14 md:grid-cols-2 md:px-6">
            <div className="rounded-3xl border border-border bg-card p-7">
              <Heading variant="h2" className="font-extrabold">
                Precisa de um serviço?
              </Heading>
              <p className="mt-2 text-muted-foreground">
                Pesquise por categoria e cidade e fale direto com o profissional.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="outline-primary">
                  <Link to="/services">Ver categorias</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/" search={{ view: 'providers' }}>
                    Ver profissionais
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl bg-dodo-blue p-7 text-white dark:bg-dodo-blue-deep">
              <Heading variant="h2" className="font-extrabold text-white">
                Você presta serviços?
              </Heading>
              <p className="mt-2 text-white/70">
                Ative seu perfil de prestador, escolha as categorias que você
                atende e apareça na busca por profissionais.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="brand">
                  <Link to="/publish">Publicar serviço</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/account">Tornar-me prestador</Link>
                </Button>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </>
  )
}
