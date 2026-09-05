import { createFileRoute } from '@tanstack/react-router'

import { AccountFormPage } from '@/components/account/account-form-page'
import { ProviderForm } from '@/components/account/provider-form'

export const Route = createFileRoute('/account_/provider')({
  component: PerfilPrestador,
  head: () => ({ meta: [{ title: 'Prestador de serviço | DodoPlace' }] }),
})

function PerfilPrestador() {
  return (
    <AccountFormPage
      title="Prestador de serviço"
      description="Ative para aparecer na busca por profissionais e escolha as categorias que você atende."
      redirect="/account/provider"
    >
      {(user) => <ProviderForm user={user} />}
    </AccountFormPage>
  )
}
