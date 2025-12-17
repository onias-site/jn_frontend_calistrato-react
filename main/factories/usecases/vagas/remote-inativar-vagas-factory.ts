
import { RemoteInativarVagas } from '@/data/usecases/vagas/remote-inativar-vagas'
import { InativarVagas } from '@/domain/usecases/vagas/inativar-vagas'
import { makeApiUrl, makeAxiosHttpClient } from '@/main/factories/http'

export const makeRemoteInativarVagas = (id: string | null): InativarVagas =>
new RemoteInativarVagas(makeApiUrl(`/vagas/${id}`), makeAxiosHttpClient())
