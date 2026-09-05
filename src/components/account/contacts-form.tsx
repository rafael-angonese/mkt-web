import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

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
import type { User } from '@/lib/auth'
import { applyApiErrors } from '@/lib/form-errors'
import { type ContactsValues, contactsSchema } from '@/lib/validation'
import { useAuth } from '@/providers/auth-context'

const FIELDS = ['whatsapp', 'instagram', 'website'] as const

export function ContactsForm({ user }: { user: User }) {
  const navigate = useNavigate()
  const { updateProfile } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<ContactsValues>({
    resolver: zodResolver(contactsSchema),
    defaultValues: {
      whatsapp: user.whatsapp ?? '',
      instagram: user.instagram ? `@${user.instagram}` : '',
      website: user.website ?? '',
    },
  })

  async function onSubmit(values: ContactsValues) {
    setFormError(null)

    try {
      await updateProfile({
        whatsapp: values.whatsapp.trim() || null,
        instagram: values.instagram.trim() || null,
        website: values.website.trim() || null,
      })
      toast.success('Contatos atualizados.')
      navigate({ to: '/account' })
    } catch (error) {
      setFormError(applyApiErrors(error, form.setError, FIELDS))
    }
  }

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
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
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="tel"
                      placeholder="(49) 99123-4567"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    É por aqui que os clientes vão falar com você.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input placeholder="@seuperfil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="url"
                      placeholder="https://seusite.com.br"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || !form.formState.isDirty}
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
