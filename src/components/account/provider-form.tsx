import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { CategoryIcon } from '@/components/discovery/category-icon'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ApiError } from '@/lib/api'
import type { User } from '@/lib/auth'
import { MAX_PROVIDER_CATEGORIES } from '@/lib/providers'
import { categoriesQueryOptions } from '@/lib/queries'
import { useAuth } from '@/providers/auth-context'
import { cn } from '@/utils/cn'

function currentCategoryIds(user: User) {
  return (user.providerCategories ?? []).map((category) => category.id)
}

function hasChanges(
  user: User,
  isProvider: boolean,
  selected: number[],
): boolean {
  if (isProvider !== user.isProvider) {
    return true
  }

  const initial = currentCategoryIds(user)

  return (
    selected.length !== initial.length ||
    selected.some((id) => !initial.includes(id))
  )
}

export function ProviderForm({ user }: { user: User }) {
  const navigate = useNavigate()
  const { updateProvider } = useAuth()
  const { data: categories = [] } = useQuery(categoriesQueryOptions)

  const [isProvider, setIsProvider] = useState(user.isProvider)
  const [selected, setSelected] = useState<number[]>(currentCategoryIds(user))
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const isDirty = hasChanges(user, isProvider, selected)
  const reachedLimit = selected.length >= MAX_PROVIDER_CATEGORIES

  function toggleCategory(id: number) {
    setError(null)
    setSelected((current) => {
      if (current.includes(id)) {
        return current.filter((entry) => entry !== id)
      }

      return current.length >= MAX_PROVIDER_CATEGORIES
        ? current
        : [...current, id]
    })
  }

  function onToggleProvider(next: boolean) {
    setError(null)
    setIsProvider(next)
  }

  async function onSave() {
    setError(null)

    if (isProvider && selected.length === 0) {
      setError('Escolha ao menos uma categoria que você atende.')
      return
    }

    setIsSaving(true)

    try {
      await updateProvider({
        isProvider,
        categoryIds: isProvider ? selected : undefined,
      })

      toast.success(
        isProvider
          ? 'Seu perfil de prestador foi atualizado.'
          : 'Você não aparece mais na busca por profissionais.',
      )
      navigate({ to: '/account' })
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'Não foi possível salvar seu perfil de prestador.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="mt-6">
      <CardContent className="flex flex-col gap-6 pt-6">
        {error ? (
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
          <div>
            <Label htmlFor="provider-toggle" className="text-base">
              Quero ser encontrado como prestador
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Seu perfil passa a aparecer na aba “Profissionais” da busca.
            </p>
          </div>
          <Switch
            id="provider-toggle"
            checked={isProvider}
            onCheckedChange={onToggleProvider}
          />
        </div>

        {isProvider ? (
          <fieldset className="grid gap-3">
            <legend className="text-sm font-bold">
              Categorias que você atende
            </legend>
            <p className="text-sm text-muted-foreground">
              Selecione quantas quiser, até {MAX_PROVIDER_CATEGORIES}.{' '}
              {selected.length} selecionada
              {selected.length === 1 ? '' : 's'}.
            </p>

            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              {categories.map((category) => {
                const checked = selected.includes(category.id)

                return (
                  <label
                    key={category.id}
                    htmlFor={`provider-category-${category.id}`}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition',
                      checked
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-accent',
                      !checked && reachedLimit && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <Checkbox
                      id={`provider-category-${category.id}`}
                      checked={checked}
                      disabled={!checked && reachedLimit}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <CategoryIcon
                      name={category.icon}
                      className="size-4 shrink-0 text-primary"
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={onSave} disabled={!isDirty || isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/account">Cancelar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
