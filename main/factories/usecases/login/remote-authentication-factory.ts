import { RemoteAuthentication } from '@/data/usecases/login/remote-authentication'
import { Authentication } from '@/domain/usecases/login/authentication'
import { makeApiUrl, makeAxiosHttpClient } from '@/main/factories/http'


export const makeRemoteAuthentication = (email: string | null): Authentication =>
  new RemoteAuthentication(makeApiUrl(`/login/${email}`), makeAxiosHttpClient())
