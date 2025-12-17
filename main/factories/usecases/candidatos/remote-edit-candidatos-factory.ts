import { RemoteEditCandidato } from '@/data/usecases/candidatos/remote-editar-candidato'
import { EditCandidato } from '@/domain/usecases/candidato/edit-canditato'
import { makeApiUrl, makeAxiosHttpClient } from '@/main/factories/http'

//TODO -> alterar client para decorators de autenticação
export const makeRemoteEditCandidato = (idCandidato: string): EditCandidato =>
new RemoteEditCandidato(makeApiUrl(`/candidatos/${idCandidato}`), makeAxiosHttpClient())
