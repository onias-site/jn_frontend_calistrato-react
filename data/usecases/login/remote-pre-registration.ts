
import { InvalidCredentialsError,UnexpectedError } from "@/domain/errors";
import { PreRegistrationRepository } from "@/domain/usecases/login/pre-registration";
import { HttpClient, HttpStatusCode } from "../../protocols/http/http-client";


export class RemotePreRegistration implements PreRegistrationRepository {
    constructor(private readonly url: string, private readonly httpClient: HttpClient<PreRegistrationRepository.Model>) {}

    async registration(params: PreRegistrationRepository.Params):Promise<PreRegistrationRepository.Model> {
        const httpResponse = await this.httpClient.request({
            url: this.url,
            method: "post",
            body: params
        })
        switch (httpResponse.statusCode) {
            case HttpStatusCode.accepted:
                return { status: httpResponse.statusCode };
            case HttpStatusCode.unauthorized:
                throw new InvalidCredentialsError();
            default:
                throw new UnexpectedError();
        }
    }
}
