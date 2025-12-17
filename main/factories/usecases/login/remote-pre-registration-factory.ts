import { RemotePreRegistration } from '@/data/usecases/login/remote-pre-registration'
import { PreRegistrationRepository } from '@/domain/usecases/login/pre-registration'
import { makeApiUrl, makeAxiosHttpClient } from '@/main/factories/http'


export const makeRemotePreRegistration = (email: string | null): PreRegistrationRepository =>
new RemotePreRegistration(makeApiUrl(`/login/${email}/pre-registration`), makeAxiosHttpClient())
