import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { AvatarUploader } from '@/components/account/avatar-uploader'
import { CityCombobox } from '@/components/location/city-combobox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/text-area'
import type { User } from '@/lib/auth'
import { applyApiErrors } from '@/lib/form-errors'
import type { City } from '@/lib/locations'
import { type ProfileValues, profileSchema } from '@/lib/validation'
import { useAuth } from '@/providers/auth-context'

const FIELDS = ['name', 'headline', 'bio'] as const

export function ProfileForm({ user }: { user: User }) {
  const navigate = useNavigate()
  const { updateProfile } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [city, setCity] = useState<City | null>(user.city ?? null)
  const [isCityDirty, setIsCityDirty] = useState(false)

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? '',
      headline: user.headline ?? '',
      bio: user.bio ?? '',
    },
  })

  async function onSubmit(values: ProfileValues) {
    setFormError(null)

    try {
      await updateProfile({
        name: values.name.trim() || null,
        headline: values.headline.trim() || null,
        bio: values.bio.trim() || null,
        cityId: city?.id ?? null,
      })
      toast.success('Perfil atualizado.')
      navigate({ to: '/account' })
    } catch (error) {
      setFormError(applyApiErrors(error, form.setError, FIELDS))
    }
  }

  const canSave = form.formState.isDirty || isCityDirty

  return (
    <Card className="mt-6">
      <CardContent className="flex flex-col gap-6 pt-6">
        <AvatarUploader user={user} />

        <Separator />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            {formError ? (
              <Alert variant="danger">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" {...field} />
                  </FormControl>
                  <FormDescription>
                    É assim que você aparece para outros usuários.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chamada profissional</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex.: Eletricista predial · 12 anos de experiência"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Uma linha curta que resume o que você faz.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sobre você</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Conte sua experiência, seus diferenciais e a região onde atende."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-1.5">
              <Label htmlFor="profile-city">Cidade</Label>
              <CityCombobox
                id="profile-city"
                value={city}
                onChange={(next) => {
                  setCity(next)
                  setIsCityDirty(true)
                }}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || !canSave}
              >
                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button asChild type="button" variant="outline">
                <Link to="/account">Cancelar</Link>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
