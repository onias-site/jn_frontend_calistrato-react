import { RemoteTokenLanguage } from '@/data/usecases/login/remote-token-language'
import { TokenLanguageRepository } from '@/domain/usecases/login/token-language'
import { makeLoginApiUrl, makeAxiosHttpClient } from '@/main/factories/http'


export const makeRemoteTokenLanguage = (email: string | null, language: string): TokenLanguageRepository =>  {
    return new RemoteTokenLanguage(makeLoginApiUrl(`/login/${email}/token/language/${language}`), makeAxiosHttpClient())
}
