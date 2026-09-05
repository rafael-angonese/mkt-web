import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { Card } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { Skeleton } from '@/components/ui/skeleton'
import type { User } from '@/lib/auth'
import { useAuth } from '@/providers/auth-context'

export function AccountFormPage({
  title,
  description,
  redirect,
  children,
}: {
  title: string
  description: string
  redirect: string
  children: (user: User) => ReactNode
}) {
  const navigate = useNavigate()
  const { status, user } = useAuth()

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate({ to: '/signin', search: { redirect }, replace: true })
    }
  }, [status, navigate, redirect])

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <Link
        to="/account"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Voltar para meu perfil
      </Link>

      <Heading variant="h1" className="mt-4 text-3xl font-extrabold">
        {title}
      </Heading>
      <p className="mt-2 text-muted-foreground">{description}</p>

      {status !== 'authenticated' || !user ? (
        <Card className="mt-6 p-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mt-4 h-10 w-full" />
          <Skeleton className="mt-4 h-10 w-32" />
        </Card>
      ) : (
        children(user)
      )}
    </section>
  )
}
