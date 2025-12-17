import { RemoteEditVagas } from '@/data/usecases/vagas/remote-edit-vagas'
import { EditVagas } from '@/domain/usecases/vagas/edit-vagas'
import { makeApiUrl, makeAxiosHttpClient } from '@/main/factories/http'

//TODO -> alterar client para decorators de autenticação
export const makeRemoteEditVagas = (id: string): EditVagas =>
new RemoteEditVagas(makeApiUrl(`/vagas/${id}`), makeAxiosHttpClient())
