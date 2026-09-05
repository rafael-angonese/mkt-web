import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'

export function SearchEmptyState({
  city,
  scope = 'services',
}: {
  city?: string | null
  scope?: 'services' | 'providers'
}) {
  const isProviders = scope === 'providers'

  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <Heading variant="h4">
        Ainda não encontramos {isProviders ? 'profissionais' : 'resultados'}
        {city ? ` em ${city}` : ''}.
      </Heading>
      <p className="mt-2 text-muted-foreground">
        {isProviders
          ? 'Tente alterar a busca, ampliar a região ou remover filtros.'
          : 'Tente alterar a busca ou publique o serviço que você precisa.'}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link to="/" search={isProviders ? { view: 'providers' } : {}}>
            Alterar busca
          </Link>
        </Button>
        <Button asChild>
          <Link to={isProviders ? '/account' : '/publish'}>
            {isProviders ? 'Tornar-me prestador' : 'Publicar anúncio'}
          </Link>
        </Button>
      </div>
    </div>
  )
}
