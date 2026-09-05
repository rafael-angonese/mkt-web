import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Briefcase, Heart, Pencil } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { CategoryIcon } from '@/components/discovery/category-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { User } from '@/lib/auth'
import { instagramLink } from '@/lib/format'
import { useAuth } from '@/providers/auth-context'

export const Route = createFileRoute('/account')({
  component: Conta,
  head: () => ({ meta: [{ title: 'Meu perfil | DodoPlace' }] }),
})

function formatDate(value: string | null) {
  if (!value) {
    return null
  }

  return format(new Date(value), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

function InfoRow({
  label,
  value,
  children,
}: {
  label: string
  value?: string | null
  children?: ReactNode
}) {
  return (
    <div className="grid gap-1">
      <p className="text-sm font-bold">{label}</p>
      {children ??
        (value ? (
          <p className="text-sm whitespace-pre-line text-foreground">{value}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Não informado</p>
        ))}
    </div>
  )
}

function SectionCard({
  title,
  editTo,
  editLabel,
  children,
}: {
  title: string
  editTo: '/account/profile' | '/account/contacts'
  editLabel: string
  children: ReactNode
}) {
  return (
    <Card className="mt-6">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="text-xl">{title}</CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link to={editTo}>
            <Pencil aria-hidden="true" />
            {editLabel}
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">{children}</CardContent>
    </Card>
  )
}

function ProviderBanner({ user }: { user: User }) {
  const categories = user.providerCategories ?? []

  return (
    <div className="mt-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-surface-muted p-5">
      <div className="min-w-0">
        <Heading variant="h4">
          {user.isProvider
            ? 'Você é prestador de serviço'
            : 'Torne-se prestador de serviço'}
        </Heading>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.isProvider
            ? 'Seu perfil aparece na busca por profissionais nas categorias abaixo.'
            : 'Ative para aparecer na busca por profissionais e escolha as categorias que você atende.'}
        </p>

        {user.isProvider && categories.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <Badge key={category.id} variant="secondary" className="gap-1">
                <CategoryIcon name={category.icon} className="size-3.5" />
                {category.name}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <Button asChild>
        <Link to="/account/provider">
          {user.isProvider ? 'Editar categorias' : 'Tornar-me prestador'}
        </Link>
      </Button>
    </div>
  )
}

function Conta() {
  const navigate = useNavigate()
  const { status, user, signOut } = useAuth()

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate({ to: '/signin', search: { redirect: '/account' }, replace: true })
    }
  }, [status, navigate])

  if (status !== 'authenticated' || !user) {
    return <ProfileSkeleton />
  }

  async function onSignOut() {
    await signOut()
    navigate({ to: '/', replace: true })
  }

  const instagram = instagramLink(user.instagram)

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <Heading variant="h1" className="text-3xl font-extrabold">
        Meu perfil
      </Heading>
      <p className="mt-2 text-muted-foreground">
        Estes dados aparecem no seu perfil público e nos seus anúncios.
      </p>

      <ProviderBanner user={user} />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button asChild variant="outline" className="justify-start">
          <Link to="/account/services">
            <Briefcase aria-hidden="true" />
            Meus serviços
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start">
          <Link to="/favorites">
            <Heart aria-hidden="true" />
            Favoritos
          </Link>
        </Button>
      </div>

      <SectionCard title="Perfil" editTo="/account/profile" editLabel="Editar">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {user.avatarUrl ? (
              <AvatarImage
                src={user.avatarUrl}
                alt={user.name ?? ''}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-dodo-orange text-lg font-extrabold text-dodo-blue-deep">
              {user.initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold">
              {user.name ?? 'Sem nome definido'}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Membro desde {formatDate(user.createdAt)} ·{' '}
          <Link
            to="/profile/$userId"
            params={{ userId: String(user.id) }}
            className="font-semibold underline"
          >
            ver meu perfil público
          </Link>
        </p>

        <Separator />

        <InfoRow label="Chamada profissional" value={user.headline} />
        <InfoRow label="Sobre você" value={user.bio} />
        <InfoRow label="Cidade" value={user.city?.label ?? null} />
      </SectionCard>

      <SectionCard
        title="Contatos"
        editTo="/account/contacts"
        editLabel="Editar"
      >
        <InfoRow label="WhatsApp" value={user.whatsapp} />
        <InfoRow label="Instagram">
          {user.instagram && instagram ? (
            <a
              href={instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm font-semibold underline"
            >
              @{user.instagram}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">Não informado</p>
          )}
        </InfoRow>
        <InfoRow label="Site">
          {user.website ? (
            <a
              href={user.website}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm font-semibold break-all underline"
            >
              {user.website}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">Não informado</p>
          )}
        </InfoRow>
      </SectionCard>

      <div className="mt-6">
        <Button type="button" variant="outline" onClick={onSignOut}>
          Sair da conta
        </Button>
      </div>
    </section>
  )
}

function ProfileSkeleton() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-3 h-5 w-72" />
      <Skeleton className="mt-6 h-28 w-full rounded-2xl" />
      <Card className="mt-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="mt-8 h-10 w-full" />
        <Skeleton className="mt-4 h-10 w-32" />
      </Card>
    </section>
  )
}
