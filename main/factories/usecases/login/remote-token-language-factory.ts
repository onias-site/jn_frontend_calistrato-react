import { RemoteTokenLanguage } from '@/data/usecases/login/remote-token-language'
import { TokenLanguageRepository } from '@/domain/usecases/login/token-language'
import { makeApiUrl, makeAxiosHttpClient } from '@/main/factories/http'


export const makeRemoteTokenLanguage = (email: string | null, language: string): TokenLanguageRepository =>  {
    return new RemoteTokenLanguage(makeApiUrl(`/login/${email}/token/language/${language}`), makeAxiosHttpClient())
}
