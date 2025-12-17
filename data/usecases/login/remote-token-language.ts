import { InvalidCredentialsError,UnexpectedError } from "@/domain/errors";
import { TokenLanguageRepository } from "@/domain/usecases/login/token-language";
import { HttpClient, HttpStatusCode } from "../../protocols/http/http-client";


export class RemoteTokenLanguage implements TokenLanguageRepository {
    constructor(private readonly url: string, private readonly httpClient: HttpClient<TokenLanguageRepository.Model>) {}


    async tokenLanguage(params: TokenLanguageRepository.Params):Promise<TokenLanguageRepository.Model> {
        const httpResponse = await this.httpClient.request({
            url: this.url,
            method: "post",
            body: params
        })
        switch (httpResponse.statusCode) {
            case HttpStatusCode.ok:
                return { status: httpResponse.statusCode };
            case HttpStatusCode.unauthorized:
                throw new InvalidCredentialsError();
            default:
                throw new UnexpectedError();
        }
    }
}
