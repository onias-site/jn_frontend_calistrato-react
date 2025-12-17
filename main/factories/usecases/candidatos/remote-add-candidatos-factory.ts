import { RemoteAddCandidato } from '@/data/usecases/candidatos/remote-cadastro-candidato'
import { AddCandidato } from '@/domain/usecases/candidato/add-candidato'
import { makeApiUrl, makeAxiosHttpClient } from '@/main/factories/http'

//TODO -> alterar client para decorators de autenticação
export const makeRemoteAddCandidato = (): AddCandidato =>
new RemoteAddCandidato(makeApiUrl(`/candidatos`), makeAxiosHttpClient())
