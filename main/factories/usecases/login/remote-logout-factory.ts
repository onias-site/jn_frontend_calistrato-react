import { RemoteEmailExists } from '@/data/usecases/login/remote-email-exists'
import { RemoteLogout } from '@/data/usecases/login/remote-logout'
import { EmailExistsRepository } from '@/domain/usecases/login/exists-email'
import { LogoutRepository } from '@/domain/usecases/login/logout'
import { makeApiUrl, makeAxiosHttpClient } from '@/main/factories/http'


export const makeRemoteLogout = (email: string): LogoutRepository =>
new RemoteLogout(makeApiUrl(`/login/${email}`), makeAxiosHttpClient())
