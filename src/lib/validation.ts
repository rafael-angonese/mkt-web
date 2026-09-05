import { z } from 'zod'

const email = z
  .email('Informe um e-mail válido.')
  .max(254, 'O e-mail pode ter no máximo 254 caracteres.')

const name = z
  .string()
  .trim()
  .min(2, 'O nome precisa ter ao menos 2 caracteres.')
  .max(120, 'O nome pode ter no máximo 120 caracteres.')

export const signInSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail.').pipe(email),
})

export const signUpSchema = z.object({
  name,
  email: z.string().min(1, 'Informe seu e-mail.').pipe(email),
})

const optionalText = (max: number, message: string) =>
  z.union([z.literal(''), z.string().trim().max(max, message)])

export const profileSchema = z.object({
  name: z.union([z.literal(''), name]),
  headline: optionalText(
    120,
    'A chamada pode ter no máximo 120 caracteres.',
  ),
  bio: optionalText(2000, 'A apresentação pode ter no máximo 2000 caracteres.'),
})

export const contactsSchema = z.object({
  whatsapp: z.union([
    z.literal(''),
    z
      .string()
      .trim()
      .regex(
        /^\+?[0-9\s()-]{10,20}$/,
        'Informe o WhatsApp com DDD, ex.: (49) 99123-4567.',
      ),
  ]),
  instagram: z.union([
    z.literal(''),
    z
      .string()
      .trim()
      .regex(
        /^@?[A-Za-z0-9._]{1,30}$/,
        'Informe apenas o @ do perfil, sem link.',
      ),
  ]),
  website: z.union([
    z.literal(''),
    z.url('Informe uma URL válida, começando com https://'),
  ]),
})

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type ProfileValues = z.infer<typeof profileSchema>
export type ContactsValues = z.infer<typeof contactsSchema>
