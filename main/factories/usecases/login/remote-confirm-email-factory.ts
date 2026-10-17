import { RemoteConfirmEmail } from '@/data/usecases/login/remote-confirm-email'
import { ConfirmEmailRepository } from '@/domain/usecases/login/confirm-email'
import { makeLoginApiUrl, makeAxiosHttpClient } from '@/main/factories/http'


export const makeRemoteConfirmEmail = (email: string | null): ConfirmEmailRepository =>
new RemoteConfirmEmail(makeLoginApiUrl(`/login/${email}/token`), makeAxiosHttpClient())
