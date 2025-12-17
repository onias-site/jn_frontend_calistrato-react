import { RemoteDeleteVagas } from '@/data/usecases/vagas/remote-deletar-vagas'
import { DeleteVagas } from '@/domain/usecases/vagas/deletar-vagas'
import { makeApiUrl, makeAxiosHttpClient } from '@/main/factories/http'

export const makeRemoteDeletarVagas = (id: string): DeleteVagas =>
new RemoteDeleteVagas(makeApiUrl(`/vagas/${id}`), makeAxiosHttpClient())
