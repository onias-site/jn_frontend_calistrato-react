import { RemotePreRegistration } from '@/data/usecases/login/remote-pre-registration'
import { PreRegistrationRepository } from '@/domain/usecases/login/pre-registration'
import { makeLoginApiUrl, makeAxiosHttpClient } from '@/main/factories/http'


export const makeRemotePreRegistration = (email: string | null): PreRegistrationRepository =>
new RemotePreRegistration(makeLoginApiUrl(`/login/${email}/pre-registration`), makeAxiosHttpClient())
