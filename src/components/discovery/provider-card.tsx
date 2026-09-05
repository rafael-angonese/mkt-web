import { Link } from '@tanstack/react-router'
import { MapPin, Star } from 'lucide-react'

import { CategoryIcon } from '@/components/discovery/category-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDistance, formatRating } from '@/lib/format'
import type { Provider } from '@/lib/providers'
import { cn } from '@/utils/cn'

const VISIBLE_CATEGORIES = 3

function servicesLabel(total: number) {
  if (total === 0) {
    return 'Nenhum serviço publicado'
  }

  return total === 1 ? '1 serviço publicado' : `${total} serviços publicados`
}

export function ProviderCard({
  provider,
  className,
}: {
  provider: Provider
  className?: string
}) {
  const categories = provider.categories ?? []
  const visible = categories.slice(0, VISIBLE_CATEGORIES)
  const hidden = categories.length - visible.length
  const distance = formatDistance(provider.distanceKm)

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-2xl border border-border p-5 transition hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          {provider.avatarUrl ? (
            <AvatarImage
              src={provider.avatarUrl}
              alt={provider.name ?? ''}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-dodo-orange font-extrabold text-dodo-blue-deep">
            {provider.initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <h3 className="truncate font-semibold">
            <Link
              to="/profile/$userId"
              params={{ userId: String(provider.id) }}
              className="after:absolute after:inset-0"
            >
              {provider.name ?? 'Profissional'}
            </Link>
          </h3>

          <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
            {provider.reviewsCount > 0 ? (
              <>
                <Star
                  aria-hidden="true"
                  className="size-3.5 fill-foreground text-foreground"
                />
                <span className="font-semibold text-foreground">
                  {formatRating(provider.ratingAverage)}
                </span>
                <span>({provider.reviewsCount})</span>
              </>
            ) : (
              <span>Sem avaliações ainda</span>
            )}
          </p>

          {provider.city ? (
            <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              {provider.city.label}
              {distance ? ` · ${distance}` : ''}
            </p>
          ) : null}
        </div>
      </div>

      {provider.headline ? (
        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
          {provider.headline}
        </p>
      ) : null}

      {visible.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {visible.map((category) => (
            <Badge key={category.id} variant="secondary" className="gap-1">
              <CategoryIcon name={category.icon} className="size-3.5" />
              {category.name}
            </Badge>
          ))}
          {hidden > 0 ? <Badge variant="outline">+{hidden}</Badge> : null}
        </div>
      ) : null}

      <p className="mt-auto pt-4 text-sm font-semibold">
        {servicesLabel(provider.servicesCount)}
      </p>
    </article>
  )
}

export function ProviderCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border p-5">
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-full bg-surface-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/5 rounded bg-surface-muted" />
          <div className="h-3 w-2/5 rounded bg-surface-muted" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-3 w-full rounded bg-surface-muted" />
        <div className="h-3 w-4/5 rounded bg-surface-muted" />
      </div>
      <div className="mt-5 h-6 w-1/2 rounded-full bg-surface-muted" />
    </div>
  )
}
