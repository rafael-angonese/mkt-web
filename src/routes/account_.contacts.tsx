import { createFileRoute } from '@tanstack/react-router'

import { AccountFormPage } from '@/components/account/account-form-page'
import { ContactsForm } from '@/components/account/contacts-form'

export const Route = createFileRoute('/account_/contacts')({
  component: EditarContatos,
  head: () => ({ meta: [{ title: 'Editar contatos | DodoPlace' }] }),
})

function EditarContatos() {
  return (
    <AccountFormPage
      title="Editar contatos"
      description="É por aqui que os clientes falam com você."
      redirect="/account/contacts"
    >
      {(user) => <ContactsForm user={user} />}
    </AccountFormPage>
  )
}
