
import { ConfirmEmailRepository } from "@/domain/usecases/login/confirm-email";
import { InvalidCredentialsError, UnexpectedError } from "@/domain/errors";
import { HttpClient, HttpStatusCode } from "../../protocols/http/http-client";
import { InvalidEmailError } from "@/domain/errors/invalid-email-error";
import { BlockedTokenError } from "@/domain/errors/blocked-token-error";
import { UserAlreadyLoggedError } from "@/domain/errors/user-already-logged-error";

export class RemoteConfirmEmail implements ConfirmEmailRepository {
    constructor(private readonly url: string, private readonly httpClient: HttpClient<ConfirmEmailRepository.Model>) {}

    async confirmEmail(params: ConfirmEmailRepository.Params): Promise<ConfirmEmailRepository.Model> {

        const httpResponse = await this.httpClient.request({
            url: this.url,
            method: 'post',
            body: params
        });
        switch (httpResponse.statusCode) {
            case HttpStatusCode.accepted:
                return { status: httpResponse.statusCode };
            case HttpStatusCode.unauthorized:
                throw new InvalidCredentialsError();
            case HttpStatusCode.badRequest:
                throw new InvalidEmailError();
            case HttpStatusCode.forbidden:
                throw new BlockedTokenError();
            case HttpStatusCode.conflict:
                throw new UserAlreadyLoggedError();
            default:
                throw new UnexpectedError();
        }
    }
}
