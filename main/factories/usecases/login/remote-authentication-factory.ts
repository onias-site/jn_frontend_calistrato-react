import { RemoteAuthentication } from '@/data/usecases/login/remote-authentication'
import { Authentication } from '@/domain/usecases/login/authentication'
import { makeLoginApiUrl, makeAxiosHttpClient } from '@/main/factories/http'


export const makeRemoteAuthentication = (email: string | null): Authentication =>
  new RemoteAuthentication(makeLoginApiUrl(`/login/${email}`), makeAxiosHttpClient())
