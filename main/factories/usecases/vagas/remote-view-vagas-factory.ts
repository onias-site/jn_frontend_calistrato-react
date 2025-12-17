import { RemoteViewVagas } from '@/data/usecases/vagas/remote-view-vagas'
import { ViewVagas } from '@/domain/usecases/vagas/view-vagas'
import { makeApiUrl, makeAxiosHttpClient } from '@/main/factories/http'

//TODO -> alterar client para decorators de autenticação
export const makeRemoteViewVagas = (): ViewVagas =>
new RemoteViewVagas(makeApiUrl(``), makeAxiosHttpClient())
