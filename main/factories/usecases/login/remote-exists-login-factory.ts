import { RemoteEmailExists } from '@/data/usecases/login/remote-email-exists'
import { EmailExistsRepository } from '@/domain/usecases/login/exists-email'
import { makeLoginApiUrl, makeAxiosHttpClient } from '@/main/factories/http'


export const makeRemoteEmailExists = (email: string | null): EmailExistsRepository =>
new RemoteEmailExists(makeLoginApiUrl(`/login/${email}/token`), makeAxiosHttpClient())
