import { RemoteAddVagas } from '@/data/usecases/vagas/remote-cadastro-vagas'
import { AddVagas } from '@/domain/usecases/vagas/add-vagas'
import { makeApiUrl, makeAxiosHttpClient } from '@/main/factories/http'

//TODO -> alterar client para decorators de autenticação
export const makeRemoteAddVagas = (): AddVagas =>
new RemoteAddVagas(makeApiUrl(`/vagas`), makeAxiosHttpClient())
