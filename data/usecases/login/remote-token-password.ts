import { InvalidCredentialsError,UnexpectedError } from "@/domain/errors";
import { TokenPasswordRepository } from "@/domain/usecases/login/token-password";
import { HttpClient, HttpStatusCode } from "../../protocols/http/http-client";


export class RemoteTokenPassword implements TokenPasswordRepository {
    constructor(private readonly url: string, private readonly httpClient: HttpClient<TokenPasswordRepository.Model>) {}


    async tokenPassword(params: TokenPasswordRepository.Params):Promise<TokenPasswordRepository.Model> {
        const httpResponse = await this.httpClient.request({
            url: this.url,
            method: "post",
            body: params
        })
        switch (httpResponse.statusCode) {
            case HttpStatusCode.ok:
                return { status:httpResponse.statusCode, data: httpResponse.body };
            case HttpStatusCode.unauthorized:
                throw new InvalidCredentialsError();
            default:
                throw new UnexpectedError();
        }
    }
}
