import { createFileRoute } from '@tanstack/react-router'

import { AccountFormPage } from '@/components/account/account-form-page'
import { ProfileForm } from '@/components/account/profile-form'

export const Route = createFileRoute('/account_/profile')({
  component: EditarPerfil,
  head: () => ({ meta: [{ title: 'Editar perfil | DodoPlace' }] }),
})

function EditarPerfil() {
  return (
    <AccountFormPage
      title="Editar perfil"
      description="Foto, nome e apresentação que aparecem para outros usuários."
      redirect="/account/profile"
    >
      {(user) => <ProfileForm user={user} />}
    </AccountFormPage>
  )
}
