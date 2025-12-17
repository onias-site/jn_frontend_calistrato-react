import { RemoteTokenLanguage } from '@/data/usecases/login/remote-token-language'
import { RemoteTokenPassword } from '@/data/usecases/login/remote-token-password'
import { TokenLanguageRepository } from '@/domain/usecases/login/token-language'
import { TokenPasswordRepository } from '@/domain/usecases/login/token-password'
import { makeApiUrl, makeAxiosHttpClient } from '@/main/factories/http'


export const makeRemoteTokenPassword = (email: string): TokenPasswordRepository =>
new RemoteTokenPassword(makeApiUrl(`/login/${email}/password`), makeAxiosHttpClient())
